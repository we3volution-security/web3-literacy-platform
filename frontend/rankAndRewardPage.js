import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { currentMember } from 'wix-members';
import { accounts } from 'wix-loyalty.v2';

$w.onReady(async function () {
    console.log("Loyalty Display: Started");

    try {
        // Check if user is logged in
        const member = await currentMember.getMember();
        if (!member) {
            console.warn("Loyalty Display: User not logged in");
            wixLocation.to("/sign-in");
            return;
        }

        const userId = member._id;
        let totalReferrals = 0;

        // Try to get loyalty points from Wix Loyalty Program
        try {
            const loyaltyAccount = await accounts.getCurrentMemberAccount();
            totalReferrals = loyaltyAccount.account.points?.balance || 0;
            console.log("Loyalty points fetched:", { totalReferrals });
        } catch (err) {
            console.error("Error fetching loyalty account:", err);
            // Fallback to MemberData CMS
            try {
                const memberData = await wixData.query("MemberData")
                    .eq("_owner", userId)
                    .find({ suppressAuth: true });
                if (memberData.items.length > 0) {
                    totalReferrals = memberData.items[0].totalReferrals || 0;
                    console.log("Fetched totalReferrals from MemberData:", { totalReferrals });
                } else {
                    console.warn("No MemberData found for user:", { userId });
                }
            } catch (cmsErr) {
                console.error("Error querying MemberData:", cmsErr);
            }
        }

        // Set loyalty level and icon
        let loyaltyLevel = "Pioneer";
        let levelIconUrl = "https://static.wixstatic.com/media/65eab3_0d546ba253c547bc883556054a1c17d6~mv2.jpg"; // Pioneer icon
        if (totalReferrals >= 100) {
            loyaltyLevel = "Pi Visionary";
            levelIconUrl = "https://static.wixstatic.com/media/65eab3_49b9efb5233541c4bc423ebc4058942c~mv2.jpg";
        } else if (totalReferrals >= 50) {
            loyaltyLevel = "Chain Architect";
            levelIconUrl = "https://static.wixstatic.com/media/65eab3_039a30b82bef482491138302aec0437d~mv2.jpg";
        } else if (totalReferrals >= 25) {
            loyaltyLevel = "Node Builder";
            levelIconUrl = "https://static.wixstatic.com/media/65eab3_0b5fad5cd4cd46d2b5ef134c43a8bdbe~mv2.jpg";
        } else if (totalReferrals >= 10) {
            loyaltyLevel = "Ambassador";
            levelIconUrl = "https://static.wixstatic.com/media/65eab3_69643c6d66734193a6aa3dd9940caf96~mv2.jpg";
        } else if (totalReferrals >= 5) {
            loyaltyLevel = "Contributor";
            levelIconUrl = "https://static.wixstatic.com/media/65eab3_3f7cb43952684b8299196c29330996f0~mv2.jpg";
        }

        // Update UI elements
        $w("#loyaltyLevel").text = loyaltyLevel;
        $w("#levelIcon").src = levelIconUrl;

    } catch (err) {
        console.error("Unexpected error:", err);
        // Default to Pioneer on any unexpected error
        $w("#loyaltyLevel").text = "Pioneer";
        $w("#levelIcon").src = "https://static.wixstatic.com/media/65eab3_95c3c31bc5724737a3b4d77c0647c955~mv2.png";
    }
});
