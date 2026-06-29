import wixWindow from 'wix-window';
import wixLocation from 'wix-location';

$w.onReady(function () {
    const data = wixWindow.lightbox.getContext();
    console.log("Error Lightbox - Context data:", data);
    $w('#errorText').text = data?.message || "An unexpected error occurred.";
    // Close button handled manually in Wix Editor
});
