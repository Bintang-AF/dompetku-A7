// TODO: Buat koneksi pool MySQL disini menggunakan Environment Variable (process.env)
const mysql = require('mysql2');
require('dotenv').config();

// Membuat pool koneksi agar efisien
const pool = mysql.createPool({
    // Docker Service Name akan diambil dari process.env.DB_HOST
    // Jika dijalankan lokal tanpa docker, fallback ke 'localhost' (Hanya untuk testing dev, bukan production)
    host: process.env.DB_HOST || 'mysql_db', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'dompetku_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Helper untuk mengecek koneksi saat aplikasi start
pool.getConnection((err, conn) => {
    if (err) {
        console.error('❌ Database Connection Failed (Logic Server):', err.message);
    } else {
        console.log('✅ Connected to Database Service successfully');
        conn.release();
    }
});

module.exports = pool.promise();