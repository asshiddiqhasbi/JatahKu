import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import type { Transaction, TransactionCategory, TransactionType } from '../../types/transaction';
import { TRANSACTION_CATEGORIES } from '../../constants/categories';
import {
  QUICK_AMOUNT_PRESETS,
  QUICK_INCOME_PRESETS,
  INCOME_SOURCE_PRESETS,
} from '../../constants/presets';
import { parseRawNumber, formatIDR } from '../../utils/currency';
import { getTodayDateString, getYesterdayDateString } from '../../utils/dateUtils';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [unitPriceStr, setUnitPriceStr] = useState<string>('');
  const [qtyStr, setQtyStr] = useState<string>('1');
  const [category, setCategory] = useState<TransactionCategory>('Makanan');
  const [incomeSource, setIncomeSource] = useState<string>('Transfer Ortu');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transaction && isOpen) {
      setType(transaction.type);
      const initialUnitPrice =
        transaction.unitPrice && transaction.unitPrice > 0
          ? transaction.unitPrice
          : transaction.qty && transaction.qty > 1
          ? Math.round(transaction.amount / transaction.qty)
          : transaction.amount;

      setUnitPriceStr(initialUnitPrice ? initialUnitPrice.toString() : '');
      setQtyStr(transaction.qty ? transaction.qty.toString() : '1');
      setCategory(transaction.category || 'Makanan');
      setIncomeSource(transaction.source || 'Transfer Ortu');
      setNote(transaction.note || '');
      setDate(transaction.date || getTodayDateString());

      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 50);
    }
  }, [transaction, isOpen]);

  if (!transaction) return null;

  const unitPrice = parseRawNumber(unitPriceStr);
  const qty = Math.max(1, parseInt(qtyStr, 10) || 1);
  const totalAmount = type === 'EXPENSE' ? unitPrice * qty : unitPrice;

  const handleQuickAdd = (val: number) => {
    const current = parseRawNumber(unitPriceStr);
    setUnitPriceStr((current + val).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unitPrice <= 0) {
      amountInputRef.current?.focus();
      return;
    }

    let finalNote = note.trim();
    if (type === 'EXPENSE') {
      if (qty > 1 && !finalNote.includes(`${qty}x`) && !finalNote.includes(`${qty} pcs`)) {
        finalNote = finalNote ? `${finalNote} (${qty} pcs)` : `${category} (${qty} pcs)`;
      }
    }

    onSave(transaction.id, {
      type,
      amount: totalAmount,
      qty: type === 'EXPENSE' ? qty : undefined,
      unitPrice: type === 'EXPENSE' ? unitPrice : undefined,
      category: type === 'EXPENSE' ? category : 'Lainnya',
      source: type === 'INCOME' ? incomeSource : undefined,
      note: finalNote || (type === 'EXPENSE' ? category : incomeSource),
      date,
    });

    onClose();
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus transaksi "${note || category}" senilai ${formatIDR(transaction.amount)}?`
    );
    if (confirmed) {
      onDelete(transaction.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Transaksi"
      subtitle="Perbaiki kesalahan input kategori, harga, jumlah, atau tanggal"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type Segmented Toggle */}
        <div className="grid grid-cols-2 p-1 bg-[#F4F1EA] dark:bg-[#1C1A18] rounded-xl border border-[#EDE9E1] dark:border-[#2C2925]">
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              type === 'EXPENSE'
                ? 'bg-white dark:bg-[#282622] text-rose-600 dark:text-rose-400 shadow-2xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
            <span>Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => setType('INCOME')}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              type === 'INCOME'
                ? 'bg-white dark:bg-[#282622] text-[#2D6A4F] dark:text-[#42B07E] shadow-2xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            <span>Pemasukan</span>
          </button>
        </div>

        {/* Expense Sub-form */}
        {type === 'EXPENSE' ? (
          <>
            {/* Amount and Quantity Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Unit Price Input */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Harga Satuan (IDR)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 font-bold text-lg">
                    Rp
                  </span>
                  <input
                    ref={amountInputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={
                      unitPriceStr ? parseInt(unitPriceStr, 10).toLocaleString('id-ID') : ''
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, '');
                      setUnitPriceStr(raw);
                    }}
                    className="w-full pl-12 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-2xl font-mono font-bold text-stone-900 dark:text-[#F2EFE9] placeholder-stone-300 dark:placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] dark:focus:border-[#42B07E] tabular-nums transition-all"
                    required
                  />
                </div>
              </div>

              {/* Quantity Input with Stepper */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Jumlah (Biji/Pcs)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseInt(qtyStr, 10) || 1;
                      if (current > 1) {
                        setQtyStr(String(current - 1));
                      }
                    }}
                    disabled={qty <= 1}
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
                      value={qtyStr}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, '');
                        if (raw === '') {
                          setQtyStr('');
                        } else {
                          const num = Math.min(999, parseInt(raw, 10));
                          setQtyStr(String(num));
                        }
                      }}
                      onBlur={() => {
                        const num = parseInt(qtyStr, 10);
                        if (!num || num < 1) {
                          setQtyStr('1');
                        }
                      }}
                      className="w-full py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-center text-xl font-mono font-bold text-stone-900 dark:text-[#F2EFE9] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] dark:focus:border-[#42B07E] transition-all"
                      placeholder="1"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseInt(qtyStr, 10) || 1;
                      if (current < 999) {
                        setQtyStr(String(current + 1));
                      }
                    }}
                    disabled={qty >= 999}
                    aria-label="Tambah jumlah"
                    className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#E7E3DA] dark:border-[#38342F] bg-white dark:bg-[#1C1A18] text-stone-700 dark:text-stone-300 hover:bg-[#F4F1EA] dark:hover:bg-[#2C2925] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              {QUICK_AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleQuickAdd(preset.value)}
                  className="px-2.5 py-1 text-xs font-mono font-medium bg-[#F4F1EA] dark:bg-[#2C2925] hover:bg-[#EDE9E1] dark:hover:bg-[#38342F] text-stone-700 dark:text-stone-300 rounded-lg transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Total Calculation Preview */}
            {qty > 1 && unitPrice > 0 && (
              <div className="p-2.5 bg-[#E8F5E9] dark:bg-[#1A2E22] border border-[#C8E6C9] dark:border-[#2A4736] rounded-xl flex items-center justify-between text-xs text-[#2D6A4F] dark:text-[#76CEA2]">
                <span>
                  Perhitungan: {qty} × {formatIDR(unitPrice)}
                </span>
                <span className="font-mono font-bold text-sm">
                  Total: {formatIDR(totalAmount)}
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
                  const isSelected = category === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
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
          </>
        ) : (
          <>
            {/* Income Sub-form */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nominal Pemasukan
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#2D6A4F] dark:text-[#42B07E] font-bold text-lg">
                  +Rp
                </span>
                <input
                  ref={amountInputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={
                    unitPriceStr ? parseInt(unitPriceStr, 10).toLocaleString('id-ID') : ''
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    setUnitPriceStr(raw);
                  }}
                  className="w-full pl-14 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-2xl font-mono font-bold text-[#2D6A4F] dark:text-[#42B07E] placeholder-stone-300 dark:placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] dark:focus:border-[#42B07E] tabular-nums transition-all"
                  required
                />
              </div>
            </div>

            {/* Income Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              {QUICK_INCOME_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleQuickAdd(preset.value)}
                  className="px-2.5 py-1 text-xs font-mono font-medium bg-[#E8F5E9] dark:bg-[#1A2E22] hover:bg-[#D4EDDA] dark:hover:bg-[#233D2E] text-[#2D6A4F] dark:text-[#76CEA2] rounded-lg transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Income Source */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Sumber Pemasukan
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INCOME_SOURCE_PRESETS.map((src) => {
                  const isSelected = incomeSource === src;
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setIncomeSource(src)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#2D6A4F] text-white font-semibold border-[#2D6A4F] shadow-2xs'
                          : 'bg-white dark:bg-[#1C1A18] border-[#E7E3DA] dark:border-[#38342F] text-stone-700 dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-[#25221F]'
                      }`}
                    >
                      {src}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Note / Item Name */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Keterangan / Nama Barang <span className="text-stone-400 font-normal">(opsional)</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Nasi padang, Bensin Pertalite, Laundry"
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
                onClick={() => setDate(getTodayDateString())}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                  date === getTodayDateString()
                    ? 'bg-[#2D6A4F] text-white'
                    : 'bg-[#F4F1EA] dark:bg-[#2C2925] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setDate(getYesterdayDateString())}
                className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${
                  date === getYesterdayDateString()
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-[#F2EFE9] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E]"
            required
          />
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-[#EDE9E1] dark:border-[#2E2A26] flex items-center justify-between gap-2">
          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60 transition-all"
            title="Hapus transaksi ini"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Transaksi</span>
          </button>

          {/* Cancel and Save Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={unitPrice <= 0}
              className="flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
