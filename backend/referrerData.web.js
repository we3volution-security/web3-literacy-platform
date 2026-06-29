// backend/referrerData.web.js
import wixData from 'wix-data';
import { currentMember } from 'wix-members-backend';

export async function getReferrerData() {
    try {
        const member = await currentMember.getMember();
        if (!member) {
            return { error: 'Please log in to view the invite code.' };
        }

        const userId = member._id;
        console.log("Fetching referrer data for user ID:", userId);

        const userData = await wixData.query("MemberData")
            .eq("_owner", userId)
            .find();
        console.log("UserData query result:", userData.items);

        if (userData.items.length === 0) {
            return { error: 'No MemberData record found.' };
        }

        const referrerCode = userData.items[0].referrerCode;
        console.log("User's referrerCode:", referrerCode);
        if (!referrerCode) {
            return { error: 'No referrer code found.' };
        }

        const referrerData = await wixData.query("MemberData")
            .eq("referralCode", referrerCode)
            .find();
        console.log("ReferrerData query result:", referrerData.items);

        if (referrerData.items.length === 0) {
            return { error: 'No referrer found.' };
        }

        const inviteCode = referrerData.items[0].inviteCode;
        const name = referrerData.items[0].name || ''; // Allow empty name
        console.log("Referrer name:", name, "InviteCode:", inviteCode);

        // Return partial data if available
        let message = '';
        if (name && inviteCode) {
            message = `You were invited to Pi by: ${name}, Your Signup Invite Code is: ${inviteCode}`;
        } else if (name) {
            message = `You were invited to Pi by: ${name}, No invite code available.`;
        } else if (inviteCode) {
            message = `Your Signup Invite Code is: ${inviteCode}, No referrer name available.`;
        } else {
            return { error: 'Referrer has no invite code or name.' };
        }

        return {
            referrerName: name,
            referrerInviteCode: inviteCode,
            message: message
        };
    } catch (err) {
        console.error("Error fetching referrer data:", err);
        return { error: 'Error retrieving referrer data.' };
    }
}
