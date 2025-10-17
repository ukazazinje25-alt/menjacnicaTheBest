// smart-update-rates.js - Pametno ažuriranje kurseva sa automatskim spreadovima
// 1. Povuče srednje kurseve sa API-ja
// 2. Izračuna spreadove na osnovu postojećih kurseva u tabeli
// 3. Automatski kreira novi spread-config.js
// 4. Ažurira HTML tabelu sa novim kursevima

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

// Funkcija za kalkulisanje spreadova na osnovu postojećih kurseva
function calculateSpreadsFromExisting(middleRates) {
    const spreads = {};
    
    console.log('📊 KALKULACIJA SPREADOVA:');
    console.log('=====================================');
    
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
            console.log(`  API srednji: ${middleRate.toFixed(4)}`);
            console.log(`  Postojeći otkup: ${currentRate.buy} (spread: ${buySpread >= 0 ? '+' : ''}${buySpread.toFixed(2)})`);
            console.log(`  Postojeća prodaja: ${currentRate.sell} (spread: ${sellSpread >= 0 ? '+' : ''}${sellSpread.toFixed(2)})`);
        }
    });
    
    return spreads;
}

// Funkcija za kalkulaciju sa spreadom (fiksni iznosi)
function calculateWithSpread(middleRate, spreadAmount) {
    return middleRate + spreadAmount;
}

// Funkcija za kreiranje novog spread-config.js fajla
function generateAndSaveSpreadConfig(spreads) {
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

    // Backup postojećeg fajla
    if (fs.existsSync('spread-config.js')) {
        fs.copyFileSync('spread-config.js', `spread-config-backup-${Date.now()}.js`);
        console.log('📁 Napravljen backup postojećeg spread-config.js');
    }
    
    // Sačuvaj novi fajl
    fs.writeFileSync('spread-config.js', content, 'utf8');
    console.log('💾 Novi spread-config.js kreiran!');
    
    return spreads;
}

// Funkcija za ažuriranje HTML fajla
function updateHTMLFile(middleRates, spreads) {
    try {
        let htmlContent = fs.readFileSync('index.html', 'utf8');
        
        console.log('\n🔄 AŽURIRANJE HTML TABELE:');
        console.log('=====================================');
        
        Object.keys(middleRates).forEach(currency => {
            const middleRate = middleRates[currency];
            const spread = spreads[currency];
            
            if (spread) {
                const buyRate = calculateWithSpread(middleRate, spread.buy);
                const sellRate = calculateWithSpread(middleRate, spread.sell);
                
                // Ažuriraj buy kurs
                const buyRegex = new RegExp(`(id="${currency.toLowerCase()}-buy">)[^<]*(</td>)`, 'i');
                htmlContent = htmlContent.replace(buyRegex, `$1${buyRate.toFixed(2)}$2`);
                
                // Ažuriraj sell kurs
                const sellRegex = new RegExp(`(id="${currency.toLowerCase()}-sell">)[^<]*(</td>)`, 'i');
                htmlContent = htmlContent.replace(sellRegex, `$1${sellRate.toFixed(2)}$2`);
                
                console.log(`${currency}: Otkup ${buyRate.toFixed(2)}, Prodaja ${sellRate.toFixed(2)}`);
            }
        });
        
        // Ažuriraj timestamp
        const now = new Date();
        const timeString = now.toLocaleString('sr-RS', {
            timeZone: 'Europe/Belgrade',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const timestampRegex = new RegExp('(id="currencyTimestamp"[^>]*>)[^<]*(</span>)', 'g');
        const newTimestamp = `Poslednje ažuriranje: ${timeString}`;
        htmlContent = htmlContent.replace(timestampRegex, `$1${newTimestamp}$2`);
        
        // Sačuvaj ažurirani HTML
        fs.writeFileSync('index.html', htmlContent, 'utf8');
        console.log(`⏰ Timestamp ažuriran: ${timeString}`);
        console.log('✅ HTML fajl ažuriran!');
        
    } catch (error) {
        console.error('❌ Greška pri ažuriranju HTML fajla:', error.message);
    }
}

// Glavna funkcija
async function main() {
    try {
        console.log('🚀 PAMETNO AŽURIRANJE KURSEVA');
        console.log('=====================================');
        console.log('🔍 Dohvatam srednje kurseve sa API-ja...\n');
        
        const middleRates = await fetchMiddleRates();
        
        console.log('🧮 Kalkulišem spreadove na osnovu postojećih kurseva...\n');
        const spreads = calculateSpreadsFromExisting(middleRates);
        
        console.log('\n💾 Kreiram novi spread-config.js...');
        generateAndSaveSpreadConfig(spreads);
        
        console.log('\n🔄 Ažuriram HTML tabelu sa novim kursevima...');
        updateHTMLFile(middleRates, spreads);
        
        console.log('\n🎯 ZAVRŠENO! Kursevi ažurirani koristeći tvoju logiku spreadova.');
        console.log('📈 Spreadovi automatski kalkulisani na osnovu razlike između tvojih kurseva i srednjih kurseva sa API-ja.');
        
    } catch (error) {
        console.error('❌ Greška:', error.message);
    }
}

// Pokreni
main();