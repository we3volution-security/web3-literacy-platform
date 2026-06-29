// backend/jobs.js
import wixData from 'wix-data';

export async function deleteOldReferralTemp() {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        console.log("Deleting ReferralTemp entries older than", { date: sixMonthsAgo });

        const results = await wixData.query("ReferralTemp")
            .lt("_createdDate", sixMonthsAgo)
            .find({ suppressAuth: true });

        for (const item of results.items) {
            await wixData.remove("ReferralTemp", item._id, { suppressAuth: true });
            console.log("Deleted ReferralTemp entry", { id: item._id, email: item.email });
        }
        console.log("ReferralTemp cleanup completed", { deletedCount: results.items.length });
    } catch (err) {
        console.error("Error deleting old ReferralTemp entries", { message: err.message });
    }
}
