// cron-scheduler.js - Raspored za automatsko ažuriranje kurseva
const cron = require('node-cron');
const { updateExchangeRates } = require('./update-rates');

console.log('🚀 Pokretanje cron schedulera za ažuriranje kurseva...');
console.log('⏰ Raspored: Svaki dan u 9:30 ujutru (CET)');

// Cron job - svaki dan u 9:30 ujutru
cron.schedule('30 9 * * *', async () => {
    console.log('\n🌅 Dnevno ažuriranje kurseva - ' + new Date().toLocaleString('sr-RS'));
    
    try {
        await updateExchangeRates();
        console.log('✅ Dnevno ažuriranje uspešno završeno!\n');
    } catch (error) {
        console.error('❌ Greška pri dnevnom ažuriranju:', error);
    }
}, {
    timezone: "Europe/Belgrade"
});

// Test ažuriranje prilikom pokretanja (za testiranje)
console.log('🧪 Pokretanje test ažuriranja...');
updateExchangeRates().then(() => {
    console.log('✅ Test ažuriranje završeno. Cron scheduler je aktivan.');
}).catch(error => {
    console.error('❌ Greška pri test ažuriranju:', error);
});

// Sprečavanje zatvaranja procesa
process.on('SIGINT', () => {
    console.log('\n🛑 Zaustavljanje cron schedulera...');
    process.exit(0);
});

console.log('⏰ Cron scheduler je pokrenut. Pritisnite Ctrl+C za zaustavljanje.');