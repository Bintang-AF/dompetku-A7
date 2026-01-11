/**
 * SERVER.JS - VERSI BERSIH (Hanya Konfigurasi)
 */
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const app = express();
const port = 1912; 

// --- CONFIG ---
app.use(session({
    secret: 'rahasia-negara',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Path tetap aman disini
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.set('layout', 'layout/main'); 
app.use(express.urlencoded({ extended: true }));

// ==========================================
// PANGGIL ROUTE YANG TADI KITA BUAT
// ==========================================
const mainRoutes = require('./routes/index'); // Import file routes/index.js
app.use('/', mainRoutes); // Gunakan routes tersebut

// JALANKAN
app.listen(port, () => {
    console.log(`✅ Server Rapi Jalan di: http://localhost:${port}`);
});