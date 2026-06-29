// pages/PiCodeLookup.js
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { currentMember } from 'wix-members';
import wixWindow from 'wix-window-frontend';

$w.onReady(async function () {
    $w("#resultText").hide();
    $w("#resultText2").hide();

    $w("#copyButton").onClick(async () => {
        try {
            const inviteCode = $w("#inviteCodeResult").text;
            if (!inviteCode || inviteCode === "None") {
                console.warn("Pi Code Lookup: No invite code to copy");
                $w("#resultText").text = "No invite code available to copy.";
                $w("#resultText").show();
                return;
            }
            await wixWindow.copyToClipboard(inviteCode);
            console.log("Pi Code Lookup: Copied invite code", { inviteCode });
            $w("#resultText2").text = "Invite code copied to clipboard!";
            $w("#resultText2").show();
            setTimeout(() => {
                $w("#resultText2").hide();
            }, 3000);
        } catch (error) {
            console.error("Pi Code Lookup: Copy error", { message: error.message });
            $w("#resultText2").text = "Failed to copy invite code. Please select and copy manually.";
            $w("#resultText2").show();
        }
    });

    try {
        const member = await currentMember.getMember();
        if (!member) {
            console.warn("Pi Code Lookup: User not logged in");
            wixLocation.to("/login");
            return;
        }

        const email = member.loginEmail;
        console.log("Pi Code Lookup: Processing user", { email });

        // Find ReferralTemp by email
        const tempResults = await wixData.query("ReferralTemp")
            .eq("email", email)
            .find({ suppressAuth: true });

        // Find MemberData by email
        const memberResults = await wixData.query("MemberData")
            .eq("email", email)
            .find({ suppressAuth: true });
        if (memberResults.items.length === 0) {
            console.warn("Pi Code Lookup: No MemberData entry", { email });
            $w("#resultText").text = "No data found for your account. See below.";
            $w("#resultText").show();
            return;
        }

        const user = memberResults.items[0];
        let referrerCode = null;

        if (tempResults.items.length > 0) {
            referrerCode = tempResults.items[0].referrerCode;
            console.log("Pi Code Lookup: ReferralTemp found", { email, referrerCode });

            if (!user.referrerCode) {
                await wixData.update("MemberData", {
                    _id: user._id,
                    email: email,
                    referrerCode: referrerCode,
                    subscriptionStatus: user.subscriptionStatus || 'Inactive',
                    name: user.name || undefined,
                    inviteCode: user.inviteCode || undefined,
                    referralCode: user.referralCode || undefined,
                    "0To100": user["0To100"] || undefined,
                    totalReferrals: user.totalReferrals || 0,
                    monthlyPlansSold: user.monthlyPlansSold || 0,
                    yearlyPlansSold: user.yearlyPlansSold || 0,
                    referralTarget: user.referralTarget || 0,
                    actualSignups: user.actualSignups || 0,
                    durationMonths: user.durationMonths || 0,
                    durationYears: user.durationYears || 0
                }, { suppressAuth: true });
                console.log("Pi Code Lookup: Updated MemberData", { email, referrerCode });
            } else {
                console.log("Pi Code Lookup: ReferrerCode already set", { email, referrerCode: user.referrerCode });
                referrerCode = user.referrerCode; // Use existing referrerCode
            }
        } else if (user.referrerCode) {
            referrerCode = user.referrerCode;
            console.log("Pi Code Lookup: No ReferralTemp, using MemberData referrerCode", { email, referrerCode });
        } else {
            console.warn("Pi Code Lookup: No ReferralTemp or MemberData referrerCode", { email });
            $w("#resultText").text = "No referral data found. See below.";
            $w("#resultText").show();
            return;
        }

        // Find referrer for display
        const referrerResults = await wixData.query("MemberData")
            .eq("referralCode", referrerCode)
            .find({ suppressAuth: true });
        if (referrerResults.items.length > 0) {
            const referrer = referrerResults.items[0];
            if (referrer.subscriptionStatus !== "Active") {
                console.warn("Pi Code Lookup: Referrer not active", { referrerCode });
                $w("#resultText").text = "Referrer not currently subscribed. See below.";
                $w("#resultText").show();
                return;
            }
            $w("#nameResult").text = referrer.name || "Unknown";
            $w("#inviteCodeResult").text = referrer.inviteCode || "None";
            console.log("Pi Code Lookup: Displayed referrer info", { email, referrerCode });
        } else {
            console.warn("Pi Code Lookup: No referrer found", { referrerCode });
            $w("#resultText").text = "No referral data found. See below for help.";
            $w("#resultText").show();
        }
    } catch (error) {
        console.error("Pi Code Lookup: Error", { message: error.message });
        $w("#resultText").text = "An error occurred. Please try again later.";
        $w("#resultText").show();
    }
});
