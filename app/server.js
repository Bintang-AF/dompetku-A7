const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); // Tambahan Library
const app = express();
const port = 1912;

// 1. Setup View Engine & Static Files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// 2. Setup Layouts (Agar Navbar otomatis muncul)
app.use(expressLayouts);
app.set('layout', 'layout/main'); // Mengarah ke views/layout/main.ejs

// --- DATA DUMMY (Sementara pengganti Database) ---
let dummyTransaksi = [
    { id: 1, tanggal: '2026-01-10', keterangan: 'Gaji Januari', jenis: 'Pemasukan', nominal: 5000000 },
    { id: 2, tanggal: '2026-01-11', keterangan: 'Bayar Kost', jenis: 'Pengeluaran', nominal: 1000000 }
];

// --- ROUTES ---

// Halaman Dashboard
app.get('/', (req, res) => {
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
        totalPengeluaran 
    });
});

// Halaman Login (Tanpa Navbar/Layout Utama)
app.get('/auth/login', (req, res) => {
    res.render('auth/login', { layout: false, title: 'Login' });
});

app.post('/auth/login', (req, res) => {
    // Logika login dummy
    res.redirect('/');
});

// Halaman Register (Tanpa Navbar/Layout Utama)
app.get('/auth/register', (req, res) => {
    res.render('auth/register', { layout: false, title: 'Daftar Akun' });
});

// Halaman Tambah Transaksi
app.get('/transaksi/tambah', (req, res) => {
    res.render('transaksi/form', { 
        title: 'Tambah Transaksi',
        isEdit: false, 
        data: {} 
    });
});

// Simpan Transaksi (Dummy Push)
app.post('/transaksi/simpan', (req, res) => {
    const newId = dummyTransaksi.length + 1;
    dummyTransaksi.push({
        id: newId,
        tanggal: req.body.tanggal,
        keterangan: req.body.keterangan,
        jenis: req.body.jenis,
        nominal: parseInt(req.body.nominal)
    });
    res.redirect('/');
});

// Halaman Edit
app.get('/transaksi/edit/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = dummyTransaksi.find(t => t.id === id);
    if(data) {
        res.render('transaksi/form', { 
            title: 'Edit Transaksi',
            isEdit: true, 
            data: data 
        });
    } else {
        res.redirect('/');
    }
});

// Hapus Transaksi
app.post('/transaksi/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    dummyTransaksi = dummyTransaksi.filter(t => t.id !== id);
    res.redirect('/');
});

// Jalankan Server
app.listen(port, () => {
    console.log(`DompetKu berjalan di http://localhost:${port}`);
});