# JatahKu (Student Runway & Daily Expense Tracker)

Aplikasi web utilitarian pencatat keuangan mahasiswa/anak kos yang berfokus pada **perhitungan jatah aman harian (daily burn rate)** agar uang bulanan bertahan hingga akhir siklus, dilengkapi generator laporan pertanggungjawaban keuangan resmi (PDF berstandar rekening koran & Excel).

---

## 🎯 Fitur & Kemampuan Inti

1. **Siklus & Runway Calculator**:
   - Saldo Awal, Tanggal Mulai, dan Tanggal Selesai Siklus.
   - **Dana Cadangan Darurat (Buffer)**: Alokasi proteksi tabungan tak terduga yang tidak dibagi ke dalam jatah belanja harian.
   - **Kalkulasi Dinamis**: $\text{Jatah Harian Aman} = \frac{\text{Sisa Saldo Bebas}}{\text{Sisa Hari Tersisa}}$.
   - **Indikator Kesehatan Finansial**: *Aman*, *Waspada*, dan *Hemat Keras* berdasarkan burn rate dan kepatuhan anggaran hari ini.

2. **Input Kilat (< 5 Detik)**:
   - Shortcut global keyboard: Tekan **`N`** di halaman mana saja untuk membuka formulir.
   - Autofokus instan ke field nominal Rupiah.
   - Preset nominal cepat (+10rb, +15rb, +20rb, +25rb, +50rb, +100rb).
   - 5 kategori ringkas: Makanan, Kebutuhan Kos, Kuliah, Hiburan/Sosial, Lainnya.
   - Tombol simpan instan dengan tombol `Enter`.

3. **Ledger Transaksi Harian**:
   - Pengelompokan cerdas per tanggal (*Hari Ini*, *Kemarin*, atau tanggal spesifik).
   - Subtotal pengeluaran per hari vs kapasitas jatah harian.
   - Pencarian instan dan filter kategori.
   - Edit inline dan hapus transaksi.

4. **Export Center Resmi**:
   - **PDF Official Statement (`jspdf` + `jspdf-autotable`)**: Format audit monokromatik berstandar rekening koran bank, lengkap dengan ringkasan eksekutif, tabel distribusi kategori, log kas harian, dan kolom tanda tangan (Mahasiswa & Orang Tua/Wali).
   - **Excel Spreadsheet (`xlsx`)**: 2 lembar kerja (*Ringkasan Siklus* & *Buku Kas Transaksi*) dengan formula numerik.
   - **Cadangkan & Pulihkan (Backup & Restore JSON)**: Menjaga data tetap aman dan dapat dipindahkan antar browser/perangkat.

5. **Privasi & Offline**:
   - 100% data tersimpan lokal di browser (`localStorage`).
   - Tidak ada server pihak ketiga, pelacak, atau iklan.

---

## 🛠️ Tech Stack

- **Framework:** Vite 6 / React 19 (TypeScript)
- **Styling:** Tailwind CSS v4 (Palet Zinc/Slate utilitarian, Dark Mode priority)
- **Icons:** `lucide-react`
- **PDF Engine:** `jspdf` & `jspdf-autotable`
- **Spreadsheet Engine:** `xlsx`
- **Font Stack:** *Inter* & *JetBrains Mono* (monospaced tabular numbers)

---

## 🚀 Panduan Menjalankan

```bash
# Jalankan mode pengembangan
npm run dev

# Bangun versi produksi
npm run build

# Pratinjau hasil build
npm run preview
```

---

## ⌨️ Shortcut Keyboard

- **`N`**: Buka modal catat transaksi cepat
- **`Enter`**: Simpan transaksi saat berada di form input
- **`Esc`**: Tutup modal atau batalkan
