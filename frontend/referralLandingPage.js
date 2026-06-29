// pages/ReferralLandingPage.js
import wixData from 'wix-data';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import { local } from 'wix-storage';

$w.onReady(async function () {
    console.log("Referral Landing Page: Started");

    // Handle refresh button click
    $w("#refreshButton").onClick(() => {
        console.log("Referral Landing Page: Refresh button clicked, reloading", { url: wixLocation.url });
        wixLocation.to(wixLocation.url); // Reload current URL
    });

    // Get the full URL and remove the protocol (https:// or http://)
    let referralUrl = wixLocation.url.replace(/^https?:\/\//, '');

    // Extract the core referral URL (up to ?utm_source=referral_program)
    const coreUrlMatch = referralUrl.match(/^(.+?\/referral\/[^?]+?\?utm_source=referral_program)/);
    if (!coreUrlMatch) {
        console.warn("Referral Landing Page: Invalid URL format or missing referral_program", { url: referralUrl });
        wixWindow.openLightbox("Error", { message: "Invalid referral URL format." });
        return;
    }

    // Use the matched core URL
    referralUrl = coreUrlMatch[1];

    // Check for referral path
    if (!referralUrl.includes("/referral/")) {
        console.warn("Referral Landing Page: No referral path in URL", { url: referralUrl });
        wixWindow.openLightbox("Error", { message: "No referral code provided." });
        return;
    }

    // Query the CMS with the cleaned referral URL
    const results = await wixData.query("MemberData")
        .eq("referralCode", referralUrl)
        .find();

    if (results.items.length === 0) {
        console.warn("Referral Landing Page: Invalid referral code", { url: referralUrl });
        wixWindow.openLightbox("Error", { message: "Invalid referral code." });
        return;
    }

    const referrer = results.items[0];
    if (referrer.subscriptionStatus !== "Active") {
        console.log("Referral Landing Page: Non-active referral", { referralCode: referrer.referralCode });
        wixWindow.openLightbox("ExpiredReferralLightbox");
        return;
    }

    console.log("Referral Landing Page: Valid referral", { referralCode: referrer.referralCode });
    local.setItem('referrerCode', referralUrl);
});
