export type TransactionType = 'EXPENSE' | 'INCOME';

export type TransactionCategory =
  | 'Makanan'
  | 'Kebutuhan Kos'
  | 'Transportasi'
  | 'Kuliah'
  | 'Hiburan & Sosial'
  | 'Lainnya';

export interface Transaction {
  id: string;
  cycleId: string;
  date: string; // YYYY-MM-DD
  time?: string; // Optional legacy time
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  qty?: number; // Jumlah / Kuantitas barang (misal: 3 biji/pcs)
  unitPrice?: number; // Harga per satuan barang
  source?: string; // Sumber pemasukan (misal: Transfer Ortu, Gaji, dll)
  note: string;
  createdAt: string;
}

export interface DayGroupedTransactions {
  date: string; // YYYY-MM-DD
  displayDate: string; // 'Hari Ini', 'Kemarin', 'Selasa, 28 Sep 2026'
  totalExpense: number;
  totalIncome: number;
  items: Transaction[];
}
