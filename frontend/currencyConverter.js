// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction 



	import {fetch} from 'wix-fetch';

$w.onReady(async function () {
    try {
        // Fetch latest rates (base: GBP)
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/gbp.min.json');
        const data = await response.json();
        const rates = data.gbp;  // Object with rates like { usd: 1.27, eur: 1.17, ... }

        // Initial update
        updateConversions(rates);

        // Update on dropdown change
        $w('#currencySelector').onChange(() => {
            updateConversions(rates);
        });
    } catch (error) {
        console.error('Error fetching rates:', error);
        // Fallback: Display error in converted texts
        $w('#converted1').text = 'Rate fetch failed';
        $w('#converted2').text = 'Rate fetch failed';
        $w('#converted3').text = 'Rate fetch failed';
    }
});

function updateConversions(rates) {
    const selectedCurrency = $w('#currencySelector').value;  // e.g., 'usd'
    const symbol = selectedCurrency.toUpperCase();  // e.g., 'USD' for display

    // Update each plan
    updatePlan('1', rates, selectedCurrency, symbol);
    updatePlan('2', rates, selectedCurrency, symbol);
    updatePlan('3', rates, selectedCurrency, symbol);
}

function updatePlan(planNumber, rates, selectedCurrency, symbol) {
    const gbpText = $w(`#priceGbp${planNumber}`).text;
    const gbpAmount = parseFloat(gbpText.replace(/[^0-9.]/g, ''));  // Extract number, e.g., 100 from '£100'
    
    if (isNaN(gbpAmount) || !rates[selectedCurrency]) {
        $w(`#converted${planNumber}`).text = 'Invalid rate';
        return;
    }
    
    const convertedAmount = (gbpAmount * rates[selectedCurrency]).toFixed(2);
    $w(`#converted${planNumber}`).text = `${convertedAmount} ${symbol}`;
}// Write your Javascript code here using the Velo framework API

	// Print hello world:
	// console.log("Hello world!");

	// Call functions on page elements, e.g.:
	// $w("#button1").label = "Click me!";

	// Click "Run", or Preview your site, to execute your code

