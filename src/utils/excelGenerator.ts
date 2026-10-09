import ExcelJS from 'exceljs';
import type { BudgetCycle, RunwayMetrics } from '../types/cycle';
import type { Transaction } from '../types/transaction';
import type { CategorySummary } from '../types/report';
import { formatDisplayDate, getTodayDateString } from './dateUtils';

interface GenerateExcelOptions {
  cycle: BudgetCycle;
  metrics: RunwayMetrics;
  categorySummaries: CategorySummary[];
  transactions: Transaction[];
}

export async function generateExcelReport({
  cycle,
  metrics,
  categorySummaries,
  transactions,
}: GenerateExcelOptions): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'JatahKu Personal Finance';
  wb.lastModifiedBy = cycle.userName || 'Mahasiswa';
  wb.created = new Date();
  wb.modified = new Date();

  // Formal Executive Color Palette
  const COLOR_HEADER_DARK = 'FF1E3A2B'; // Deep Forest Green
  const COLOR_HEADER_SUB = 'FF2D6A4F'; // Emerald Accent
  const COLOR_SECTION_BG = 'FFF4F1EA'; // Warm Stone / Cream
  const COLOR_ZEBRA = 'FFFAFAF9'; // Soft White-Gray
  const COLOR_BORDER = 'FFE5E7EB'; // Subtle Gray
  const COLOR_BORDER_DARK = 'FF9CA3AF'; // Medium Gray
  const COLOR_INCOME = 'FF15803D'; // Positive Green
  const COLOR_EXPENSE = 'FFB91C1C'; // Red Accent

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: COLOR_BORDER } },
    left: { style: 'thin', color: { argb: COLOR_BORDER } },
    bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
    right: { style: 'thin', color: { argb: COLOR_BORDER } },
  };

  const doubleBottomBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: COLOR_BORDER_DARK } },
    left: { style: 'thin', color: { argb: COLOR_BORDER } },
    bottom: { style: 'double', color: { argb: COLOR_HEADER_DARK } },
    right: { style: 'thin', color: { argb: COLOR_BORDER } },
  };

  // =========================================================================
  // SHEET 1: RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)
  // =========================================================================
  const wsSummary = wb.addWorksheet('Ringkasan Eksekutif', {
    views: [{ showGridLines: true }],
  });

  // Column widths tuned for comfortable reading
  wsSummary.columns = [
    { key: 'A', width: 4 },
    { key: 'B', width: 32 },
    { key: 'C', width: 24 },
    { key: 'D', width: 22 },
    { key: 'E', width: 20 },
    { key: 'F', width: 26 },
  ];

  // 1. Title Banner
  wsSummary.mergeCells('B2:F2');
  const titleCell = wsSummary.getCell('B2');
  titleCell.value = 'JATAHKU : LAPORAN PERTANGGUNGJAWABAN ARUS KAS KEUANGAN';
  titleCell.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_DARK } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  wsSummary.getRow(2).height = 28;

  wsSummary.mergeCells('B3:F3');
  const subTitleCell = wsSummary.getCell('B3');
  subTitleCell.value = 'Dokumen Rekapitulasi Realisasi Belanja & Anggaran Mahasiswa / Anak Kos';
  subTitleCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FFE5E7EB' } };
  subTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_SUB } };
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  wsSummary.getRow(3).height = 18;

  // 2. Section 1: Metadata
  wsSummary.mergeCells('B5:F5');
  const sec1 = wsSummary.getCell('B5');
  sec1.value = '1. INFORMASI MAHASISWA & PERIODE ANGGARAN';
  sec1.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_HEADER_DARK } };
  sec1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_SECTION_BG } };
  sec1.alignment = { vertical: 'middle', indent: 1 };
  wsSummary.getRow(5).height = 22;

  const metaRows = [
    {
      k1: 'Nama Mahasiswa',
      v1: cycle.userName || 'Mahasiswa',
      k2: 'Tanggal Mulai Siklus',
      v2: cycle.startDate,
    },
    {
      k1: 'Status Kesehatan Kas',
      v1: metrics.evaluation.label,
      k2: 'Tanggal Berakhir Siklus',
      v2: cycle.endDate,
    },
    {
      k1: 'Durasi Total Periode',
      v1: `${metrics.totalDays} Hari`,
      k2: 'Sisa Hari Berjalan',
      v2: `${metrics.daysRemaining} Hari Tersisa`,
    },
    {
      k1: 'Ketahanan Anggaran (Burn Rate)',
      v1: `${metrics.burnRatePercentage}%`,
      k2: 'Tanggal Cetak Dokumen',
      v2: formatDisplayDate(getTodayDateString()),
    },
  ];

  let curRow = 6;
  metaRows.forEach((item) => {
    const row = wsSummary.getRow(curRow);
    row.height = 20;

    const cellB = wsSummary.getCell(`B${curRow}`);
    cellB.value = item.k1;
    cellB.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF4B5563' } };
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ZEBRA } };
    cellB.border = thinBorder;

    const cellC = wsSummary.getCell(`C${curRow}`);
    cellC.value = item.v1;
    cellC.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF1F2937' } };
    cellC.border = thinBorder;

    const cellD = wsSummary.getCell(`D${curRow}`);
    cellD.value = item.k2;
    cellD.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF4B5563' } };
    cellD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ZEBRA } };
    cellD.border = thinBorder;

    wsSummary.mergeCells(`E${curRow}:F${curRow}`);
    const cellE = wsSummary.getCell(`E${curRow}`);
    cellE.value = item.v2;
    cellE.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF1F2937' } };
    cellE.border = thinBorder;
    wsSummary.getCell(`F${curRow}`).border = thinBorder;

    curRow++;
  });

  // 3. Section 2: Pos Anggaran & Realisasi Kas
  curRow += 1;
  wsSummary.mergeCells(`B${curRow}:F${curRow}`);
  const sec2 = wsSummary.getCell(`B${curRow}`);
  sec2.value = '2. POS ANGGARAN & REALISASI KAS (IDR)';
  sec2.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_HEADER_DARK } };
  sec2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_SECTION_BG } };
  sec2.alignment = { vertical: 'middle', indent: 1 };
  wsSummary.getRow(curRow).height = 22;

  curRow += 1;
  const headerMetricRow = curRow;
  wsSummary.getRow(headerMetricRow).height = 22;

  const hPos = wsSummary.getCell(`B${headerMetricRow}`);
  hPos.value = 'Pos Keuangan';
  hPos.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
  hPos.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_SUB } };
  hPos.border = thinBorder;

  const hNilai = wsSummary.getCell(`C${headerMetricRow}`);
  hNilai.value = 'Nilai Rupiah (IDR)';
  hNilai.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
  hNilai.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_SUB } };
  hNilai.alignment = { horizontal: 'right' };
  hNilai.border = thinBorder;

  wsSummary.mergeCells(`D${headerMetricRow}:F${headerMetricRow}`);
  const hKet = wsSummary.getCell(`D${headerMetricRow}`);
  hKet.value = 'Keterangan / Definisi Operasional';
  hKet.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
  hKet.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_SUB } };
  hKet.alignment = { horizontal: 'left', indent: 1 };
  hKet.border = thinBorder;
  wsSummary.getCell(`E${headerMetricRow}`).border = thinBorder;
  wsSummary.getCell(`F${headerMetricRow}`).border = thinBorder;

  const financialItems = [
    {
      title: 'Total Uang Saku / Anggaran Awal',
      amount: metrics.initialBalance,
      note: 'Modal kas awal untuk seluruh periode anggaran',
      highlight: false,
    },
    {
      title: 'Pemasukan Tambahan',
      amount: metrics.totalIncome,
      note: 'Akumulasi kiriman tambahan, gaji/freelance, beasiswa, dsb.',
      highlight: false,
      isIncome: true,
    },
    {
      title: 'Total Pengeluaran Realisasi',
      amount: metrics.totalExpense,
      note: 'Akumulasi belanja operasional yang telah dipakai',
      highlight: false,
      isExpense: true,
    },
    {
      title: 'Sisa Saldo Kas Operasional',
      amount: metrics.currentBalance,
      note: 'Uang kas fisik yang masih tersisa (Awal + Masuk - Keluar)',
      highlight: true,
    },
    {
      title: 'Tabungan Cadangan Darurat',
      amount: metrics.emergencyBuffer,
      note: 'Batas proteksi dana darurat yang wajib disisihkan',
      highlight: false,
    },
    {
      title: 'Sisa Kas Belanja Bebas',
      amount: metrics.effectiveCurrentBalance,
      note: 'Saldo operasional setelah dikurangi dana cadangan darurat',
      highlight: false,
    },
    {
      title: 'Jatah Belanja Aman Harian',
      amount: Math.round(metrics.safeDailyAllowance),
      note: 'Batas maksimal belanja per hari agar aman sampai akhir siklus',
      highlight: true,
    },
    {
      title: 'Rata-rata Belanja Per Hari',
      amount: metrics.averageDailyExpense,
      note: 'Rata-rata pengeluaran aktual per hari yang telah berjalan',
      highlight: false,
    },
  ];

  curRow += 1;
  financialItems.forEach((item, idx) => {
    const row = wsSummary.getRow(curRow);
    row.height = 20;

    const cellTitle = wsSummary.getCell(`B${curRow}`);
    cellTitle.value = item.title;
    cellTitle.font = {
      name: 'Segoe UI',
      size: 9,
      bold: item.highlight,
      color: { argb: item.highlight ? COLOR_HEADER_DARK : 'FF1F2937' },
    };
    cellTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: item.highlight ? 'FFE8F5E9' : idx % 2 === 0 ? 'FFFFFFFF' : COLOR_ZEBRA },
    };
    cellTitle.border = thinBorder;

    const cellVal = wsSummary.getCell(`C${curRow}`);
    cellVal.value = item.amount;
    cellVal.numFmt = '"Rp" #,##0';
    cellVal.font = {
      name: 'Consolas',
      size: 9.5,
      bold: item.highlight,
      color: {
        argb: item.isIncome
          ? COLOR_INCOME
          : item.isExpense
          ? COLOR_EXPENSE
          : item.highlight
          ? COLOR_HEADER_DARK
          : 'FF1F2937',
      },
    };
    cellVal.alignment = { horizontal: 'right' };
    cellVal.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: item.highlight ? 'FFE8F5E9' : idx % 2 === 0 ? 'FFFFFFFF' : COLOR_ZEBRA },
    };
    cellVal.border = thinBorder;

    wsSummary.mergeCells(`D${curRow}:F${curRow}`);
    const cellNote = wsSummary.getCell(`D${curRow}`);
    cellNote.value = item.note;
    cellNote.font = { name: 'Segoe UI', size: 8.5, color: { argb: 'FF6B7280' } };
    cellNote.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: item.highlight ? 'FFE8F5E9' : idx % 2 === 0 ? 'FFFFFFFF' : COLOR_ZEBRA },
    };
    cellNote.border = thinBorder;
    wsSummary.getCell(`E${curRow}`).border = thinBorder;
    wsSummary.getCell(`F${curRow}`).border = thinBorder;

    curRow++;
  });

  // 4. Section 3: Category Summaries Table
  curRow += 1;
  wsSummary.mergeCells(`B${curRow}:F${curRow}`);
  const sec3 = wsSummary.getCell(`B${curRow}`);
  sec3.value = '3. DISTRIBUSI PENGELUARAN PER KATEGORI';
  sec3.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_HEADER_DARK } };
  sec3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_SECTION_BG } };
  sec3.alignment = { vertical: 'middle', indent: 1 };
  wsSummary.getRow(curRow).height = 22;

  curRow += 1;
  const headerCatRow = curRow;
  wsSummary.getRow(headerCatRow).height = 22;

  const catHeaders = [
    { col: 'B', label: 'Kategori Pengeluaran', align: 'left' },
    { col: 'C', label: 'Total Belanja (IDR)', align: 'right' },
    { col: 'D', label: 'Porsi Belanja (%)', align: 'center' },
    { col: 'E', label: 'Frekuensi Transaksi', align: 'center' },
    { col: 'F', label: 'Rata-rata / Transaksi', align: 'right' },
  ];

  catHeaders.forEach((h) => {
    const c = wsSummary.getCell(`${h.col}${headerCatRow}`);
    c.value = h.label;
    c.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_DARK } };
    c.alignment = { horizontal: h.align as ExcelJS.Alignment['horizontal'], vertical: 'middle' };
    c.border = thinBorder;
  });

  const catStartRow = curRow + 1;
  curRow += 1;

  categorySummaries.forEach((cat, idx) => {
    const row = wsSummary.getRow(curRow);
    row.height = 20;

    const bg = idx % 2 === 0 ? 'FFFFFFFF' : COLOR_ZEBRA;

    const cB = wsSummary.getCell(`B${curRow}`);
    cB.value = cat.category;
    cB.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF1F2937' } };
    cB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cB.border = thinBorder;

    const cC = wsSummary.getCell(`C${curRow}`);
    cC.value = cat.total;
    cC.numFmt = '"Rp" #,##0';
    cC.font = { name: 'Consolas', size: 9.5, color: { argb: 'FF1F2937' } };
    cC.alignment = { horizontal: 'right' };
    cC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cC.border = thinBorder;

    const cD = wsSummary.getCell(`D${curRow}`);
    cD.value = (cat.percentage || 0) / 100;
    cD.numFmt = '0.0%';
    cD.font = { name: 'Consolas', size: 9.5, color: { argb: 'FF4B5563' } };
    cD.alignment = { horizontal: 'center' };
    cD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cD.border = thinBorder;

    const cE = wsSummary.getCell(`E${curRow}`);
    cE.value = cat.count;
    cE.numFmt = '#,##0';
    cE.font = { name: 'Consolas', size: 9.5, color: { argb: 'FF4B5563' } };
    cE.alignment = { horizontal: 'center' };
    cE.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cE.border = thinBorder;

    const cF = wsSummary.getCell(`F${curRow}`);
    cF.value = cat.count > 0 ? Math.round(cat.total / cat.count) : 0;
    cF.numFmt = '"Rp" #,##0';
    cF.font = { name: 'Consolas', size: 9.5, color: { argb: 'FF6B7280' } };
    cF.alignment = { horizontal: 'right' };
    cF.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cF.border = thinBorder;

    curRow++;
  });

  const catEndRow = curRow - 1;

  // Category Total Row
  const totalCatRow = curRow;
  wsSummary.getRow(totalCatRow).height = 22;

  const tB = wsSummary.getCell(`B${totalCatRow}`);
  tB.value = 'TOTAL PENGELUARAN';
  tB.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF1F2937' } };
  tB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  tB.border = doubleBottomBorder;

  const tC = wsSummary.getCell(`C${totalCatRow}`);
  tC.value = { formula: `SUM(C${catStartRow}:C${catEndRow})`, result: metrics.totalExpense };
  tC.numFmt = '"Rp" #,##0';
  tC.font = { name: 'Consolas', size: 10, bold: true, color: { argb: COLOR_EXPENSE } };
  tC.alignment = { horizontal: 'right' };
  tC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  tC.border = doubleBottomBorder;

  const tD = wsSummary.getCell(`D${totalCatRow}`);
  tD.value = { formula: `SUM(D${catStartRow}:D${catEndRow})`, result: 1 };
  tD.numFmt = '0.0%';
  tD.font = { name: 'Consolas', size: 9.5, bold: true, color: { argb: 'FF1F2937' } };
  tD.alignment = { horizontal: 'center' };
  tD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  tD.border = doubleBottomBorder;

  const tE = wsSummary.getCell(`E${totalCatRow}`);
  tE.value = {
    formula: `SUM(E${catStartRow}:E${catEndRow})`,
    result: categorySummaries.reduce((s, c) => s + c.count, 0),
  };
  tE.numFmt = '#,##0';
  tE.font = { name: 'Consolas', size: 9.5, bold: true, color: { argb: 'FF1F2937' } };
  tE.alignment = { horizontal: 'center' };
  tE.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  tE.border = doubleBottomBorder;

  const tF = wsSummary.getCell(`F${totalCatRow}`);
  tF.value = '-';
  tF.alignment = { horizontal: 'center' };
  tF.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  tF.border = doubleBottomBorder;

  // =========================================================================
  // SHEET 2: BUKU KAS TRANSAKSI (TRANSACTION LEDGER)
  // =========================================================================
  const wsLedger = wb.addWorksheet('Buku Kas Transaksi', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 5, showGridLines: true }],
  });

  wsLedger.columns = [
    { key: 'A', width: 6 },  // No
    { key: 'B', width: 14 }, // Tanggal
    { key: 'C', width: 16 }, // Jenis
    { key: 'D', width: 22 }, // Kategori / Sumber
    { key: 'E', width: 14 }, // Qty
    { key: 'F', width: 18 }, // Harga Satuan
    { key: 'G', width: 36 }, // Keterangan
    { key: 'H', width: 22 }, // Pemasukan (+)
    { key: 'I', width: 22 }, // Pengeluaran (-)
  ];

  // Title Banner
  wsLedger.mergeCells('A2:I2');
  const lTitle = wsLedger.getCell('A2');
  lTitle.value = 'JATAHKU : BUKU KAS & MUTASI TRANSAKSI KEUANGAN';
  lTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  lTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_DARK } };
  lTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsLedger.getRow(2).height = 28;

  wsLedger.mergeCells('A3:I3');
  const lSub = wsLedger.getCell('A3');
  lSub.value = `Daftar Rincian Mutasi Keuangan Mahasiswa Periode ${cycle.startDate} s/d ${cycle.endDate}`;
  lSub.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FFE5E7EB' } };
  lSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_SUB } };
  lSub.alignment = { horizontal: 'center', vertical: 'middle' };
  wsLedger.getRow(3).height = 18;

  // Table Header (Row 5)
  const lHeadRow = 5;
  wsLedger.getRow(lHeadRow).height = 26;

  const ledgerHeaders = [
    { col: 'A', label: 'No', align: 'center' },
    { col: 'B', label: 'Tanggal', align: 'center' },
    { col: 'C', label: 'Jenis', align: 'center' },
    { col: 'D', label: 'Kategori / Sumber', align: 'left' },
    { col: 'E', label: 'Kuantitas', align: 'center' },
    { col: 'F', label: 'Harga Satuan (IDR)', align: 'right' },
    { col: 'G', label: 'Keterangan / Nama Barang', align: 'left' },
    { col: 'H', label: 'Pemasukan (+) (IDR)', align: 'right' },
    { col: 'I', label: 'Pengeluaran (-) (IDR)', align: 'right' },
  ];

  ledgerHeaders.forEach((h) => {
    const c = wsLedger.getCell(`${h.col}${lHeadRow}`);
    c.value = h.label;
    c.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_DARK } };
    c.alignment = { horizontal: h.align as ExcelJS.Alignment['horizontal'], vertical: 'middle' };
    c.border = thinBorder;
  });

  const sortedTransactions = [...transactions].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });

  const startTxRow = 6;
  let txCurRow = 6;

  sortedTransactions.forEach((tx, idx) => {
    const row = wsLedger.getRow(txCurRow);
    row.height = 20;
    const bg = idx % 2 === 0 ? 'FFFFFFFF' : COLOR_ZEBRA;
    const isIncome = tx.type === 'INCOME';

    // No
    const cA = wsLedger.getCell(`A${txCurRow}`);
    cA.value = idx + 1;
    cA.font = { name: 'Consolas', size: 9, color: { argb: 'FF6B7280' } };
    cA.alignment = { horizontal: 'center' };
    cA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cA.border = thinBorder;

    // Tanggal
    const cB = wsLedger.getCell(`B${txCurRow}`);
    cB.value = tx.date;
    cB.font = { name: 'Consolas', size: 9, color: { argb: 'FF374151' } };
    cB.alignment = { horizontal: 'center' };
    cB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cB.border = thinBorder;

    // Jenis
    const cC = wsLedger.getCell(`C${txCurRow}`);
    cC.value = isIncome ? 'Pemasukan' : 'Pengeluaran';
    cC.font = {
      name: 'Segoe UI',
      size: 9,
      bold: isIncome,
      color: { argb: isIncome ? COLOR_INCOME : 'FF4B5563' },
    };
    cC.alignment = { horizontal: 'center' };
    cC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cC.border = thinBorder;

    // Kategori / Sumber
    const cD = wsLedger.getCell(`D${txCurRow}`);
    cD.value = isIncome ? tx.source || 'Pemasukan Tambahan' : tx.category;
    cD.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF1F2937' } };
    cD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cD.border = thinBorder;

    // Kuantitas (Qty)
    const cE = wsLedger.getCell(`E${txCurRow}`);
    cE.value = !isIncome ? (tx.qty && tx.qty > 1 ? `${tx.qty} pcs` : '1 pcs') : '-';
    cE.font = { name: 'Consolas', size: 9, color: { argb: 'FF6B7280' } };
    cE.alignment = { horizontal: 'center' };
    cE.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cE.border = thinBorder;

    // Harga Satuan
    const cF = wsLedger.getCell(`F${txCurRow}`);
    if (!isIncome) {
      cF.value = tx.unitPrice || tx.amount;
      cF.numFmt = '"Rp" #,##0';
      cF.font = { name: 'Consolas', size: 9, color: { argb: 'FF4B5563' } };
      cF.alignment = { horizontal: 'right' };
    } else {
      cF.value = '-';
      cF.alignment = { horizontal: 'center' };
      cF.font = { name: 'Consolas', size: 9, color: { argb: 'FF9CA3AF' } };
    }
    cF.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cF.border = thinBorder;

    // Keterangan / Catatan
    const cG = wsLedger.getCell(`G${txCurRow}`);
    cG.value = tx.note || '-';
    cG.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF1F2937' } };
    cG.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cG.border = thinBorder;

    // Pemasukan (+)
    const cH = wsLedger.getCell(`H${txCurRow}`);
    if (isIncome) {
      cH.value = tx.amount;
      cH.numFmt = '"Rp" #,##0';
      cH.font = { name: 'Consolas', size: 9.5, bold: true, color: { argb: COLOR_INCOME } };
      cH.alignment = { horizontal: 'right' };
    } else {
      cH.value = null;
      cH.alignment = { horizontal: 'right' };
    }
    cH.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cH.border = thinBorder;

    // Pengeluaran (-)
    const cI = wsLedger.getCell(`I${txCurRow}`);
    if (!isIncome) {
      cI.value = tx.amount;
      cI.numFmt = '"Rp" #,##0';
      cI.font = { name: 'Consolas', size: 9.5, color: { argb: 'FF1F2937' } };
      cI.alignment = { horizontal: 'right' };
    } else {
      cI.value = null;
      cI.alignment = { horizontal: 'right' };
    }
    cI.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cI.border = thinBorder;

    txCurRow++;
  });

  const endTxRow = Math.max(startTxRow, txCurRow - 1);

  // Total Mutasi Kas Row
  const totalLedgerRow = txCurRow;
  wsLedger.getRow(totalLedgerRow).height = 24;

  wsLedger.mergeCells(`A${totalLedgerRow}:G${totalLedgerRow}`);
  const tLabel = wsLedger.getCell(`A${totalLedgerRow}`);
  tLabel.value = 'TOTAL MUTASI KAS';
  tLabel.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1F2937' } };
  tLabel.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 };
  tLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  tLabel.border = doubleBottomBorder;
  for (let c = 1; c <= 7; c++) {
    wsLedger.getRow(totalLedgerRow).getCell(c).border = doubleBottomBorder;
    wsLedger.getRow(totalLedgerRow).getCell(c).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };
  }

  const tInc = wsLedger.getCell(`H${totalLedgerRow}`);
  tInc.value = {
    formula: `SUM(H${startTxRow}:H${endTxRow})`,
    result: metrics.totalIncome,
  };
  tInc.numFmt = '"Rp" #,##0';
  tInc.font = { name: 'Consolas', size: 10, bold: true, color: { argb: COLOR_INCOME } };
  tInc.alignment = { horizontal: 'right', vertical: 'middle' };
  tInc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  tInc.border = doubleBottomBorder;

  const tExp = wsLedger.getCell(`I${totalLedgerRow}`);
  tExp.value = {
    formula: `SUM(I${startTxRow}:I${endTxRow})`,
    result: metrics.totalExpense,
  };
  tExp.numFmt = '"Rp" #,##0';
  tExp.font = { name: 'Consolas', size: 10, bold: true, color: { argb: COLOR_EXPENSE } };
  tExp.alignment = { horizontal: 'right', vertical: 'middle' };
  tExp.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  tExp.border = doubleBottomBorder;

  // Net Cashflow Row
  txCurRow += 1;
  const netRow = txCurRow;
  wsLedger.getRow(netRow).height = 24;

  wsLedger.mergeCells(`A${netRow}:G${netRow}`);
  const netLabel = wsLedger.getCell(`A${netRow}`);
  netLabel.value = 'ARUS KAS BERSIH (NET MUTASI = PEMASUKAN - PENGELUARAN)';
  netLabel.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLOR_HEADER_DARK } };
  netLabel.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 };
  netLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
  netLabel.border = doubleBottomBorder;
  for (let c = 1; c <= 7; c++) {
    wsLedger.getRow(netRow).getCell(c).border = doubleBottomBorder;
    wsLedger.getRow(netRow).getCell(c).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };
  }

  wsLedger.mergeCells(`H${netRow}:I${netRow}`);
  const netVal = wsLedger.getCell(`H${netRow}`);
  netVal.value = {
    formula: `H${totalLedgerRow}-I${totalLedgerRow}`,
    result: metrics.totalIncome - metrics.totalExpense,
  };
  netVal.numFmt = '"Rp" #,##0';
  netVal.font = { name: 'Consolas', size: 10.5, bold: true, color: { argb: COLOR_HEADER_DARK } };
  netVal.alignment = { horizontal: 'center', vertical: 'middle' };
  netVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
  netVal.border = doubleBottomBorder;
  wsLedger.getCell(`I${netRow}`).border = doubleBottomBorder;

  // =========================================================================
  // DOWNLOAD TRIGGER (BROWSER-SAFE BLOB)
  // =========================================================================
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Laporan_Keuangan_JatahKu_${cycle.startDate}_sd_${cycle.endDate}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
