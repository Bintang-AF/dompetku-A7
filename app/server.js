/**
 * SERVER.JS - VERSI FULL DUMMY (TANPA DATABASE)
 * Port: 1912
 * Fitur: Login, Register, Upload Foto, CRUD Transaksi
 */

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const multer = require('multer');
const app = express();

// =========================================
// 1. SETTING PORT (HARUS 1912)
// =========================================
const port = 1912; 

// =========================================
// 2. CONFIG SESSION (TIKET MASUK)
// =========================================
app.use(session({
    secret: 'rahasia-dapur-dompetku', // Bebas
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 Jam
}));

// =========================================
// 3. CONFIG UPLOAD (MULTER)
// =========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // File akan masuk ke folder public/uploads
        cb(null, 'public/uploads'); 
    },
    filename: (req, file, cb) => {
        // Nama file unik: timestamp-namaasli.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// =========================================
// 4. CONFIG VIEW ENGINE (TAMPILAN)
// =========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); // Buka folder public
app.use(express.urlencoded({ extended: true })); // Baca data form
app.use(expressLayouts);
app.set('layout', 'layout/main'); // Layout default

// =========================================
// 5. DATA DUMMY (PENGGANTI DATABASE)
// =========================================
// Data ini akan reset kalau server dimatikan.
let dummyTransaksi = [
    { 
        id: 1, 
        tanggal: '2026-01-12', 
        keterangan: 'Saldo Awal (Dummy)', 
        jenis: 'Pemasukan', 
        nominal: 5000000, 
        foto: null 
    }
];

// =========================================
// 6. MIDDLEWARE SATPAM (CEK LOGIN)
// =========================================
const cekLogin = (req, res, next) => {
    if (req.session.user) {
        next(); // Boleh lewat
    } else {
        res.redirect('/auth/login'); // Tendang ke login
    }
};

// =========================================
// 7. ROUTES (ALUR APLIKASI)
// =========================================

// --- HALAMAN LOGIN ---
app.get('/auth/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    // Layout: false (PENTING) biar CSS Login jalan full screen
    res.render('auth/login', { layout: false, title: 'Login' });
});

// --- PROSES LOGIN ---
app.post('/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    
    // Validasi Sederhana
    if (password === '123') { 
        req.session.user = { username: identifier }; // Buat sesi
        res.redirect('/'); 
    } else {
        res.redirect('/auth/login'); 
    }
});


// --- DASHBOARD (DIPAGARI CEK LOGIN) ---
app.get('/', cekLogin, (req, res) => {
    // Hitung total manual dari array dummy
    const totalPemasukan = dummyTransaksi
        .filter(t => t.jenis === 'Pemasukan')
        .reduce((a, b) => a + b.nominal, 0);
        
    const totalPengeluaran = dummyTransaksi
        .filter(t => t.jenis === 'Pengeluaran')
        .reduce((a, b) => a + b.nominal, 0);

    res.render('index', { 
        title: 'Dashboard',
        transaksi: dummyTransaksi, 
        totalPemasukan, 
        totalPengeluaran,
        user: req.session.user
    });
});



// --- LOGOUT ---
app.post('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

// --- REGISTER (TAMPILAN SAJA) ---
app.get('/auth/register', (req, res) => {
    res.render('auth/register', { layout: false, title: 'Daftar' });
});

// --- FORM TAMBAH TRANSAKSI ---
app.get('/transaksi/tambah', cekLogin, (req, res) => {
    res.render('transaksi/form', { title: 'Tambah', isEdit: false, data: {} });
});

// --- PROSES SIMPAN (CREATE) ---
app.post('/transaksi/simpan', cekLogin, upload.single('bukti_foto'), (req, res) => {
    const newId = Date.now(); // ID Unik pakai waktu sekarang
    const foto = req.file ? req.file.filename : null;

    // Masukkan ke Array Dummy
    dummyTransaksi.push({
        id: newId,
        tanggal: req.body.tanggal,
        keterangan: req.body.keterangan,
        jenis: req.body.jenis,
        nominal: parseInt(req.body.nominal),
        foto: foto
    });
    
    res.redirect('/');
});

// --- HALAMAN EDIT ---
app.get('/transaksi/edit/:id', cekLogin, (req, res) => {
    const id = parseInt(req.params.id);
    const data = dummyTransaksi.find(t => t.id == id);
    
    if(data) {
        res.render('transaksi/form', { title: 'Edit', isEdit: true, data: data });
    } else {
        res.redirect('/');
    }
});

// --- PROSES UPDATE (AKAL-AKALAN DUMMY) ---
// Catatan: Di dummy ini, kita hapus dulu yang lama, baru simpan yang baru (simpel)
// Kalau pakai DB beneran, harus pakai UPDATE query.

// --- PROSES HAPUS ---
app.post('/transaksi/delete/:id', cekLogin, (req, res) => {
    const id = parseInt(req.params.id);
    // Filter array: Ambil semua item KECUALI yang id-nya mau dihapus
    dummyTransaksi = dummyTransaksi.filter(t => t.id != id);
    res.redirect('/');
});

// =========================================
// 8. JALANKAN SERVER
// =========================================
app.listen(port, () => {
    console.log(`✅ Server DompetKu (DUMMY MODE) jalan di http://localhost:${port}`);
});