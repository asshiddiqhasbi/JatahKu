import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Plus,
  Minus,
  Trash2,
  ClipboardPaste,
  Layers,
  Info,
  Calendar,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useBudget } from '../../context/BudgetContext';
import type { TransactionCategory, TransactionType } from '../../types/transaction';
import { TRANSACTION_CATEGORIES } from '../../constants/categories';
import {
  QUICK_AMOUNT_PRESETS,
  QUICK_INCOME_PRESETS,
  INCOME_SOURCE_PRESETS,
} from '../../constants/presets';
import { parseRawNumber, formatIDR } from '../../utils/currency';
import { getTodayDateString, getYesterdayDateString } from '../../utils/dateUtils';
import { parseNotesToTransactions } from '../../utils/transactionParser';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MultiRowItem {
  id: string;
  date: string;
  note: string;
  category: TransactionCategory;
  qty: number | '';
  unitPriceStr: string;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, addTransactions } = useBudget();

  // Active tab: 'SINGLE' | 'MULTI'
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'MULTI'>('SINGLE');

  // --- SINGLE MODE STATE ---
  const [singleType, setSingleType] = useState<TransactionType>('EXPENSE');
  const [singleUnitPriceStr, setSingleUnitPriceStr] = useState<string>('');
  const [singleQtyStr, setSingleQtyStr] = useState<string>('1');
  const singleQty = Math.max(1, parseInt(singleQtyStr, 10) || 1);
  const [singleCategory, setSingleCategory] = useState<TransactionCategory>('Makanan');
  const [singleIncomeSource, setSingleIncomeSource] = useState<string>('Transfer Ortu');
  const [singleNote, setSingleNote] = useState<string>('');
  const [singleDate, setSingleDate] = useState<string>(getTodayDateString());

  // --- MULTI MODE STATE ---
  const [batchDefaultDate, setBatchDefaultDate] = useState<string>(getTodayDateString());
  const [rows, setRows] = useState<MultiRowItem[]>([
    {
      id: 'row-1',
      date: getTodayDateString(),
      note: '',
      category: 'Makanan',
      qty: 1,
      unitPriceStr: '',
    },
    {
      id: 'row-2',
      date: getTodayDateString(),
      note: '',
      category: 'Makanan',
      qty: 1,
      unitPriceStr: '',
    },
    {
      id: 'row-3',
      date: getTodayDateString(),
      note: '',
      category: 'Makanan',
      qty: 1,
      unitPriceStr: '',
    },
  ]);

  // Paste Text helper state
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);
  const [pasteText, setPasteText] = useState<string>('');

  const singleAmountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const today = getTodayDateString();
      setSingleType('EXPENSE');
      setSingleUnitPriceStr('');
      setSingleQtyStr('1');
      setSingleCategory('Makanan');
      setSingleIncomeSource('Transfer Ortu');
      setSingleNote('');
      setSingleDate(today);

      setBatchDefaultDate(today);
      setRows([
        {
          id: `row-${Date.now()}-1`,
          date: today,
          note: '',
          category: 'Makanan',
          qty: 1,
          unitPriceStr: '',
        },
        {
          id: `row-${Date.now()}-2`,
          date: today,
          note: '',
          category: 'Makanan',
          qty: 1,
          unitPriceStr: '',
        },
        {
          id: `row-${Date.now()}-3`,
          date: today,
          note: '',
          category: 'Makanan',
          qty: 1,
          unitPriceStr: '',
        },
      ]);
      setShowPasteBox(false);
      setPasteText('');

      setTimeout(() => {
        singleAmountInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Single mode quick preset
  const handleQuickAddSingle = (val: number) => {
    const current = parseRawNumber(singleUnitPriceStr);
    const updated = current + val;
    setSingleUnitPriceStr(updated.toString());
  };

  const singleUnitPrice = parseRawNumber(singleUnitPriceStr);
  const singleTotalAmount = singleUnitPrice * Math.max(1, singleQty);

  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (singleUnitPrice <= 0) {
      singleAmountInputRef.current?.focus();
      return;
    }

    if (singleType === 'INCOME') {
      addTransaction({
        type: 'INCOME',
        amount: singleUnitPrice,
        category: 'Lainnya',
        source: singleIncomeSource,
        note: singleNote.trim() || singleIncomeSource,
        date: singleDate,
      });
      onClose();
      return;
    }

    const qty = Math.max(1, singleQty);
    let finalNote = singleNote.trim();
    if (qty > 1 && !finalNote.includes(`${qty}x`) && !finalNote.includes(`${qty} pcs`)) {
      finalNote = finalNote ? `${finalNote} (${qty} pcs)` : `${singleCategory} (${qty} pcs)`;
    }

    addTransaction({
      type: 'EXPENSE',
      amount: singleTotalAmount,
      qty,
      unitPrice: singleUnitPrice,
      category: singleCategory,
      note: finalNote || singleCategory,
      date: singleDate,
    });

    onClose();
  };

  // --- MULTI ROW HANDLERS ---
  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        date: batchDefaultDate,
        note: '',
        category: 'Makanan',
        qty: 1,
        unitPriceStr: '',
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      setRows([
        {
          id: `row-${Date.now()}`,
          date: batchDefaultDate,
          note: '',
          category: 'Makanan',
          qty: 1,
          unitPriceStr: '',
        },
      ]);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof MultiRowItem, val: string | number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === 'unitPriceStr') {
          return { ...r, unitPriceStr: (val as string).replace(/[^\d]/g, '') };
        }
        if (field === 'qty') {
          if (val === '') {
            return { ...r, qty: '' };
          }
          const raw = String(val).replace(/[^\d]/g, '');
          if (raw === '') {
            return { ...r, qty: '' };
          }
          const parsed = parseInt(raw, 10);
          return { ...r, qty: isNaN(parsed) ? '' : Math.min(999, Math.max(1, parsed)) };
        }
        return { ...r, [field]: val };
      })
    );
  };

  const handleApplyDefaultDateToAll = () => {
    setRows((prev) => prev.map((r) => ({ ...r, date: batchDefaultDate })));
  };

  const handleExtractPastedText = () => {
    if (!pasteText.trim()) return;
    const parsed = parseNotesToTransactions(pasteText, batchDefaultDate);
    if (parsed.length === 0) {
      alert('Tidak menemukan nominal pengeluaran pada teks yang ditempel.');
      return;
    }

    const newRows: MultiRowItem[] = parsed.map((item, idx) => ({
      id: `row-parsed-${Date.now()}-${idx}`,
      date: item.date,
      note: item.note,
      category: item.category,
      qty: item.qty || 1,
      unitPriceStr: (item.unitPrice || item.amount).toString(),
    }));

    // If existing rows are blank, replace them. Otherwise append.
    const isInitialBlank = rows.every(
      (r) => !r.note.trim() && parseRawNumber(r.unitPriceStr) === 0
    );
    if (isInitialBlank) {
      setRows(newRows);
    } else {
      setRows((prev) => [...prev, ...newRows]);
    }

    setPasteText('');
    setShowPasteBox(false);
  };

  const validRowsToSubmit = rows.filter((r) => parseRawNumber(r.unitPriceStr) > 0);
  const multiTotalAmount = validRowsToSubmit.reduce(
    (sum, r) =>
      sum +
      parseRawNumber(r.unitPriceStr) * (typeof r.qty === 'number' && r.qty >= 1 ? r.qty : 1),
    0
  );

  const handleSubmitMulti = (e: React.FormEvent) => {
    e.preventDefault();
    if (validRowsToSubmit.length === 0) {
      alert('Silakan masukkan minimal satu barang dengan harga valid.');
      return;
    }

    const transactionsToInsert = validRowsToSubmit.map((r) => {
      const qty = typeof r.qty === 'number' && r.qty >= 1 ? r.qty : 1;
      const unitPrice = parseRawNumber(r.unitPriceStr);
      const totalAmount = unitPrice * qty;
      let finalNote = r.note.trim();
      if (qty > 1 && !finalNote.includes(`${qty}x`) && !finalNote.includes(`${qty} pcs`)) {
        finalNote = finalNote ? `${finalNote} (${qty} pcs)` : `${r.category} (${qty} pcs)`;
      }

      return {
        type: 'EXPENSE' as TransactionType,
        amount: totalAmount,
        qty,
        unitPrice,
        category: r.category,
        note: finalNote || r.category,
        date: r.date || batchDefaultDate,
      };
    });

    addTransactions(transactionsToInsert);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Transaksi"
      subtitle={
        activeTab === 'MULTI'
          ? 'Rekap pengeluaran sekaligus dari catatan teks atau tabel'
          : singleType === 'INCOME'
          ? 'Pemasukan akan menambah saldo kas dan menaikkan jatah belanja harianmu'
          : 'Pengeluaran akan langsung memperbarui jatah belanja harianmu'
      }
      maxWidth={activeTab === 'MULTI' ? '5xl' : 'md'}
    >
      <div className="space-y-4">
        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#F4F1EA] dark:bg-[#1C1A18] rounded-xl border border-[#EDE9E1] dark:border-[#2C2925]">
          <button
            type="button"
            onClick={() => setActiveTab('SINGLE')}
            className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'SINGLE'
                ? 'bg-white dark:bg-[#282622] text-stone-900 dark:text-[#F2EFE9] shadow-2xs font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-850 dark:hover:text-stone-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Satu Transaksi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MULTI')}
            className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'MULTI'
                ? 'bg-white dark:bg-[#282622] text-[#2D6A4F] dark:text-[#42B07E] shadow-2xs font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-850 dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Catat Sekaligus</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: SINGLE MODE FORM */}
        {/* =================================================================== */}
        {activeTab === 'SINGLE' && (
          <form onSubmit={handleSubmitSingle} className="space-y-4">
            {/* Transaction Type Segmented Toggle */}
            <div className="grid grid-cols-2 p-1 bg-[#F4F1EA] dark:bg-[#1C1A18] rounded-xl border border-[#EDE9E1] dark:border-[#2C2925]">
              <button
                type="button"
                onClick={() => {
                  setSingleType('EXPENSE');
                  setSingleUnitPriceStr('');
                  setSingleQtyStr('1');
                }}
                className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  singleType === 'EXPENSE'
                    ? 'bg-white dark:bg-[#282622] text-rose-600 dark:text-rose-400 shadow-2xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                <span>Pengeluaran</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSingleType('INCOME');
                  setSingleUnitPriceStr('');
                  setSingleQtyStr('1');
                }}
                className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  singleType === 'INCOME'
                    ? 'bg-white dark:bg-[#282622] text-[#2D6A4F] dark:text-[#42B07E] shadow-2xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                <span>Pemasukan</span>
              </button>
            </div>

            {/* CONDITIONAL SUB-FORM: INCOME VS EXPENSE */}
            {singleType === 'INCOME' ? (
              <>
                {/* Income Amount Input (Full width, no Qty!) */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Nominal Pemasukan
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#2D6A4F] dark:text-[#42B07E] font-bold text-lg">
                      +Rp
                    </span>
                    <input
                      ref={singleAmountInputRef}
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={
                        singleUnitPriceStr
                          ? parseInt(singleUnitPriceStr, 10).toLocaleString('id-ID')
                          : ''
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, '');
                        setSingleUnitPriceStr(raw);
                      }}
                      className="w-full pl-14 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-2xl font-mono font-bold text-[#2D6A4F] dark:text-[#42B07E] placeholder-stone-300 dark:placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] dark:focus:border-[#42B07E] tabular-nums transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Quick Income Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mr-1">
                    Cepat:
                  </span>
                  {QUICK_INCOME_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleQuickAddSingle(preset.value)}
                      className="px-2.5 py-1 text-xs font-mono font-medium bg-[#E8F5E9] dark:bg-[#1A2E22] hover:bg-[#C8E6C9] dark:hover:bg-[#284835] text-[#2D6A4F] dark:text-[#76CEA2] rounded-lg transition-colors border border-[#C8E6C9] dark:border-[#2A4736]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Income Source Selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Sumber Pemasukan
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INCOME_SOURCE_PRESETS.map((source) => {
                      const isSelected = singleIncomeSource === source;
                      return (
                        <button
                          key={source}
                          type="button"
                          onClick={() => setSingleIncomeSource(source)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-2xs'
                              : 'bg-white dark:bg-[#1C1A18] border-[#E7E3DA] dark:border-[#38342F] text-stone-700 dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-[#25221F]'
                          }`}
                        >
                          {source}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Note / Description */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Keterangan Tambahan <span className="text-stone-400 font-normal">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Tambahan jajan mama, fee project kampus, jual buku"
                    value={singleNote}
                    onChange={(e) => setSingleNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E]"
                  />
                </div>

                {/* Date Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Tanggal Diterima
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSingleDate(getTodayDateString())}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                          singleDate === getTodayDateString()
                            ? 'bg-[#2D6A4F] text-white'
                            : 'bg-[#F4F1EA] dark:bg-[#2C2925] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                        }`}
                      >
                        Hari Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => setSingleDate(getYesterdayDateString())}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                          singleDate === getYesterdayDateString()
                            ? 'bg-[#2D6A4F] text-white'
                            : 'bg-[#F4F1EA] dark:bg-[#2C2925] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                        }`}
                      >
                        Kemarin
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs font-mono text-stone-850 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E]"
                  />
                </div>

                {/* Impact Preview */}
                {singleUnitPrice > 0 && (
                  <div className="p-3 bg-[#E8F5E9] dark:bg-[#1A2E22] border border-[#C8E6C9] dark:border-[#2A4736] rounded-xl flex items-center justify-between text-xs text-[#2D6A4F] dark:text-[#76CEA2]">
                    <span>Sisa saldo kas akan bertambah:</span>
                    <span className="font-mono font-bold text-sm">+{formatIDR(singleUnitPrice)}</span>
                  </div>
                )}

                {/* Submit Income Button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={singleUnitPrice <= 0}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
                  >
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {singleUnitPrice > 0
                        ? `Simpan Pemasukan (${formatIDR(singleUnitPrice)})`
                        : 'Simpan Pemasukan'}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              /* EXPENSE SUB-FORM */
              <>
                {/* Price & Quantity Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Amount Input */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Nominal {singleQty > 1 ? 'Harga Satuan' : 'Rupiah'}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 dark:text-stone-500 font-bold text-lg">
                        Rp
                      </span>
                      <input
                        ref={singleAmountInputRef}
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={
                          singleUnitPriceStr
                            ? parseInt(singleUnitPriceStr, 10).toLocaleString('id-ID')
                            : ''
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, '');
                          setSingleUnitPriceStr(raw);
                        }}
                        className="w-full pl-12 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-2xl font-mono font-bold text-stone-900 dark:text-[#F2EFE9] placeholder-stone-300 dark:placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] dark:focus:border-[#42B07E] tabular-nums transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Quantity / Jumlah Input with Mobile Stepper Buttons */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Jumlah (Biji/Pcs)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const current = parseInt(singleQtyStr, 10) || 1;
                          if (current > 1) {
                            setSingleQtyStr(String(current - 1));
                          }
                        }}
                        disabled={singleQty <= 1}
                        aria-label="Kurangi jumlah"
                        className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#E7E3DA] dark:border-[#38342F] bg-white dark:bg-[#1C1A18] text-stone-700 dark:text-stone-300 hover:bg-[#F4F1EA] dark:hover:bg-[#2C2925] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
                      >
                        <Minus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={singleQtyStr}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d]/g, '');
                            if (raw === '') {
                              setSingleQtyStr('');
                            } else {
                              const num = Math.min(999, parseInt(raw, 10));
                              setSingleQtyStr(String(num));
                            }
                          }}
                          onBlur={() => {
                            const num = parseInt(singleQtyStr, 10);
                            if (!num || num < 1) {
                              setSingleQtyStr('1');
                            }
                          }}
                          className="w-full py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-center text-xl font-mono font-bold text-stone-900 dark:text-[#F2EFE9] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] dark:focus:border-[#42B07E] transition-all"
                          placeholder="1"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const current = parseInt(singleQtyStr, 10) || 1;
                          if (current < 999) {
                            setSingleQtyStr(String(current + 1));
                          }
                        }}
                        disabled={singleQty >= 999}
                        aria-label="Tambah jumlah"
                        className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#E7E3DA] dark:border-[#38342F] bg-white dark:bg-[#1C1A18] text-stone-700 dark:text-stone-300 hover:bg-[#F4F1EA] dark:hover:bg-[#2C2925] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Amount Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {QUICK_AMOUNT_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleQuickAddSingle(preset.value)}
                      className="px-2.5 py-1 text-xs font-mono font-medium bg-[#F4F1EA] dark:bg-[#2C2925] hover:bg-[#EDE9E1] dark:hover:bg-[#38342F] text-stone-700 dark:text-stone-300 rounded-lg transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Total Preview if Qty > 1 */}
                {singleQty > 1 && singleUnitPrice > 0 && (
                  <div className="p-2.5 bg-[#E8F5E9] dark:bg-[#1A2E22] border border-[#C8E6C9] dark:border-[#2A4736] rounded-xl flex items-center justify-between text-xs text-[#2D6A4F] dark:text-[#76CEA2]">
                    <span>
                      Perhitungan: {singleQty} × {formatIDR(singleUnitPrice)}
                    </span>
                    <span className="font-mono font-bold text-sm">
                      Total: {formatIDR(singleTotalAmount)}
                    </span>
                  </div>
                )}

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kategori
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TRANSACTION_CATEGORIES.map((cat) => {
                      const isSelected = singleCategory === cat.id;
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSingleCategory(cat.id)}
                          title={cat.description}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                            isSelected
                              ? 'bg-stone-900 dark:bg-[#F2EFE9] text-white dark:text-stone-900 font-semibold border-stone-900 dark:border-[#F2EFE9] shadow-2xs'
                              : 'bg-white dark:bg-[#1C1A18] border-[#E7E3DA] dark:border-[#38342F] text-stone-700 dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-[#25221F]'
                          }`}
                        >
                          <span className={isSelected ? 'text-white dark:text-stone-900' : cat.iconColor}>
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                          </span>
                          <span className="truncate">{cat.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Note / Description */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Keterangan / Nama Barang <span className="text-stone-400 font-normal">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Tissue Paseo, Nasi padang, Bensin"
                    value={singleNote}
                    onChange={(e) => setSingleNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E]"
                  />
                </div>

                {/* Date Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Tanggal Transaksi
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSingleDate(getTodayDateString())}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                          singleDate === getTodayDateString()
                            ? 'bg-[#2D6A4F] text-white'
                            : 'bg-[#F4F1EA] dark:bg-[#2C2925] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                        }`}
                      >
                        Hari Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => setSingleDate(getYesterdayDateString())}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                          singleDate === getYesterdayDateString()
                            ? 'bg-[#2D6A4F] text-white'
                            : 'bg-[#F4F1EA] dark:bg-[#2C2925] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                        }`}
                      >
                        Kemarin
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs font-mono text-stone-850 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E]"
                  />
                </div>

                {/* Submit Expense Button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={singleTotalAmount <= 0}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {singleTotalAmount > 0
                        ? `Simpan Pengeluaran (${formatIDR(singleTotalAmount)})`
                        : 'Simpan Pengeluaran'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* =================================================================== */}
        {/* TAB 2: MULTI ROW / BATCH ENTRY MODE */}
        {/* =================================================================== */}
        {activeTab === 'MULTI' && (
          <form onSubmit={handleSubmitMulti} className="space-y-4">
            {/* Batch Header Bar */}
            <div className="p-3 sm:p-4 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Default Date picker and shortcuts */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <Calendar className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
                    <span>Tanggal Rekap:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setBatchDefaultDate(getTodayDateString())}
                      className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                        batchDefaultDate === getTodayDateString()
                          ? 'bg-[#2D6A4F] text-white font-semibold'
                          : 'bg-[#F4F1EA] dark:bg-[#2C2925] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setBatchDefaultDate(getYesterdayDateString())}
                      className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                        batchDefaultDate === getYesterdayDateString()
                          ? 'bg-[#2D6A4F] text-white font-semibold'
                          : 'bg-[#F4F1EA] dark:bg-[#2C2925] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      Kemarin
                    </button>
                  </div>
                  <input
                    type="date"
                    value={batchDefaultDate}
                    onChange={(e) => setBatchDefaultDate(e.target.value)}
                    className="px-2.5 py-1 text-xs font-mono bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-lg text-stone-850 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDefaultDateToAll}
                    title="Terapkan tanggal ini ke semua baris di bawah"
                    className="text-xs text-[#2D6A4F] dark:text-[#42B07E] hover:underline font-semibold ml-1"
                  >
                    Terapkan ke Semua Baris
                  </button>
                </div>

                {/* Paste from WA/Notes Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPasteBox(!showPasteBox)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-[#282622] hover:bg-stone-200 dark:hover:bg-[#332F2B] text-stone-700 dark:text-[#F2EFE9] border border-[#E7E3DA] dark:border-[#38342F] transition-all shrink-0"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
                  <span>{showPasteBox ? 'Tutup Tempel Teks' : 'Tempel Teks (WA / Catatan)'}</span>
                </button>
              </div>

              {/* Paste Textarea Area */}
              {showPasteBox && (
                <div className="pt-3 border-t border-[#E7E3DA] dark:border-[#332F2B] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5 font-medium">
                      <Info className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
                      <span>
                        Format yang didukung: tanggal (misal <i>20 sep</i>), ribuan (<i>40 = 40rb</i>), dan jumlah (<i>Tissue (3) 24</i>).
                      </span>
                    </p>
                  </div>
                  <textarea
                    rows={5}
                    placeholder={`20 sep\nSabun muka 40\nSikat gigi 18\nTissue (3) 24\n\n21 sep\nNasi padang 20\nBensin 25`}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    className="w-full p-3 text-xs font-mono bg-white dark:bg-[#23211E] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-[#2D6A4F]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleExtractPastedText}
                      disabled={!pasteText.trim()}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#2D6A4F] text-white hover:bg-[#23563F] disabled:opacity-40 transition-colors shadow-2xs"
                    >
                      Masukkan ke Daftar Baris
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Row Table Container */}
            <div className="border border-[#E7E3DA] dark:border-[#38342F] rounded-xl bg-white dark:bg-[#1E1C1A] overflow-hidden">
              <div className="sm:hidden px-3 pt-2 text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                Geser tabel ke samping untuk melihat semua kolom →
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-[#EDE9E1] dark:border-[#332F2B] bg-[#F8F6F1] dark:bg-[#24211E] text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3 w-32">Tanggal</th>
                      <th className="py-2.5 px-3">Nama Barang / Keterangan</th>
                      <th className="py-2.5 px-3 w-44">Kategori</th>
                      <th className="py-2.5 px-2 w-16 text-center">Jumlah</th>
                      <th className="py-2.5 px-3 w-32 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 w-28 text-right">Total</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE9E1] dark:divide-[#2C2925]">
                    {rows.map((row, index) => {
                      const unitPrice = parseRawNumber(row.unitPriceStr);
                      const qty = typeof row.qty === 'number' && row.qty >= 1 ? row.qty : 1;
                      const rowTotal = unitPrice * qty;

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-[#FAF8F5] dark:hover:bg-[#24211E] transition-colors"
                        >
                          {/* Row Number */}
                          <td className="py-2 px-3 text-center text-xs font-mono text-stone-400 dark:text-stone-500">
                            {index + 1}
                          </td>

                          {/* Date */}
                          <td className="py-2 px-3">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => handleUpdateRow(row.id, 'date', e.target.value)}
                              className="w-full px-2 py-1 text-xs font-mono bg-stone-50 dark:bg-[#282622] border border-[#E7E3DA] dark:border-[#38342F] rounded-lg text-stone-850 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F]"
                            />
                          </td>

                          {/* Item Name / Note */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="Misal: Tissue, Nasi, Bensin"
                              value={row.note}
                              onChange={(e) => handleUpdateRow(row.id, 'note', e.target.value)}
                              className="w-full px-2.5 py-1 text-xs bg-stone-50 dark:bg-[#282622] border border-[#E7E3DA] dark:border-[#38342F] rounded-lg text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-[#2D6A4F]"
                            />
                          </td>

                          {/* Category */}
                          <td className="py-2 px-3">
                            <select
                              value={row.category}
                              onChange={(e) =>
                                handleUpdateRow(row.id, 'category', e.target.value as TransactionCategory)
                              }
                              className="w-full px-2 py-1 text-xs bg-stone-50 dark:bg-[#282622] border border-[#E7E3DA] dark:border-[#38342F] rounded-lg text-stone-800 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F]"
                            >
                              {TRANSACTION_CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.shortLabel} - {cat.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Quantity */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={row.qty}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => handleUpdateRow(row.id, 'qty', e.target.value)}
                              onBlur={() => {
                                if (!row.qty || Number(row.qty) < 1) {
                                  handleUpdateRow(row.id, 'qty', 1);
                                }
                              }}
                              className="w-full px-1.5 py-1 text-xs font-mono font-bold text-center bg-stone-50 dark:bg-[#282622] border border-[#E7E3DA] dark:border-[#38342F] rounded-lg text-stone-900 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F]"
                            />
                          </td>

                          {/* Unit Price */}
                          <td className="py-2 px-3">
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-stone-400 text-xs font-semibold">
                                Rp
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={
                                  row.unitPriceStr
                                    ? parseInt(row.unitPriceStr, 10).toLocaleString('id-ID')
                                    : ''
                                }
                                onChange={(e) => handleUpdateRow(row.id, 'unitPriceStr', e.target.value)}
                                className="w-full pl-7 pr-2 py-1 text-xs font-mono font-medium text-right bg-stone-50 dark:bg-[#282622] border border-[#E7E3DA] dark:border-[#38342F] rounded-lg text-stone-900 dark:text-[#F2EFE9] placeholder-stone-300 dark:placeholder-stone-700 focus:outline-none focus:border-[#2D6A4F] tabular-nums"
                              />
                            </div>
                          </td>

                          {/* Total (Calculated) */}
                          <td className="py-2 px-3 text-right">
                            <span className="text-xs font-mono font-bold text-[#2D6A4F] dark:text-[#76CEA2] tabular-nums">
                              {rowTotal > 0 ? formatIDR(rowTotal) : 'Rp 0'}
                            </span>
                          </td>

                          {/* Delete Button */}
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.id)}
                              className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title="Hapus baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Add Row Button */}
              <div className="p-3 bg-[#FAF8F5] dark:bg-[#24211E] border-t border-[#EDE9E1] dark:border-[#332F2B] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-[#1E1C1A] hover:bg-[#F2EFE9] dark:hover:bg-[#2C2925] text-stone-700 dark:text-stone-300 border border-[#E7E3DA] dark:border-[#38342F] transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E]" />
                  <span>Tambah Baris Belanjaan</span>
                </button>

                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono text-center sm:text-right">
                  {validRowsToSubmit.length} dari {rows.length} barang siap disimpan
                </span>
              </div>
            </div>

            {/* Multi-Row Total Footer & Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-stone-500 dark:text-stone-400">Total Rekap:</span>
                <span className="text-lg sm:text-xl font-mono font-bold text-stone-900 dark:text-[#F2EFE9] tabular-nums">
                  {formatIDR(multiTotalAmount)}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  ({validRowsToSubmit.length} barang)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={validRowsToSubmit.length === 0}
                  className="flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Simpan Semua ({validRowsToSubmit.length} Barang)</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
