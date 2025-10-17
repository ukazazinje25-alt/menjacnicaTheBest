# 💱 Menjačnica The Best - Oficijalni Vebsajt

## 📋 O Projektu
Moderni, responzivni vebsajt za menjačnicu "The Best" sa dve lokacije u Beogradu. Sajt omogućava klijentima da proveravaju kurseve valuta, kalkulišu iznose i zakažu transakcije online.

## ✨ Funkcionalnosti
- 💱 **Kursna lista** sa real-time kursevima glavnih valuta
- 🧮 **Interaktivni kalkulator** za konverziju valuta
- 📝 **Online rezervacija** transakcija sa email notifikacijama
- 🌍 **Transferi novca** (Western Union, Ria, MoneyGram, itd.)
- 🏦 **Platni promet** i plaćanje računa
- 🥇 **Investiciono zlato** - prodaja i informacije
- 🎮 **Uplate za kurire** (Glovo, Wolt, CarGo)
- 🎯 **BET depoziti** za kladionice
- 🎲 **Državna lutrija** Srbije
- 📍 **Interaktivna mapa** lokacija
- 📱 **Mobilno optimizovan** dizajn

## 🏢 Lokacije
- **📍 Sarajevska 38**, Beograd, Srbija
- **📍 Džordža Vašingtona 28**, Beograd, Srbija

## 🛠️ Tehnologije
- **Frontend:** HTML5, CSS3, JavaScript 
- **CSS Framework:** Bootstrap 4.5.2
- **Ikone:** Bootstrap Icons, Font Awesome
- **Mape:** Google Maps API
- **Animacije:** CSS3 transitions + custom JavaScript

## ⏰ Automatsko Ažuriranje Kurseva
Sistem automatski ažurira kurseve **jednom dnevno u 9:30 ujutru** koristeći:
- **API:** kursna-lista.info (kursevi se ne menjaju tokom dana)
- **Scheduling:** Node.js cron job - izvršava se tačno u 9:30
- **Formatiranje:** XXX.X0 format za sve kurseve
- **Timestamp:** Prikazuje "danas u 9:30" ili "juče u 9:30"
- **Browser:** NE poziva API - koristi postojeće kurseve

### 🚀 Pokretanje
```bash
# Instalacija zavisnosti
npm install

# Pokretanje automatskog ažuriranja
node cron-scheduler.js

# Ili koristi Windows batch fajl
start-rate-updater.bat
```

### 🔧 Konfiguracija Spreadova
**Gde da menjaš spreadove**: Otvori `spread-config.js`
- Negativni procenat (buy) = niži kurs od srednjeg za otkup
- Pozitivni procenat (sell) = viši kurs od srednjeg za prodaju
- Primer: `'EUR': { buy: -0.3, sell: 0.3 }` = ±0.3% od srednjeg kursa


## 📞 Kontakt
- **📧 Email:** menjacnicathebest@gmail.com
- **📱 Telefon:** +381 61 1340888
- **🌐 Website:** menjacnicathebest.com

## 📜 Licenca
Privatni projekat za Menjačnica The Best

---
*Poslednje ažuriranje: Oktobar 2025*