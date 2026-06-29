import wixLocation from 'wix-location';

$w.onReady(function () {
    $w('#errorText').hide();
    $w('#enterButton').onClick(() => {
        const referralLink = $w('#referralLinkInput').value.trim();
        if (!referralLink || !referralLink.includes('we3volution.com/referral/')) {
            $w('#errorText').text = 'Please enter a valid We3volution referral link.';
            $w('#errorText').show();
            console.warn("Invalid referral link", { referralLink });
            return;
        }
        $w('#errorText').hide();
        console.log("Redirecting to referral link", { referralLink });
        wixLocation.to(referralLink);
    });
});
