/**
 * SERVER.JS - DOMPETKU FULL LOGIC
 */
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const multer = require('multer');
const app = express();
const port = 1912;

// --- 1. CONFIG SESSION (TIKET MASUK) ---
app.use(session({
    secret: 'rahasia-dapur-dompetku',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 Jam
}));

// --- 2. CONFIG UPLOAD (MULTER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // File masuk ke folder public/uploads
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- 3. CONFIG VIEW ENGINE ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('layout', 'layout/main'); // Default layout

// --- 4. DATA DUMMY ---
let dummyTransaksi = [
    { id: 1, tanggal: '2026-01-10', keterangan: 'Saldo Awal', jenis: 'Pemasukan', nominal: 5000000, foto: null }
];

// --- 5. MIDDLEWARE SATPAM (CEK LOGIN) ---
const cekLogin = (req, res, next) => {
    if (req.session.user) {
        next(); // Boleh lewat
    } else {
        res.redirect('/auth/login'); // Tendang ke login
    }
};

// ================= ROUTES =================

// --- DASHBOARD (DIPROTEKSI) ---
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

// --- AUTH (LOGIN) ---
app.get('/auth/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', { layout: false, title: 'Login' });
});

app.post('/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    if (password === '123') { // Hardcode Password
        req.session.user = { username: identifier };
        res.redirect('/');
    } else {
        res.redirect('/auth/login');
    }
});

app.post('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

// --- AUTH (REGISTER - TAMPILAN SAJA) ---
app.get('/auth/register', (req, res) => {
    res.render('auth/register', { layout: false, title: 'Daftar' });
});

// --- TRANSAKSI (CRUD) ---
app.get('/transaksi/tambah', cekLogin, (req, res) => {
    res.render('transaksi/form', { title: 'Tambah', isEdit: false, data: {} });
});

// SIMPAN (+ UPLOAD FOTO)
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

// EDIT (Halaman)
app.get('/transaksi/edit/:id', cekLogin, (req, res) => {
    const id = parseInt(req.params.id);
    const data = dummyTransaksi.find(t => t.id == id);
    if(data) res.render('transaksi/form', { title: 'Edit', isEdit: true, data: data });
    else res.redirect('/');
});

// DELETE
app.post('/transaksi/delete/:id', cekLogin, (req, res) => {
    const id = parseInt(req.params.id);
    dummyTransaksi = dummyTransaksi.filter(t => t.id != id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server DompetKu jalan di http://localhost:${port}`);
});