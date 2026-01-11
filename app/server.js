const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session'); // 1. Import Session
const app = express();
const port = 1912; // Atau sesuaikan port kamu

// Setup Session
app.use(session({
    secret: 'rahasia-negara-api', // Kunci acak (bebas)
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // Sesi aktif 1 hari
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('layout', 'layout/main');

// --- DATA DUMMY ---
let dummyTransaksi = [
    { id: 1, tanggal: '2026-01-10', keterangan: 'Gaji Januari', jenis: 'Pemasukan', nominal: 5000000 },
];

// --- MIDDLEWARE (SATPAM) ---
// Fungsi ini akan mengecek: Punya tiket login gak? Kalau gak, tendang ke login.
const cekLogin = (req, res, next) => {
    if (req.session.user) {
        next(); // Boleh lanjut
    } else {
        res.redirect('/auth/login'); // Ditolak, suruh login dulu
    }
};

// --- ROUTES ---

// 1. Dashboard (Sekarang dilindungi oleh 'cekLogin')
app.get('/', cekLogin, (req, res) => {
    const totalPemasukan = dummyTransaksi.filter(t => t.jenis === 'Pemasukan').reduce((a, b) => a + b.nominal, 0);
    const totalPengeluaran = dummyTransaksi.filter(t => t.jenis === 'Pengeluaran').reduce((a, b) => a + b.nominal, 0);

    res.render('index', { 
        title: 'Dashboard',
        transaksi: dummyTransaksi, 
        totalPemasukan, 
        totalPengeluaran,
        user: req.session.user // Kirim data user ke view
    });
});

// 2. Halaman Login
app.get('/auth/login', (req, res) => {
    // Kalau sudah login, jangan kasih masuk halaman login lagi, langsung ke dashboard
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', { layout: false, title: 'Login' });
});

// 3. Proses Login (POST)
app.post('/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    
    // Logika Login Sederhana (Hardcode dulu untuk belajar)
    if (password === '123') { // Passwordnya '123'
        // Buat Sesi (Tiket)
        req.session.user = { username: identifier };
        res.redirect('/'); // Berhasil, kirim ke dashboard
    } else {
        res.redirect('/auth/login?error=true'); // Gagal
    }
});

// 4. Logout
app.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) return console.log(err);
        res.redirect('/auth/login');
    });
});

// 5. Register
app.get('/auth/register', (req, res) => {
    res.render('auth/register', { layout: false, title: 'Daftar' });
});

// Route Transaksi (Tambahkan cekLogin juga biar aman)
app.get('/transaksi/tambah', cekLogin, (req, res) => {
    res.render('transaksi/form', { title: 'Tambah', isEdit: false, data: {} });
});
// ... route simpan/hapus lainnya ...

app.listen(port, () => {
    console.log(`Server jalan di http://localhost:${port}`);
});