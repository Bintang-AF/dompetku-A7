# 1. Pakai Node.js versi ringan sebagai dasar
FROM node:18-alpine

# 2. Tentukan folder kerja di dalam container
WORKDIR /usr/src/app

# 3. Copy file package.json dulu (biar install library-nya caching)
COPY package*.json ./

# 4. Install semua library yang dibutuhkan
RUN npm install

# 5. Copy semua kodingan kamu ke dalam container
COPY . .

# 6. Buka port 3000 (Pintu Internal)
EXPOSE 3000

# 7. PERINTAH JALAN (PENTING!)
# Karena server.js kamu sembunyikan di dalam folder routes,
# kita suruh Docker masuk ke folder routes dulu baru jalankan.
CMD ["node", "routes/server.js"]