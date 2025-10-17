// calculate-spreads.js - Automatski kalkuliši spreadove na osnovu postojećih kurseva
// Ovaj skript poredi postojeće kurseve u HTML tabeli sa srednjim kursevima sa API-ja
// i automatski kreira spread-config.js

const https = require('https');
const fs = require('fs');

// Postojeći kursevi iz HTML tabele (kako je korisnik podesio)
const CURRENT_RATES = {
    'EUR': { buy: 117.00, sell: 117.50 },
    'USD': { buy: 99.00, sell: 100.50 },
    'CHF': { buy: 125.00, sell: 127.00 },
    'GBP': { buy: 133.00, sell: 135.00 },
    'AUD': { buy: 63.50, sell: 65.50 },
    'CAD': { buy: 70.00, sell: 72.00 },
    'BAM': { buy: 59.50, sell: 60.50 },
    'RUB': { buy: 1.05, sell: 1.20 }
};

// Funkcija za dohvatanje srednjih kurseva sa API-ja
function fetchMiddleRates() {
    return new Promise((resolve, reject) => {
        const url = 'https://kursna-lista.info/api/rates';
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const rates = JSON.parse(data);
                    const middleRates = {};
                    
                    rates.forEach(rate => {
                        if (CURRENT_RATES[rate.currency]) {
                            middleRates[rate.currency] = parseFloat(rate.middle);
                        }
                    });
                    
                    resolve(middleRates);
                } catch (error) {
                    reject(error);
                }
            });
            
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Funkcija za kalkulisanje spreadova
function calculateSpreads(middleRates) {
    const spreads = {};
    
    Object.keys(CURRENT_RATES).forEach(currency => {
        const currentRate = CURRENT_RATES[currency];
        const middleRate = middleRates[currency];
        
        if (middleRate) {
            // Izračunaj razliku između postojećih kurseva i srednjeg kursa
            const buySpread = currentRate.buy - middleRate;
            const sellSpread = currentRate.sell - middleRate;
            
            spreads[currency] = {
                buy: Math.round(buySpread * 100) / 100,  // Zaokruži na 2 decimale
                sell: Math.round(sellSpread * 100) / 100
            };
            
            console.log(`${currency}:`);
            console.log(`  Srednji kurs: ${middleRate.toFixed(4)}`);
            console.log(`  Postojeći otkup: ${currentRate.buy} (razlika: ${buySpread >= 0 ? '+' : ''}${buySpread.toFixed(2)})`);
            console.log(`  Postojeća prodaja: ${currentRate.sell} (razlika: ${sellSpread >= 0 ? '+' : ''}${sellSpread.toFixed(2)})`);
            console.log('');
        }
    });
    
    return spreads;
}

// Funkcija za kreiranje novog spread-config.js fajla
function generateSpreadConfig(spreads) {
    const content = `// spread-config.js - Centralna konfiguracija spreadova za sve valute
// 🔧 JEDINO MESTO GDE SE MENJAJU SPREADOVI!
// 🤖 AUTOMATSKI GENERISAN na osnovu postojećih kurseva u tabeli

/**
 * Konfiguracija spreadova za svaku valutu
 * 
 * buy: fiksni iznos koji se DODAJE/ODUZIMA od srednjeg kursa (za otkup/kupovinu)
 * sell: fiksni iznos koji se DODAJE/ODUZIMA na srednji kurs (za prodaju)
 * 
 * NAPOMENA: Spreadovi su automatski izračunati na osnovu postojećih kurseva u HTML tabeli
 * u odnosu na srednje kurseve sa kursna-lista.info API-ja
 * 
 * Generirano: ${new Date().toLocaleString('sr-RS', { timeZone: 'Europe/Belgrade' })}
 */

const SPREAD_CONFIG = {
`;

    Object.keys(spreads).forEach(currency => {
        const spread = spreads[currency];
        const flagEmojis = {
            'EUR': '🇪🇺', 'USD': '🇺🇸', 'CHF': '🇨🇭', 'GBP': '🇬🇧',
            'AUD': '🇦🇺', 'CAD': '🇨🇦', 'BAM': '🇧🇦', 'RUB': '🇷🇺'
        };
        
        content += `    '${currency}': { buy: ${spread.buy}, sell: ${spread.sell} },    // ${flagEmojis[currency]} ${currency}\n`;
    });

    content += `};

// Export za Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SPREAD_CONFIG };
}

// Export za browser
if (typeof window !== 'undefined') {
    window.SPREAD_CONFIG = SPREAD_CONFIG;
}`;

    return content;
}

// Glavna funkcija
async function main() {
    try {
        console.log('🚀 Dohvatam srednje kurseve sa API-ja...');
        const middleRates = await fetchMiddleRates();
        
        console.log('📊 Kalkulišem spreadove na osnovu postojećih kurseva...\n');
        const spreads = calculateSpreads(middleRates);
        
        console.log('💾 Kreiram novi spread-config.js...');
        const configContent = generateSpreadConfig(spreads);
        
        // Backup postojećeg fajla
        if (fs.existsSync('spread-config.js')) {
            fs.copyFileSync('spread-config.js', `spread-config-backup-${Date.now()}.js`);
            console.log('📁 Napravljen backup postojećeg spread-config.js');
        }
        
        // Sačuvaj novi fajl
        fs.writeFileSync('spread-config.js', configContent, 'utf8');
        
        console.log('✅ Novo spread-config.js kreiran!');
        console.log('🎯 Spreadovi automatski kalkulisani na osnovu tvojih postojećih kurseva.');
        
    } catch (error) {
        console.error('❌ Greška:', error.message);
    }
}

// Pokreni
main();