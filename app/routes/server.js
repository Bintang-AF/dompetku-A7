// FILE: routes/index.js

const express = require('express');
const router = express.Router(); // Pakai Router, bukan App
const multer = require('multer');

// --- 1. PINDAHKAN CONFIG MULTER KESINI ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Perhatikan: Kita harus keluar satu folder (../) untuk ke public
        cb(null, 'public/uploads'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- 2. PINDAHKAN DATA DUMMY KESINI ---
let dummyTransaksi = [
    { id: 1, tanggal: '2026-01-12', keterangan: 'Saldo Awal', jenis: 'Pemasukan', nominal: 5000000, foto: null }
];

// --- 3. PINDAHKAN MIDDLEWARE CEK LOGIN KESINI ---
const cekLogin = (req, res, next) => {
    if (req.session.user) {
        next(); 
    } else {
        res.redirect('/auth/login'); 
    }
};

// --- 4. PINDAHKAN SEMUA ROUTES (Ganti 'app.' jadi 'router.') ---

// LOGIN
router.get('/auth/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', { layout: false, title: 'Login' });
});

router.post('/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    if (password === '123') { 
        req.session.user = { username: identifier };
        res.redirect('/'); 
    } else {
        res.redirect('/auth/login'); 
    }
});

router.post('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

// REGISTER
router.get('/auth/register', (req, res) => {
    res.render('auth/register', { layout: false, title: 'Daftar' });
});

// DASHBOARD
router.get('/', cekLogin, (req, res) => {
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

// TRANSAKSI
router.get('/transaksi/tambah', cekLogin, (req, res) => {
    res.render('transaksi/form', { title: 'Tambah', isEdit: false, data: {} });
});

router.post('/transaksi/simpan', cekLogin, upload.single('bukti_foto'), (req, res) => {
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

router.get('/transaksi/edit/:id', cekLogin, (req, res) => {
    const id = parseInt(req.params.id);
    const data = dummyTransaksi.find(t => t.id == id);
    if(data) res.render('transaksi/form', { title: 'Edit', isEdit: true, data: data });
    else res.redirect('/');
});

router.post('/transaksi/update/:id', cekLogin, upload.single('bukti_foto'), (req, res) => {
    const id = parseInt(req.params.id);
    const newFoto = req.file ? req.file.filename : null;
    const index = dummyTransaksi.findIndex(t => t.id === id);

    if (index !== -1) {
        dummyTransaksi[index].tanggal = req.body.tanggal;
        dummyTransaksi[index].jenis = req.body.jenis;
        dummyTransaksi[index].nominal = parseInt(req.body.nominal);
        dummyTransaksi[index].keterangan = req.body.keterangan;
        if (newFoto) dummyTransaksi[index].foto = newFoto;
    }
    res.redirect('/');
});

router.post('/transaksi/delete/:id', cekLogin, (req, res) => {
    const id = parseInt(req.params.id);
    dummyTransaksi = dummyTransaksi.filter(t => t.id != id);
    res.redirect('/');
});

// --- PENTING: EXPORT ROUTERNYA ---
module.exports = router;