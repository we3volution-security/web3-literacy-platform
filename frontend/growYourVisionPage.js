import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { currentMember } from 'wix-members';
import wixWindow from 'wix-window';
import { accounts } from 'wix-loyalty.v2';

$w.onReady(async function () {
    console.log("Grow Your Vision: Started");

    try {
        // Check if user is logged in
        const member = await currentMember.getMember();
        if (!member) {
            console.warn("Grow Your Vision: User not logged in");
            wixLocation.to("/sign-in");
            return;
        }

        const userId = member._id;
        const memberData = await wixData.query("MemberData")
            .eq("_owner", userId)
            .find({ suppressAuth: true });

        if (memberData.items.length === 0) {
            console.warn("Grow Your Vision: No MemberData found", { userId });
            $w("#errorText").text = "User data not found.";
            $w("#errorText").show();
            return;
        }

        let user = memberData.items[0];
        const referralCode = user.referralCode;
        if (!referralCode) {
            console.warn("Grow Your Vision: No referralCode", { userId });
            $w("#totalReferrals").text = "0";
            $w("#referralTarget").value = "0";
            $w("#actualSignups").value = "0";
            $w("#durationMonths").value = "0";
            $w("#durationYears").value = "0";
            return;
        }

        // Get loyalty points from Wix Loyalty Program
        let totalReferrals = 0;
        try {
            const loyaltyAccount = await accounts.getCurrentMemberAccount();
            totalReferrals = loyaltyAccount.account.points.balance || 0;
            console.log("Loyalty points fetched:", { userId, totalReferrals });
        } catch (err) {
            console.error("Error fetching loyalty points:", err);
            totalReferrals = user.totalReferrals || 0; // Fallback to CMS value
        }

        // Update MemberData CMS with loyalty points
        await wixData.update("MemberData", {
            _id: user._id,
            _owner: user._owner,
            email: user.email || '',
            subscriptionStatus: user.subscriptionStatus || 'Inactive',
            referrerCode: user.referrerCode || undefined,
            name: user.name || undefined,
            inviteCode: user.inviteCode || undefined,
            referralCode: user.referralCode || undefined,
            "0To100": user["0To100"] || undefined,
            totalReferrals: totalReferrals,
            monthlyPlansSold: user.monthlyPlansSold || 0,
            yearlyPlansSold: user.yearlyPlansSold || 0,
            referralTarget: user.referralTarget || 0,
            actualSignups: user.actualSignups || 0,
            durationMonths: user.durationMonths || 0,
            durationYears: user.durationYears || 0
        }, { suppressAuth: true });

        // Refresh user data after update
        const refreshedData = await wixData.query("MemberData")
            .eq("_owner", userId)
            .find({ suppressAuth: true });
        user = refreshedData.items[0];

        // Set loyalty level and icon
        let loyaltyLevel = "Pioneer";
        let levelIconUrl = "https://static.wixstatic.com/media/65eab3_95c3c31bc5724737a3b4d77c0647c955~mv2.png"; // Pioneer icon
        if (user.totalReferrals >= 100) {
            loyaltyLevel = "Pi Visionary";
            levelIconUrl = "https://static.wixstatic.com/media/65eab3_6783f36c69ea41399821daba7b85e823~mv2.png";
        } else if (user.totalReferrals >= 50) {
            loyaltyLevel = "Chain Architect";
            levelIconUrl = "https://static.wixstatic.com/media/65eab3_a6138a8799274a6081c9045b9da4d0c6~mv2.png";
        } else if (user.totalReferrals >= 25) {
            loyaltyLevel = "Node Builder";
            levelIconUrl = "https://static.wixstatic.com/media/65eab3_06ffc16a06074fe4a7f28ec0aa523a6f~mv2.png";
        } else if (user.totalReferrals >= 10) {
            loyaltyLevel = "Ambassador";
            levelIconUrl = "https://static.wixstatic.com/media/65eab3_b986786e7d284f309fa7670e605bf126~mv2.png";
        } else if (user.totalReferrals >= 5) {
            loyaltyLevel = "Contributor";
            levelIconUrl = "https://static.wixstatic.com/media/65eab3_511bfafe6b9e453d87127e2933b6a42b~mv2.png";
        }
        $w("#loyaltyLevel").text = `${loyaltyLevel}`;
        $w("#levelIcon").src = levelIconUrl;

        // Display metrics
        $w("#totalReferrals").text = (user.totalReferrals || 0).toString();
        $w("#referralTarget").value = (user.referralTarget || 0).toString();
        $w("#actualSignups").value = (user.actualSignups || 0).toString();
        $w("#durationMonths").value = (user.durationMonths || 0).toString();
        $w("#durationYears").value = (user.durationYears || 0).toString();
        // Display user details
        $w("#nameText").text = user.name || "N/A";
        $w("#piInviteCodeText").text = user.inviteCode || "N/A";
        $w("#we3ReferralCodeText").text = user.referralCode || "N/A";

        // Set referral link (ensure https://)
        const longReferralLink = user.referralCode.startsWith("www.")
            ? `https://${user.referralCode}`
            : user.referralCode || "https://www.we3volution.com/referral/default?utm_source=referral_program";

        // Social media post templates (15 diverse, friend-like options)
        const postTemplates = [
            `Join the Web3 revolution with We3volution! Learn crypto, mine Pi, and grow your network. Use my link: ${longReferralLink} 🚀 #We3volution #Web3`,
            `Ready for Web3? Join We3volution, master crypto, and mine Pi daily! My link: ${longReferralLink} 🌍 #CryptoRevolution`,
            `Be a Web3 pioneer with We3volution! Free course, free crypto mining, and more. Join now: ${longReferralLink} 💪 #We3volution`,
            `Unlock Web3 with We3volution! Learn, mine Pi, and earn crypto. Start here: ${longReferralLink} 🔥 #Web3 #Crypto`,
            `New to crypto? We3volution makes it easy to learn Web3 and mine you own asset. Too good to be true? Find out how easy it is! Join with my link: ${longReferralLink} 😎 #LearnCrypto`,
            `Future-proof your skills with We3volution! Mine crypto, explore Web3, and join the fun: ${longReferralLink} ✨ #Web3ForAll`,
            `Hey friends! Found this awesome site, We3volution, that teaches crypto & Web3. I’m mining Pi for free now! Join with my link: ${longReferralLink} 😄 #CryptoForAll`,
            `Yo, check out We3volution! It’s super easy to learn about crypto and start mining Pi. Use my link to get started: ${longReferralLink} 🤙 #We3volution`,
            `I was clueless about crypto, but We3volution changed that! Now I’m even mining crypto and loving it. Join me: ${longReferralLink} 💥 #LearnWeb3`,
            `Guys, We3volution is legit! Free crypto course and Pi mining. Get in on this with my link: ${longReferralLink} 🙌 #CryptoBeginner`,
            `Just started with We3volution and I’m hooked! Learning Web3 and mining Pi is so cool. Try it: ${longReferralLink} 🌟 #Web3Journey`,
            `Hey, want to dive into Web3? We3volution’s course is free, and you can mine Pi crypto too! Use my link: ${longReferralLink} 😊 #JoinTheFuture`,
            `Found a gem! We3volution teaches crypto basics and lets you mine Pi for free. Join with my link: ${longReferralLink} 🎉 #CryptoVibes`,
            `OMG, We3volution is making crypto so easy! I’m mining Pi and learning tons. Check it out: ${longReferralLink} 💸 #Web3ForEveryone`,
            `Friends, you gotta try We3volution! It’s a fun way to learn crypto and mine your own assets. So much easier than I thought! Start here: ${longReferralLink} 🚀 #GetIntoCrypto`
        ];
        // Set initial post randomly
        const randomIndex = Math.floor(Math.random() * postTemplates.length);
        $w("#socialPostInput").value = postTemplates[randomIndex];

        // Cycle through posts
        $w("#cyclePostButton").onClick(() => {
            const currentPost = $w("#socialPostInput").value;
            let nextIndex = (postTemplates.indexOf(currentPost) + 1) % postTemplates.length;
            if (postTemplates.length > 1) {
                while (nextIndex === postTemplates.indexOf(currentPost)) {
                    nextIndex = Math.floor(Math.random() * postTemplates.length);
                }
            }
            $w("#socialPostInput").value = postTemplates[nextIndex];
            $w("#copyFeedback").text = "New post loaded!";
            $w("#copyFeedback").show();
            setTimeout(() => $w("#copyFeedback").hide(), 2000);
        });

        // Copy social post
        $w("#copyPostButton").onClick(async () => {
            try {
                await wixWindow.copyToClipboard($w("#socialPostInput").value);
                $w("#copyFeedback").text = "Copied to clipboard!";
                $w("#copyFeedback").show();
                setTimeout(() => $w("#copyFeedback").hide(), 2000);
            } catch (err) {
                console.error("Copy to clipboard failed:", err);
                $w("#copyFeedback").text = "Failed to copy. Please select and copy manually.";
                $w("#copyFeedback").show();
                setTimeout(() => $w("#copyFeedback").hide(), 3000);
            }
        });

        // Download QR code (open in new tab)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(longReferralLink)}`;
        $w("#qrCodeImage").src = qrCodeUrl;

        // Copy QR code link
        $w("#copyQrButton").onClick(async () => {
            try {
                console.log("Copying QR link:", longReferralLink);
                await wixWindow.copyToClipboard(longReferralLink);
                $w("#copyFeedback").text = "Referral link copied!";
                $w("#copyFeedback").show();
                setTimeout(() => $w("#copyFeedback").hide(), 2000);
            } catch (err) {
                console.error("Copy QR link failed:", err);
                $w("#copyFeedback").text = "Failed to copy link. Please copy manually.";
                $w("#copyFeedback").show();
                setTimeout(() => $w("#copyFeedback").hide(), 3000);
            }
        });

        // Copy QR code API URL and redirect to order page
        $w("#orderBusinessCardButton").onClick(async () => {
            try {
                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(longReferralLink)}`;
                console.log("Copying QR code URL:", qrCodeUrl);
                await wixWindow.copyToClipboard(qrCodeUrl);
                $w("#copyFeedback").text = "QR code URL copied for your business card!";
                $w("#copyFeedback").show();
                setTimeout(() => $w("#copyFeedback").hide(), 2000);
                // Rely on Wix editor's link setting for redirection
            } catch (err) {
                console.error("Copy QR code URL failed:", err);
                $w("#copyFeedback").text = "Failed to copy QR code URL. Please copy manually.";
                $w("#copyFeedback").show();
                setTimeout(() => $w("#copyFeedback").hide(), 3000);
            }
        });

        // Calculate progress and weekly rate
        const referralTarget = user.referralTarget || 0;
        const actualSignups = user.actualSignups || 0;
        const durationMonths = user.durationMonths || 0;
        const durationYears = user.durationYears || 0;
        const displayCount = actualSignups > 0 ? actualSignups : totalReferrals;
        const progress = referralTarget > 0 ? Math.min((displayCount / referralTarget) * 100, 100) : 0;
        $w("#progressSlider").value = progress;

        const weeksRemaining = durationYears * 52 + durationMonths * 4.333;
        const referralsNeeded = referralTarget - displayCount;
        const weeklyRate = weeksRemaining > 0 ? (referralsNeeded / weeksRemaining).toFixed(1) : 0;
        $w("#weeklyRate").text = weeksRemaining > 0 ? `Need ${weeklyRate}/week to goal` : "No duration set";

        console.log("Grow Your Vision: Metrics displayed", {
            userId,
            totalReferrals,
            referralTarget,
            actualSignups,
            durationMonths,
            durationYears,
            progress,
            weeksRemaining,
            weeklyRate
        });

        // Handle input updates
        $w("#referralTarget").onChange(async () => {
            const newTarget = parseInt($w("#referralTarget").value) || 0;
            try {
                const refreshedData = await wixData.query("MemberData")
                    .eq("_owner", userId)
                    .find({ suppressAuth: true });
                user = refreshedData.items[0];

                await wixData.update("MemberData", {
                    _id: user._id,
                    _owner: user._owner,
                    email: user.email || '',
                    subscriptionStatus: user.subscriptionStatus || 'Inactive',
                    referrerCode: user.referrerCode || undefined,
                    name: user.name || undefined,
                    inviteCode: user.inviteCode || undefined,
                    referralCode: user.referralCode || undefined,
                    "0To100": user["0To100"] || undefined,
                    totalReferrals: user.totalReferrals || 0,
                    monthlyPlansSold: user.monthlyPlansSold || 0,
                    yearlyPlansSold: user.yearlyPlansSold || 0,
                    referralTarget: newTarget,
                    actualSignups: user.actualSignups || 0,
                    durationMonths: user.durationMonths || 0,
                    durationYears: user.durationYears || 0
                }, { suppressAuth: true });

                console.log("Referral target updated:", { userId, referralTarget: newTarget });

                const updatedDisplayCount = (user.actualSignups || 0) > 0 ? (user.actualSignups || 0) : (user.totalReferrals || 0);
                const updatedProgress = newTarget > 0 ? Math.min((updatedDisplayCount / newTarget) * 100, 100) : 0;
                $w("#progressSlider").value = updatedProgress;
                const updatedNeeded = newTarget - updatedDisplayCount;
                const updatedWeeklyRate = weeksRemaining > 0 ? (updatedNeeded / weeksRemaining).toFixed(1) : 0;
                $w("#weeklyRate").text = weeksRemaining > 0 ? `Need ${updatedWeeklyRate}/week to goal` : "No duration set";
            } catch (err) {
                console.error("Error updating referralTarget:", err);
                $w("#errorText").text = "Error saving target.";
                $w("#errorText").show();
            }
        });

        $w("#actualSignups").onChange(async () => {
            const newSignups = parseInt($w("#actualSignups").value) || 0;
            try {
                const refreshedData = await wixData.query("MemberData")
                    .eq("_owner", userId)
                    .find({ suppressAuth: true });
                user = refreshedData.items[0];

                await wixData.update("MemberData", {
                    _id: user._id,
                    _owner: user._owner,
                    email: user.email || '',
                    subscriptionStatus: user.subscriptionStatus || 'Inactive',
                    referrerCode: user.referrerCode || undefined,
                    name: user.name || undefined,
                    inviteCode: user.inviteCode || undefined,
                    referralCode: user.referralCode || undefined,
                    "0To100": user["0To100"] || undefined,
                    totalReferrals: user.totalReferrals || 0,
                    monthlyPlansSold: user.monthlyPlansSold || 0,
                    yearlyPlansSold: user.yearlyPlansSold || 0,
                    referralTarget: user.referralTarget || 0,
                    actualSignups: newSignups,
                    durationMonths: user.durationMonths || 0,
                    durationYears: user.durationYears || 0
                }, { suppressAuth: true });

                console.log("Actual signups updated:", { userId, actualSignups: newSignups });

                const updatedDisplayCount = newSignups > 0 ? newSignups : (user.totalReferrals || 0);
                const updatedProgress = (user.referralTarget || 0) > 0 ? Math.min((updatedDisplayCount / (user.referralTarget || 0)) * 100, 100) : 0;
                $w("#progressSlider").value = updatedProgress;
                const updatedNeeded = (user.referralTarget || 0) - updatedDisplayCount;
                const updatedWeeklyRate = weeksRemaining > 0 ? (updatedNeeded / weeksRemaining).toFixed(1) : 0;
                $w("#weeklyRate").text = weeksRemaining > 0 ? `Need ${updatedWeeklyRate}/week to goal` : "No duration set";
            } catch (err) {
                console.error("Error updating actualSignups:", err);
                $w("#errorText").text = "Error saving signups.";
                $w("#errorText").show();
            }
        });

        $w("#durationMonths").onChange(async () => {
            const newMonths = parseInt($w("#durationMonths").value) || 0;
            try {
                const refreshedData = await wixData.query("MemberData")
                    .eq("_owner", userId)
                    .find({ suppressAuth: true });
                user = refreshedData.items[0];

                await wixData.update("MemberData", {
                    _id: user._id,
                    _owner: user._owner,
                    email: user.email || '',
                    subscriptionStatus: user.subscriptionStatus || 'Inactive',
                    referrerCode: user.referrerCode || undefined,
                    name: user.name || undefined,
                    inviteCode: user.inviteCode || undefined,
                    referralCode: user.referralCode || undefined,
                    "0To100": user["0To100"] || undefined,
                    totalReferrals: user.totalReferrals || 0,
                    monthlyPlansSold: user.monthlyPlansSold || 0,
                    yearlyPlansSold: user.yearlyPlansSold || 0,
                    referralTarget: user.referralTarget || 0,
                    actualSignups: user.actualSignups || 0,
                    durationMonths: newMonths,
                    durationYears: user.durationYears || 0
                }, { suppressAuth: true });

                console.log("Duration months updated:", { userId, durationMonths: newMonths });

                const updatedWeeksRemaining = (user.durationYears || 0) * 52 + newMonths * 4.333;
                const updatedNeeded = (user.referralTarget || 0) - ((user.actualSignups || 0) > 0 ? (user.actualSignups || 0) : (user.totalReferrals || 0));
                const updatedWeeklyRate = updatedWeeksRemaining > 0 ? (updatedNeeded / updatedWeeksRemaining).toFixed(1) : 0;
                $w("#weeklyRate").text = updatedWeeksRemaining > 0 ? `Need ${updatedWeeklyRate}/week to goal` : "No duration set";
            } catch (err) {
                console.error("Error updating durationMonths:", err);
                $w("#errorText").text = "Error saving duration.";
                $w("#errorText").show();
            }
        });

        $w("#durationYears").onChange(async () => {
            const newYears = parseInt($w("#durationYears").value) || 0;
            try {
                const refreshedData = await wixData.query("MemberData")
                    .eq("_owner", userId)
                    .find({ suppressAuth: true });
                user = refreshedData.items[0];

                await wixData.update("MemberData", {
                    _id: user._id,
                    _owner: user._owner,
                    email: user.email || '',
                    subscriptionStatus: user.subscriptionStatus || 'Inactive',
                    referrerCode: user.referrerCode || undefined,
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
                    durationYears: newYears
                }, { suppressAuth: true });

                console.log("Duration years updated:", { userId, durationYears: newYears });

                const updatedWeeksRemaining = newYears * 52 + (user.durationMonths || 0) * 4.333;
                const updatedNeeded = (user.referralTarget || 0) - ((user.actualSignups || 0) > 0 ? (user.actualSignups || 0) : (user.totalReferrals || 0));
                const updatedWeeklyRate = updatedWeeksRemaining > 0 ? (updatedNeeded / updatedWeeksRemaining).toFixed(1) : 0;
                $w("#weeklyRate").text = updatedWeeksRemaining > 0 ? `Need ${updatedWeeklyRate}/week to goal` : "No duration set";
            } catch (err) {
                console.error("Error updating durationYears:", err);
                $w("#errorText").text = "Error saving duration.";
                $w("#errorText").show();
            }
        });
    } catch (err) {
        console.error("Grow Your Vision: Error", { message: err.message });
        $w("#errorText").text = "An error occurred. Please try again.";
        $w("#errorText").show();
    }
});
