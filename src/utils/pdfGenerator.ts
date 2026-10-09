import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BudgetCycle, RunwayMetrics } from '../types/cycle';
import type { Transaction } from '../types/transaction';
import type { CategorySummary } from '../types/report';
import { formatIDR } from './currency';
import { formatFullDate, formatShortDate } from './dateUtils';

interface GeneratePdfOptions {
  cycle: BudgetCycle;
  metrics: RunwayMetrics;
  categorySummaries: CategorySummary[];
  transactions: Transaction[];
}

export function generateOfficialPDFReport({
  cycle,
  metrics,
  categorySummaries,
  transactions,
}: GeneratePdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header - Clean Formal Monochrome Style (No em-dash!)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('JATAHKU : LAPORAN PERTANGGUNGJAWABAN ARUS KAS', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Dokumen Resmi Pelaporan Realisasi Anggaran & Pengeluaran Mahasiswa', margin, 24);

  // Divider Line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(margin, 27, pageWidth - margin, 27);

  // Meta Information Grid
  const metaY = 33;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text('Nama Mahasiswa / Penerima', margin, metaY);
  doc.text('Periode Siklus Anggaran', margin + 65, metaY);
  doc.text('Tanggal Dicetak', margin + 130, metaY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(cycle.userName || 'Mahasiswa / Anak Kos', margin, metaY + 5);
  doc.text(
    `${formatShortDate(cycle.startDate)} s.d. ${formatShortDate(cycle.endDate)} (${metrics.totalDays} Hari)`,
    margin + 65,
    metaY + 5
  );
  doc.text(formatFullDate(new Date().toISOString().split('T')[0]), margin + 130, metaY + 5);

  // Executive Summary Card / Box
  const summaryBoxY = 44;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, summaryBoxY, pageWidth - margin * 2, 26, 2, 2, 'FD');

  const colWidth = (pageWidth - margin * 2) / 4;

  const summaryItems = [
    { label: 'TOTAL UANG SAKU', value: formatIDR(metrics.initialBalance) },
    { label: 'PEMASUKAN EKSTRA', value: formatIDR(metrics.totalIncome) },
    { label: 'TOTAL BELANJA', value: formatIDR(metrics.totalExpense) },
    { label: 'SISA UANG KAS', value: formatIDR(metrics.currentBalance) },
  ];

  summaryItems.forEach((item, index) => {
    const colX = margin + index * colWidth + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, colX, summaryBoxY + 8);

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(item.value, colX, summaryBoxY + 16);
  });

  // Secondary summary stats
  const subSummaryY = 76;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Tabungan Cadangan: ${formatIDR(metrics.emergencyBuffer)}  |  Rata-rata Belanja/Hari: ${formatIDR(metrics.averageDailyExpense)}  |  Sisa Hari: ${metrics.daysRemaining} Hari`,
    margin,
    subSummaryY
  );

  // Section 1: Distribusi Pengeluaran per Kategori
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('I. DISTRIBUSI PENGELUARAN PER KATEGORI', margin, subSummaryY + 7);

  const categoryTableData = categorySummaries.map((cat, idx) => [
    (idx + 1).toString(),
    cat.category,
    `${cat.count} Transaksi`,
    `${cat.percentage}%`,
    formatIDR(cat.total),
  ]);

  autoTable(doc, {
    startY: subSummaryY + 10,
    head: [['No', 'Kategori Pengeluaran', 'Frekuensi', 'Porsi (%)', 'Nominal']],
    body: categoryTableData,
    theme: 'plain',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { halign: 'right', font: 'courier', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  // Section 2: Log Transaksi Lengkap
  const finalY = (doc as any).lastAutoTable.finalY || 130;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('II. RINCIAN BUKU KAS HARIAN (RIWAYAT TRANSAKSI)', margin, finalY + 8);

  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });

  const transactionRows = sortedTransactions.map((tx, idx) => [
    (idx + 1).toString(),
    tx.date,
    tx.type === 'EXPENSE' ? 'KELUAR' : 'MASUK',
    tx.category,
    tx.note || '-',
    tx.type === 'EXPENSE' ? `-${formatIDR(tx.amount)}` : `+${formatIDR(tx.amount)}`,
  ]);

  autoTable(doc, {
    startY: finalY + 11,
    head: [['No', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Nominal']],
    body:
      transactionRows.length > 0
        ? transactionRows
        : [['-', '-', '-', '-', 'Belum ada transaksi', '-']],
    theme: 'striped',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 2.2,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 36 },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 34, halign: 'right', font: 'courier', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin, bottom: 42 },
  });

  // Signature Block at Bottom of last page
  const pageCount = (doc.internal as any).getNumberOfPages();
  doc.setPage(pageCount);

  let signY = (doc as any).lastAutoTable.finalY + 12;
  if (signY > pageHeight - 38) {
    doc.addPage();
    signY = 25;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  // Left Signature (Orang Tua / Wali)
  doc.text('Mengetahui,', margin + 15, signY);
  doc.text('Orang Tua / Wali', margin + 15, signY + 4);
  doc.line(margin + 10, signY + 22, margin + 55, signY + 22);
  doc.text('( ........................................ )', margin + 15, signY + 26);

  // Right Signature (Mahasiswa)
  const rightSignX = pageWidth - margin - 55;
  doc.text('Dibuat & Dipertanggungjawabkan,', rightSignX, signY);
  doc.text('Mahasiswa Penerima Dana', rightSignX, signY + 4);
  doc.line(rightSignX - 5, signY + 22, rightSignX + 50, signY + 22);
  doc.text(`( ${cycle.userName || 'Mahasiswa'} )`, rightSignX, signY + 26);

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `JatahKu • Laporan Otomatis Mahasiswa • Dicetak: ${new Date().toLocaleString('id-ID')}`,
    margin,
    pageHeight - 8
  );

  const filename = `Laporan_JatahKu_${cycle.startDate}_sd_${cycle.endDate}.pdf`;
  doc.save(filename);
}
