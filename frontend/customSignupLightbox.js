// pages/CustomSignupLightbox.js
import wixData from 'wix-data';
import wixWindow from 'wix-window';
import { local } from 'wix-storage';

$w.onReady(function () {
    $w("#submitButton").onClick(async () => {
        try {
            const email = $w("#emailInput").value;
            if (!email) {
                console.warn("Custom Signup Lightbox: No email provided");
                // Rely on Wix form validation
                return;
            }

            const referrerCode = local.getItem('referrerCode');
            if (!referrerCode) {
                console.warn("Custom Signup Lightbox: No referrer code found");
                // Rely on Wix form validation or proceed
                return;
            }

            // Store in ReferralTemp
            await wixData.insert("ReferralTemp", {
                email: email,
                referrerCode: referrerCode
            });
            console.log("Custom Signup Lightbox: Stored in ReferralTemp", { email });
        } catch (error) {
            console.error("Custom Signup Lightbox: Error", { message: error.message });
        }
    });
});
