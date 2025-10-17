// update-rates.js - Skript za automatsko ažuriranje kurseva
// Pokretaj ovaj skript svaki dan u 9:30 ujutru
//
// 🔧 KAKO DA MENJAŠ SPREADOVE:
// Otvori "spread-config.js" fajl - to je JEDINO mesto gde se menjaju spreadovi!
// Negativni iznos = oduzima se od srednjeg kursa (za kupovinu)
// Pozitivni iznos = dodaje se na srednji kurs (za prodaju)
// Primer: 'EUR': { buy: -0.2, sell: 0.2 } znači -0.2 RSD za kupovinu, +0.2 RSD za prodaju

const fs = require('fs');
const path = require('path');

// API konfiguracija
const API_BASE_URL = 'https://kursna-lista.info/api/v1/exchange-rates';
const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'CHF', 'GBP', 'AUD', 'CAD', 'RUB'];

// ===== CENTRALNA KONFIGURACIJA SPREADOVA =====
// Učitaj konfiguraciju iz centralnog fajla
const { SPREAD_CONFIG } = require('./spread-config.js');

// Funkcija za dohvatanje kursa
async function fetchCurrencyRate(currency) {
    try {
        const response = await fetch(`${API_BASE_URL}/${currency}/RSD`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.middle_rate ? parseFloat(data.middle_rate) : null;
    } catch (error) {
        console.error(`Greška pri dohvatanju kursa za ${currency}:`, error.message);
        return null;
    }
}

// Funkcija za kalkulaciju sa fiksnim spreadom
function calculateWithSpread(middleRate, currency, type) {
    const config = SPREAD_CONFIG[currency];
    if (!config) {
        // Fallback za valute koje nisu konfigurisane
        const fallbackSpread = type === 'buy' ? -0.3 : 0.3;
        return middleRate + fallbackSpread;
    }
    
    const spreadAmount = type === 'buy' ? config.buy : config.sell;
    return middleRate + spreadAmount;
}

// Funkcija za formatiranje kursa (XXX.X0 format)
function formatRate(rate) {
    const rounded = Math.round(rate * 10) / 10;
    return parseFloat(rounded.toFixed(1) + '0');
}

// Funkcija za formatiranje timestamp-a
function formatTimestamp() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Belgrade'
    };
    return now.toLocaleString('sr-RS', options);
}

