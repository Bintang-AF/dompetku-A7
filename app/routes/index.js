// FILE: routes/index.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// --- CONFIG UPLOAD ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- DATA DUMMY ---
let dummyTransaksi = [
    { id: 1, tanggal: '2026-01-12', keterangan: 'Saldo Awal', jenis: 'Pemasukan', nominal: 5000000, foto: null }
];

// --- MIDDLEWARE ---
const cekLogin = (req, res, next) => {
    if (req.session.user) next();
    else res.redirect('/auth/login');
};

// ================= ROUTES =================

// --- 1. AUTH (LOGIN & REGISTER) ---

// Halaman Login
router.get('/auth/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', { layout: false, title: 'Login' });
});

// Proses Login
router.post('/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    if (password === '123') { 
        req.session.user = { username: identifier };
        res.redirect('/'); 
    } else {
        res.redirect('/auth/login'); 
    }
});

// Proses Logout
router.post('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

// Halaman Register
router.get('/auth/register', (req, res) => {
    res.render('auth/register', { layout: false, title: 'Daftar' });
});

// PERBAIKAN: Proses Register (Menangani Error 'Cannot POST')
router.post('/auth/register', (req, res) => {
    // Karena ini dummy, kita pura-pura sukses lalu lempar ke login
    // Nanti disini tempat kodingan INSERT ke Database User
    console.log("User baru mendaftar:", req.body);
    res.redirect('/auth/login'); 
});


// --- 2. DASHBOARD ---
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


// --- 3. TRANSAKSI (CRUD) ---

// Halaman Form Tambah
router.get('/transaksi/tambah', cekLogin, (req, res) => {
    res.render('transaksi/form', { title: 'Tambah', isEdit: false, data: {} });
});

// Proses Simpan (Tambah Baru)
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

// Halaman Form Edit
router.get('/transaksi/edit/:id', cekLogin, (req, res) => {
    const id = parseInt(req.params.id);
    const data = dummyTransaksi.find(t => t.id == id);
    if(data) res.render('transaksi/form', { title: 'Edit', isEdit: true, data: data });
    else res.redirect('/');
});

// PERBAIKAN: Proses Update (Ganti Data Lama)
router.post('/transaksi/update/:id', cekLogin, upload.single('bukti_foto'), (req, res) => {
    const id = parseInt(req.params.id);
    const newFoto = req.file ? req.file.filename : null;
    
    // Cari posisi data di array
    const index = dummyTransaksi.findIndex(t => t.id === id);

    if (index !== -1) {
        // Update data yang ada
        dummyTransaksi[index].tanggal = req.body.tanggal;
        dummyTransaksi[index].jenis = req.body.jenis;
        dummyTransaksi[index].nominal = parseInt(req.body.nominal);
        dummyTransaksi[index].keterangan = req.body.keterangan;
        
        // Ganti foto cuma kalau user upload foto baru
        if (newFoto) {
            dummyTransaksi[index].foto = newFoto;
        }
    }
    res.redirect('/');
});

// Proses Hapus
router.post('/transaksi/delete/:id', cekLogin, (req, res) => {
    const id = parseInt(req.params.id);
    dummyTransaksi = dummyTransaksi.filter(t => t.id != id);
    res.redirect('/');
});

module.exports = router;