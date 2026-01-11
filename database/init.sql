-- TODO: Tulis query SQL kalian di sini (CREATE TABLE & INSERT) untuk inisialisasi database otomatis
-- Memastikan kita menggunakan database yang benar
-- Nama database ini harus sama dengan MYSQL_DATABASE di docker-compose.yml
CREATE DATABASE IF NOT EXISTS dompetku_db;
USE dompetku_db;


CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Menggunakan VARCHAR(15) untuk NoHP karena INT akan menghilangkan angka 0 di depan
    -- dan rentan error jika nomornya terlalu panjang.
    NoHP VARCHAR(15) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS Transaksi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tanggal DATE NOT NULL,
    jenis ENUM('Pemasukan', 'Pengeluaran') NOT NULL,
    nominal INT NOT NULL,
    keterangan TEXT,
    bukti_foto VARCHAR(255),
    
    
    CONSTRAINT fk_user_transaksi
        FOREIGN KEY (user_id) REFERENCES Users(id)
        ON DELETE CASCADE
);




INSERT INTO Users (NoHP, username, email, password_hash) VALUES 
('081234567890', 'testuser', 'test@dompetku.com', '$2a$10$X.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x'); 


INSERT INTO Transaksi (user_id, tanggal, jenis, nominal, keterangan, bukti_foto) VALUES 
(1, '2025-01-01', 'Pemasukan', 5000000, 'Gaji Bulanan', NULL),
(1, '2025-01-02', 'Pengeluaran', 50000, 'Beli Makan Siang', NULL),
(1, '2025-01-03', 'Pengeluaran', 200000, 'Bayar Listrik', 'bukti_listrik.jpg');