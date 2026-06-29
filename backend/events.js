// backend/events.js
import wixData from 'wix-data';
import { getPlan } from 'wix-pricing-plans-backend';

export function wixMembers_onMemberCreated(event) {
    try {
        console.log("Member created event:", JSON.stringify(event, null, 2));
        const userId = event.entity._id;
        const email = event.entity.loginEmail || '';
        console.log("Member signup:", { userId, email });

        if (!email || !userId) {
            console.warn("Member signup - Missing email or userId:", { email, userId });
            return;
        }

        // Insert new MemberData record
        wixData.insert("MemberData", {
            _owner: userId,
            email: email,
            subscriptionStatus: "Inactive",
            totalReferrals: 0,
            monthlyPlansSold: 0,
            yearlyPlansSold: 0,
            referralTarget: 0,
            actualSignups: 0,
            durationMonths: 0,
            durationYears: 0
        }, { suppressAuth: true })
            .then(() => {
                console.log("MemberData created for:", { userId, email });
            })
            .catch(err => {
                console.error("Error creating MemberData:", err);
            });
    } catch (err) {
        console.error("Member created event error:", err);
    }
}

export async function wixPricingPlans_onOrderPurchased(event) {
    try {
        const order = event.data.order;
        console.log("Plan purchased:", { orderId: order._id, userId: order.buyer.memberId, planId: order.planId });
        const userId = order.buyer.memberId;
        const email = order.contactDetails?.email || '';

        if (!userId) {
            console.warn("Plan purchase: Missing userId", { orderId: order._id });
            return;
        }

        // Get plan details
        const plan = await getPlan(order.planId);
        console.log("Plan details:", JSON.stringify(plan, null, 2));

        // Determine plan type
        const planType = plan.pricing?.subscription?.cycleDuration?.unit === 'YEAR' ? 'Yearly' : 'Monthly';

        // Fallback: Map plan IDs
        const planTypeMap = {
            'bed6347a-d880-4dd2-a879-8deb81f8f55c': 'Monthly',
            '91b06808-ca01-493c-b4ea-e3cf6a34fe22': '3Month',
            '9544c1ec-9c71-4bb4-8238-2920545ebf5b': 'Yearly'
        };
        const finalPlanType = planTypeMap[order.planId] || planType;

        // Update MemberData for the buyer
        const memberResult = await wixData.query("MemberData")
            .eq("_owner", userId)
            .find({ suppressAuth: true });

        if (memberResult.items.length === 0) {
            console.warn("Plan purchase: No MemberData found", { userId, email });
            return;
        }

        const member = memberResult.items[0];
        await wixData.update("MemberData", {
            _id: member._id,
            _owner: member._owner,
            email: member.email || '',
            subscriptionStatus: "Active",
            referrerCode: member.referrerCode || undefined,
            name: member.name || undefined,
            inviteCode: member.inviteCode || undefined,
            referralCode: member.referralCode || undefined,
            "0To100": member["0To100"] || undefined,
            totalReferrals: member.totalReferrals || 0,
            monthlyPlansSold: member.monthlyPlansSold || 0,
            yearlyPlansSold: member.yearlyPlansSold || 0,
            referralTarget: member.referralTarget || 0,
            actualSignups: member.actualSignups || 0,
            durationMonths: member.durationMonths || 0,
            durationYears: member.durationYears || 0
        }, { suppressAuth: true });

        console.log("MemberData updated to Active for user:", userId);

        // Increment referrer's plan counts
        if (member.referrerCode) {
            const referrerResult = await wixData.query("MemberData")
                .eq("referralCode", member.referrerCode)
                .find({ suppressAuth: true });

            if (referrerResult.items.length > 0) {
                const referrer = referrerResult.items[0];
                const updateData = {
                    _id: referrer._id,
                    _owner: referrer._owner,
                    email: referrer.email || '',
                    subscriptionStatus: referrer.subscriptionStatus || 'Inactive',
                    referrerCode: referrer.referrerCode || undefined,
                    name: referrer.name || undefined,
                    inviteCode: referrer.inviteCode || undefined,
                    referralCode: referrer.referralCode || undefined,
                    "0To100": referrer["0To100"] || undefined,
                    totalReferrals: referrer.totalReferrals || 0,
                    monthlyPlansSold: (referrer.monthlyPlansSold || 0) + (finalPlanType === 'Monthly' ? 1 : 0),
                    yearlyPlansSold: (referrer.yearlyPlansSold || 0) + (finalPlanType === 'Yearly' ? 1 : 0),
                    referralTarget: referrer.referralTarget || 0,
                    actualSignups: referrer.actualSignups || 0,
                    durationMonths: referrer.durationMonths || 0,
                    durationYears: referrer.durationYears || 0
                };

                await wixData.update("MemberData", updateData, { suppressAuth: true });
                console.log("Referrer plan counts updated:", { referrerId: referrer._owner, planType: finalPlanType });
            }
        }
    } catch (err) {
        console.error("Plan purchase event error:", err);
    }
}

export function wixPricingPlans_onOrderEnded(event) {
    try {
        const orderStatus = event.data.order.status;
        console.log("Order ended:", { orderId: event.data.order._id, status: orderStatus });

        if (orderStatus !== "CANCELED" && orderStatus !== "EXPIRED") {
            console.log("Skipping order with status:", orderStatus);
            return;
        }

        const userId = event.data.order.buyer.memberId;
        console.log("Processing userId:", userId);

        if (!userId) {
            console.error("No valid userId found in event");
            return;
        }

        wixData.query("MemberData")
            .eq("_owner", userId)
            .find({ suppressAuth: true })
            .then(results => {
                if (results.items.length > 0) {
                    const item = results.items[0];
                    console.log("Updating user:", userId);
                    return wixData.update("MemberData", {
                        _id: item._id,
                        _owner: item._owner,
                        email: item.email || '',
                        subscriptionStatus: "Expired",
                        referrerCode: item.referrerCode || undefined,
                        name: item.name || undefined,
                        inviteCode: item.inviteCode || undefined,
                        referralCode: item.referralCode || undefined,
                        "0To100": item["0To100"] || undefined,
                        totalReferrals: item.totalReferrals || 0,
                        monthlyPlansSold: item.monthlyPlansSold || 0,
                        yearlyPlansSold: item.yearlyPlansSold || 0,
                        referralTarget: item.referralTarget || 0,
                        actualSignups: item.actualSignups || 0,
                        durationMonths: item.durationMonths || 0,
                        durationYears: item.durationYears || 0
                    }, { suppressAuth: true });
                } else {
                    console.log("No matching subscriber found for _owner:", userId);
                }
            })
            .then(() => {
                console.log("subscriptionStatus updated to Expired for user:", userId);
            })
            .catch(err => {
                console.error("Order ended event error for user:", userId, err);
            });
    } catch (err) {
        console.error("Order ended event error:", err);
    }
}
