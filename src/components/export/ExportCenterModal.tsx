import React, { useRef } from 'react';
import { FileText, FileSpreadsheet, Download, Upload, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useBudget } from '../../context/BudgetContext';
import { generateOfficialPDFReport } from '../../utils/pdfGenerator';
import { generateExcelReport } from '../../utils/excelGenerator';
import { formatIDR } from '../../utils/currency';
import { formatShortDate } from '../../utils/dateUtils';

interface ExportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportCenterModal: React.FC<ExportCenterModalProps> = ({ isOpen, onClose }) => {
  const { cycle, metrics, categorySummaries, transactions, backupData, restoreData } = useBudget();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!cycle) return null;

  const handleDownloadPDF = () => {
    generateOfficialPDFReport({
      cycle,
      metrics,
      categorySummaries,
      transactions,
    });
  };

  const handleDownloadExcel = async () => {
    try {
      await generateExcelReport({
        cycle,
        metrics,
        categorySummaries,
        transactions,
      });
    } catch (err) {
      console.error('Failed to export Excel report:', err);
      alert('Gagal membuat laporan Excel. Silakan coba kembali.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.cycle && Array.isArray(parsed.transactions)) {
          restoreData(parsed.cycle, parsed.transactions);
          alert('Data berhasil dipulihkan dari cadangan!');
          onClose();
        } else {
          alert('Format berkas JSON cadangan tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas cadangan JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cetak & Unduh Laporan"
      subtitle="Unduh laporan keuangan resmi untuk arsip pribadi atau dikirim ke orang tua"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Report Overview Box */}
        <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl">
          <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 mb-2">
            <span>Periode Laporan:</span>
            <span className="text-stone-900 dark:text-[#F2EFE9] font-bold">
              {formatShortDate(cycle.startDate)} s/d {formatShortDate(cycle.endDate)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#EDE9E1] dark:border-[#332F2B]">
            <div>
              <span className="block text-[10px] text-stone-500 dark:text-stone-400">Jumlah Transaksi</span>
              <span className="text-xs font-bold font-mono text-stone-850 dark:text-[#F2EFE9]">{transactions.length}</span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-500 dark:text-stone-400">Total Belanja</span>
              <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">
                {formatIDR(metrics.totalExpense)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-500 dark:text-stone-400">Sisa Uang</span>
              <span className="text-xs font-bold font-mono text-[#2D6A4F] dark:text-[#42B07E]">
                {formatIDR(metrics.currentBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Option 1: Official PDF Report */}
        <div className="p-4 bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#F4F1EA] dark:bg-[#2C2925] text-stone-700 dark:text-stone-300 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-[#F2EFE9] flex items-center gap-1.5">
                Laporan Keuangan Resmi (PDF)
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EDE9E1] dark:bg-[#2D2A26] text-stone-600 dark:text-stone-300">
                  Format A4
                </span>
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                Format laporan formal rapi ala rekening koran perbankan, dilengkapi ringkasan anggaran, pembagian kategori, rincian buku kas, serta kolom tanda tangan orang tua/wali.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PDF</span>
          </button>
        </div>

        {/* Option 2: Excel Spreadsheet */}
        <div className="p-4 bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#F4F1EA] dark:bg-[#2C2925] text-[#2D6A4F] dark:text-[#42B07E] shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-[#F2EFE9]">
                Rekap Data Mentah (Excel .xlsx)
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                Spreadsheet 2 lembar kerja berisi ringkasan angka dan riwayat transaksi lengkap yang dapat kamu olah sendiri.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadExcel}
            className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#F4F1EA] dark:bg-[#282622] hover:bg-[#EDE9E1] dark:hover:bg-[#332F2B] text-stone-800 dark:text-stone-200 border border-[#E7E3DA] dark:border-[#38342F] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel</span>
          </button>
        </div>

        {/* Option 3: Local Backup & Restore */}
        <div className="pt-2 border-t border-[#EDE9E1] dark:border-[#332F2B] flex items-center justify-between">
          <span className="text-[11px] text-stone-400 dark:text-stone-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
            Data tersimpan 100% lokal di browser Anda
          </span>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-[#F4F1EA] dark:hover:bg-[#2C2925] rounded-lg transition-colors"
              title="Pulihkan data dari file JSON cadangan"
            >
              <Upload className="w-3 h-3" />
              <span>Pulihkan JSON</span>
            </button>
            <button
              onClick={backupData}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-[#F4F1EA] dark:hover:bg-[#2C2925] rounded-lg transition-colors"
              title="Unduh file JSON cadangan"
            >
              <Download className="w-3 h-3" />
              <span>Cadangkan JSON</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