// Glavna funkcija za ažuriranje kurseva
async function updateExchangeRates() {
    console.log('🚀 Pokretanje ažuriranja kurseva...');
    console.log('📅 Vreme:', new Date().toLocaleString('sr-RS'));
    
    const updatedRates = {};
    
    // Dohvati kurseve za sve valute
    for (const currency of SUPPORTED_CURRENCIES) {
        console.log(`📊 Dohvatam kurs za ${currency}...`);
        
        const middleRate = await fetchCurrencyRate(currency);
        
        if (middleRate) {
            const formattedMiddle = formatRate(middleRate);
            const buyRate = formatRate(calculateWithSpread(formattedMiddle, currency, 'buy'));
            const sellRate = formatRate(calculateWithSpread(formattedMiddle, currency, 'sell'));
            
            updatedRates[currency] = {
                otkup: buyRate,
                prodaja: sellRate,
                srednji: formattedMiddle
            };
            
            console.log(`✅ ${currency}: Otkup ${buyRate}, Prodaja ${sellRate} (Srednji: ${formattedMiddle})`);
        } else {
            console.log(`❌ Neuspešno dohvatanje kursa za ${currency}`);
        }
        
        // Pauza između zahteva da ne preopteretimo API
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Izračunaj BAM na osnovu EUR kursa
    if (updatedRates.EUR) {
        const eurMiddle = updatedRates.EUR.srednji;
        const bamMiddle = eurMiddle / 1.95583; // Fiksni kurs EUR/BAM
        const formattedBamMiddle = formatRate(bamMiddle);
        const bamBuyRate = formatRate(calculateWithSpread(formattedBamMiddle, 'BAM', 'buy'));
        const bamSellRate = formatRate(calculateWithSpread(formattedBamMiddle, 'BAM', 'sell'));
        
        updatedRates.BAM = {
            otkup: bamBuyRate,
            prodaja: bamSellRate,
            srednji: formattedBamMiddle
        };
        
        console.log(`✅ BAM (iz EUR): Otkup ${bamBuyRate}, Prodaja ${bamSellRate} (Srednji: ${formattedBamMiddle})`);
    }
    
    // Ažuriraj HTML fajl
    await updateHTMLFile(updatedRates);
    
    // Ažuriraj JavaScript objekat
    await updateJavaScriptRates(updatedRates);
    
    console.log('🎉 Ažuriranje kurseva završeno!');
    console.log('💾 Poslednje ažuriranje:', new Date().toISOString());
}

// Funkcija za ažuriranje HTML tabele
async function updateHTMLFile(rates) {
    const htmlPath = path.join(__dirname, 'index.html');
    
    try {
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Ažuriraj svaki kurs u tabeli
        Object.keys(rates).forEach(currency => {
            const currencyLower = currency.toLowerCase();
            const buyRate = rates[currency].otkup.toFixed(2);
            const sellRate = rates[currency].prodaja.toFixed(2);
            
            // Regex za pronalaženje i zamenu kurseva u HTML-u
            const buyRegex = new RegExp(`id="${currencyLower}-buy"[^>]*>([\\d\\.]+)</td>`, 'g');
            const sellRegex = new RegExp(`id="${currencyLower}-sell"[^>]*>([\\d\\.]+)</td>`, 'g');
            
            htmlContent = htmlContent.replace(buyRegex, `id="${currencyLower}-buy">${buyRate}</td>`);
            htmlContent = htmlContent.replace(sellRegex, `id="${currencyLower}-sell">${sellRate}</td>`);
        });
        
        // Ažuriraj timestamp
        const timestamp = formatTimestamp();
        const timestampRegex = /<div class="currency-timestamp"[^>]*>.*?<\/div>/g;
        const newTimestamp = `<div class="currency-timestamp" id="currencyTimestamp">Poslednje ažuriranje: ${timestamp}</div>`;
        htmlContent = htmlContent.replace(timestampRegex, newTimestamp);
        
        fs.writeFileSync(htmlPath, htmlContent, 'utf8');
        console.log('📝 HTML fajl ažuriran sa timestamp:', timestamp);
        
    } catch (error) {
        console.error('❌ Greška pri ažuriranju HTML fajla:', error.message);
    }
}

// Funkcija za ažuriranje JavaScript objekta u HTML-u
async function updateJavaScriptRates(rates) {
    const htmlPath = path.join(__dirname, 'index.html');
    
    try {
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Generiši novi JavaScript objekat
        let jsRates = 'let kursevi = {\n';
        Object.keys(rates).forEach((currency, index) => {
            const isLast = index === Object.keys(rates).length - 1;
            jsRates += `                    ${currency}: { otkup: ${rates[currency].otkup.toFixed(2)}, prodaja: ${rates[currency].prodaja.toFixed(2)} }${isLast ? '' : ','}\n`;
        });
        jsRates += '                };';
        
        // Zameni postojeći JavaScript objekat
        const jsRegex = /let kursevi = \{[\s\S]*?\};/;
        htmlContent = htmlContent.replace(jsRegex, jsRates);
        
        fs.writeFileSync(htmlPath, htmlContent, 'utf8');
        console.log('💻 JavaScript kursevi ažurirani');
        
    } catch (error) {
        console.error('❌ Greška pri ažuriranju JavaScript kurseva:', error.message);
    }
}

// Dodaj fetch polyfill za Node.js
if (typeof fetch === 'undefined') {
    global.fetch = require('node-fetch');
}

// Pokreni ažuriranje ako je skript pozvan direktno
if (require.main === module) {
    updateExchangeRates().catch(error => {
        console.error('💥 Kritična greška:', error);
        process.exit(1);
    });
}

module.exports = { updateExchangeRates };