// spread-config.js - Centralna konfiguracija spreadova za sve valute
// 🔧 JEDINO MESTO GDE SE MENJAJU SPREADOVI!

/**
 * Konfiguracija spreadova za svaku valutu
 * 
 * buy: fiksni iznos koji se DODAJE/ODUZIMA od srednjeg kursa (za otkup/kupovinu)
 * sell: fiksni iznos koji se DODAJE/ODUZIMA na srednji kurs (za prodaju)
 * 
 * 🤖 AUTOMATSKI KALKULISANI SPREADOVI na osnovu postojećih kurseva u HTML tabeli
 * u odnosu na srednje kurseve sa kursna-lista.info API-ja
 * 
 * Primer za EUR:
 * - Postojeći otkup: 117.00, postojeća prodaja: 117.50
 * - API srednji kurs: ~117.18
 * - Kalkulisani spreadovi: buy: -0.18, sell: +0.32
 * - Rezultat: Svaki dan se zadržava ista logika razlike
 * 
 * Kursevi se automatski zaokružuju na 2 decimale u update-rates.js
 */

const SPREAD_CONFIG = {
    'EUR': { buy: -0.20, sell: 0.30 },   // 🇪🇺 Euro - kalkulisano na osnovu postojećih kurseva
    'USD': { buy: -0.85, sell: 0.65 },   // 🇺🇸 Dolar - kalkulisano na osnovu postojećih kurseva
    'CHF': { buy: -1.10, sell: 0.90 },   // 🇨🇭 Švajcarski franak - kalkulisano na osnovu postojećih kurseva
    'GBP': { buy: -1.05, sell: 0.95 },   // 🇬🇧 Britanska funta - kalkulisano na osnovu postojećih kurseva
    'AUD': { buy: -1.25, sell: 0.75 },   // 🇦🇺 Australijski dolar - kalkulisano na osnovu postojećih kurseva
    'CAD': { buy: -1.25, sell: 0.75 },   // 🇨🇦 Kanadski dolar - kalkulisano na osnovu postojećih kurseva
    'BAM': { buy: -0.70, sell: 0.30 },   // 🇧🇦 Bosanska marka - kalkulisano na osnovu postojećih kurseva
    'RUB': { buy: -0.10, sell: 0.10 }    // 🇷🇺 Ruska rublja - kalkulisano na osnovu postojećih kurseva
};

// Export za Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SPREAD_CONFIG };
}

// Export za browser
if (typeof window !== 'undefined') {
    window.SPREAD_CONFIG = SPREAD_CONFIG;
}