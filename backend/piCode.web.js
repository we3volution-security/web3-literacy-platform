// backend/piCode.js
import wixData from 'wix-data';
import { Permissions, webMethod } from 'wix-web-module';

export const getPiInviteDetails = webMethod(Permissions.Anyone, async (referralCode) => {
    let item;
    try {
        if (!referralCode || typeof referralCode !== 'string') {
            console.log("Invalid referralCode:", referralCode);
            return { success: false, error: "Please enter a valid referral code." };
        }

        const results = await wixData.query("MemberData")
            .eq("referralCode", referralCode.trim())
            .find();
        console.log("CMS Query Results:", results);

        if (results.items.length === 0) {
            console.log("No matching referral code:", referralCode);
            return { success: false, error: "No matching referral code found." };
        }

        item = results.items[0];
        console.log("Item:", item);

        if (item.subscriptionStatus !== "Active") {
            console.log("Inactive subscription:", item.subscriptionStatus);
            return { success: false, error: "Referrer is not an active subscriber." };
        }

        console.log("Returning success:", { inviteCode: item.inviteCode, name: item.name });
        return {
            success: true,
            inviteCode: item.inviteCode || "N/A",
            name: item.name || "N/A"
        };
    } catch (err) {
        console.error("Error:", err);
        if (item && item.subscriptionStatus === "Active") {
            console.log("Fallback success:", { inviteCode: item.inviteCode, name: item.name });
            return {
                success: true,
                inviteCode: item.inviteCode || "N/A",
                name: item.name || "N/A"
            };
        }
        return { success: false, error: "Server error: " + err.message };
    }
});


