# Sistem Faktur

Sistem manajemen faktur/penjualan dengan backend Node.js/TypeScript dan frontend HTML/CSS/JavaScript.

## Prerequisites

Pastikan sudah menginstall:
- **Node.js** (v16 atau lebih baru)
- **PostgreSQL** (v12 atau lebih baru)
- **npm** atau **yarn**

## Instalasi & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd ujikom57_11120825_teuku_raja
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database

#### a. Buat Database PostgreSQL
```sql
CREATE DATABASE faktur_db;
```

#### b. Konfigurasi Database
Buat file `.env` di root project:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=faktur_db
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_jwt_secret_key
PORT=4000
```

**Ganti nilai sesuai dengan konfigurasi PostgreSQL Anda**

### 4. Setup Database Schema
```bash
# Jalankan migrations (jika ada)
npm run migrate

# Atau import database schema manual jika diperlukan
# psql -U username -d faktur_db -f database_schema.sql
```

### 5. Jalankan Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server akan berjalan di: `http://localhost:4000`

### 6. Akses Aplikasi
Buka browser dan akses:
```
http://localhost:4000
```

## Scripts Available

```bash
npm run dev      # Jalankan dalam mode development (dengan auto-reload)
npm start        # Jalankan dalam mode production
npm run build    # Build TypeScript ke JavaScript (jika diperlukan)
```

## Struktur Project

```
├── src/                 # Backend source code (TypeScript)
│   ├── components/      # Controllers & Routes
│   ├── database/        # Models & Database config
│   └── lib/            # Utilities & Base classes
├── public/             # Frontend files (HTML/CSS/JS)
├── package.json        # Dependencies & scripts
└── .env               # Environment variables
```

## Troubleshooting

### 1. Error Database Connection
- Pastikan PostgreSQL berjalan
- Cek konfigurasi `.env`
- Pastikan database sudah dibuat

### 2. Error Port Already in Use
```bash
# Ubah PORT di .env atau kill process yang menggunakan port 4000
lsof -ti:4000 | xargs kill -9
```

### 3. Error Dependencies
```bash
# Hapus node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### 4. Error TypeScript
```bash
# Install TypeScript global jika belum ada
npm install -g typescript ts-node
```

## API Testing

Import file `postman_collection.json` ke Postman untuk testing API endpoints.

## Default Login

Setelah setup database, gunakan kredensial default:
- **Username**: admin
- **Password**: admin123

*Atau buat user baru melalui API/database*

---

**Note**: Pastikan semua environment variables di `.env` sudah diset dengan benar sebelum menjalankan aplikasi.
