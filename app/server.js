/**
 * SERVER.JS - FINAL FIX (Update Logic & Flow)
 */

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const multer = require('multer');
const app = express();
const port = 1912; 

// --- CONFIG ---
app.use(session({
    secret: 'rahasia-negara',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 Hari
}));

const upload = multer({ 
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'public/uploads'),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
    })
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.set('layout', 'layout/main'); 
app.use(express.urlencoded({ extended: true }));

// --- DATA DUMMY ---
let dummyTransaksi = [
    { id: 1, tanggal: '2026-01-12', keterangan: 'Saldo Awal', jenis: 'Pemasukan', nominal: 5000000, foto: null }
];

// --- MIDDLEWARE CEK LOGIN ---
const cekLogin = (req, res, next) => {
    if (req.session.user) {
        next(); 
    } else {
        // Kalau belum login, paksa ke halaman login
        res.redirect('/auth/login'); 
    }
};

// ================= ROUTING =================

// 1. LOGIN (HARUS PALING AWAL DIAKSES)
app.get('/auth/login', (req, res) => {
    // Kalau user SUDAH login, jangan kasih masuk sini, lempar ke dashboard
    if (req.session.user) return res.redirect('/');
    
    // Tampilkan Login TANPA Navbar (layout: false)
    res.render('auth/login', { layout: false, title: 'Login' });
});

app.post('/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    if (password === '123') { 
        req.session.user = { username: identifier };
        res.redirect('/'); // Sukses -> Ke Dashboard
    } else {
        res.redirect('/auth/login'); 
    }
});

app.post('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

app.get('/auth/register', (req, res) => {
    res.render('auth/register', { layout: false, title: 'Daftar' });
});

// 2. DASHBOARD (CekLogin aktif disini)
app.get('/', cekLogin, (req, res) => {
    const totalPemasukan = dummyTransaksi.filter(t => t.jenis === 'Pemasukan').reduce((a, b) => a + b.nominal, 0);
    const totalPengeluaran = dummyTransaksi.filter(t => t.jenis === 'Pengeluaran').reduce((a, b) => a + b.nominal, 0);

    res.render('index', { 
        title: 'Dashboard',
        transaksi: dummyTransaksi, 
        totalPemasukan, 
        totalPengeluaran,
        user: req.session.user
    });
});

// 3. TRANSAKSI (CRUD)

// Halaman Tambah
app.get('/transaksi/tambah', cekLogin, (req, res) => {
    res.render('transaksi/form', { title: 'Tambah', isEdit: false, data: {} });
});

// PROSES SIMPAN (BARU)
app.post('/transaksi/simpan', cekLogin, upload.single('bukti_foto'), (req, res) => {
    const newId = Date.now();
    const foto = req.file ? req.file.filename : null;
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

// Halaman Edit
app.get('/transaksi/edit/:id', cekLogin, (req, res) => {
    const id = parseInt(req.params.id);
    const data = dummyTransaksi.find(t => t.id == id);
    if(data) res.render('transaksi/form', { title: 'Edit', isEdit: true, data: data });
    else res.redirect('/');
});

// PROSES UPDATE (PERBAIKAN LOGIKA DISINI!)
app.post('/transaksi/update/:id', cekLogin, upload.single('bukti_foto'), (req, res) => {
    const id = parseInt(req.params.id);
    const newFoto = req.file ? req.file.filename : null;

    // 1. Cari Index data yang mau diedit
    const index = dummyTransaksi.findIndex(t => t.id === id);

    if (index !== -1) {
        // 2. Update datanya (Timpah data lama)
        dummyTransaksi[index].tanggal = req.body.tanggal;
        dummyTransaksi[index].jenis = req.body.jenis;
        dummyTransaksi[index].nominal = parseInt(req.body.nominal);
        dummyTransaksi[index].keterangan = req.body.keterangan;
        
        // 3. Cek Foto: Kalau user upload baru, ganti. Kalau gak, pakai yang lama.
        if (newFoto) {
            dummyTransaksi[index].foto = newFoto;
        }
    }
    res.redirect('/');
});

app.post('/transaksi/delete/:id', cekLogin, (req, res) => {
    const id = parseInt(req.params.id);
    dummyTransaksi = dummyTransaksi.filter(t => t.id != id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`✅ Server Berjalan di: http://localhost:${port}`);
});