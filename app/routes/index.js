// FILE: routes/index.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const mysql = require('mysql2');

// --- 1. KONEKSI DATABASE ---
// BAGIAN KONEKSI DATABASE
const pool = mysql.createPool({
    // LOGIKA PENTING:
    // Jika ada settingan DB_HOST dari Docker, pakai itu (Service Name).
    // Jika tidak ada, baru fallback ke 'localhost' (Hanya buat jaga-jaga).
    host: process.env.DB_HOST || 'mysql_db', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'dompetku_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ubah jadi Promise biar bisa pakai async/await (Lebih rapi)
const db = pool.promise();

// --- 2. CONFIG UPLOAD ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- 3. MIDDLEWARE CEK LOGIN ---
const cekLogin = (req, res, next) => {
    if (req.session.user) next();
    else res.redirect('/auth/login');
};

// ================= ROUTES =================

// --- AUTH: LOGIN ---
router.get('/auth/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', { layout: false, title: 'Login' });
});

router.post('/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        // Cek ke Database: Cari user yang username & passwordnya cocok
        // (Catatan: Di production, password harus di-hash, jangan plain text)
        const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [identifier, password]);

        if (rows.length > 0) {
            req.session.user = rows[0]; // Simpan data user di sesi
            res.redirect('/');
        } else {
            console.log('Login gagal: User tidak ditemukan');
            res.redirect('/auth/login');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/auth/login');
    }
});

// --- AUTH: LOGOUT ---
router.post('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

// --- AUTH: REGISTER ---
router.get('/auth/register', (req, res) => {
    res.render('auth/register', { layout: false, title: 'Daftar' });
});

router.post('/auth/register', async (req, res) => {
    const { identifier, email, password } = req.body;
    try {
        // Masukkan User Baru ke Database
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [identifier, email, password]);
        res.redirect('/auth/login');
    } catch (err) {
        console.error("Gagal Register:", err);
        // Kalau username kembar, biasanya error disini
        res.redirect('/auth/register');
    }
});

// --- DASHBOARD ---
router.get('/', cekLogin, async (req, res) => {
    try {
        // Ambil SEMUA data transaksi dari database
        const [transaksi] = await db.query('SELECT * FROM transaksi ORDER BY tanggal DESC');

        // Hitung total pakai Javascript (karena format data sudah array object)
        const totalPemasukan = transaksi.filter(t => t.jenis === 'Pemasukan').reduce((a, b) => a + b.nominal, 0);
        const totalPengeluaran = transaksi.filter(t => t.jenis === 'Pengeluaran').reduce((a, b) => a + b.nominal, 0);

        res.render('index', { 
            title: 'Dashboard',
            transaksi: transaksi, // Data asli dari DB
            totalPemasukan, 
            totalPengeluaran,
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.send("Error Database");
    }
});

// --- TRANSAKSI: TAMBAH ---
router.get('/transaksi/tambah', cekLogin, (req, res) => {
    res.render('transaksi/form', { title: 'Tambah', isEdit: false, data: {} });
});

router.post('/transaksi/simpan', cekLogin, upload.single('bukti_foto'), async (req, res) => {
    const { tanggal, keterangan, jenis, nominal } = req.body;
    const foto = req.file ? req.file.filename : null;

    try {
        await db.query(
            'INSERT INTO transaksi (tanggal, keterangan, jenis, nominal, foto) VALUES (?, ?, ?, ?, ?)',
            [tanggal, keterangan, jenis, nominal, foto]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// --- TRANSAKSI: EDIT ---
router.get('/transaksi/edit/:id', cekLogin, async (req, res) => {
    const id = req.params.id;
    try {
        const [rows] = await db.query('SELECT * FROM transaksi WHERE id = ?', [id]);
        if (rows.length > 0) {
            res.render('transaksi/form', { title: 'Edit', isEdit: true, data: rows[0] });
        } else {
            res.redirect('/');
        }
    } catch (err) {
        res.redirect('/');
    }
});

router.post('/transaksi/update/:id', cekLogin, upload.single('bukti_foto'), async (req, res) => {
    const id = req.params.id;
    const { tanggal, keterangan, jenis, nominal } = req.body;
    const newFoto = req.file ? req.file.filename : null;

    try {
        if (newFoto) {
            // Update beserta Foto
            await db.query(
                'UPDATE transaksi SET tanggal=?, keterangan=?, jenis=?, nominal=?, foto=? WHERE id=?',
                [tanggal, keterangan, jenis, nominal, newFoto, id]
            );
        } else {
            // Update TANPA ganti foto
            await db.query(
                'UPDATE transaksi SET tanggal=?, keterangan=?, jenis=?, nominal=? WHERE id=?',
                [tanggal, keterangan, jenis, nominal, id]
            );
        }
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// --- TRANSAKSI: HAPUS ---
router.post('/transaksi/delete/:id', cekLogin, async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM transaksi WHERE id = ?', [id]);
        res.redirect('/');
    } catch (err) {
        res.redirect('/');
    }
});

module.exports = router;