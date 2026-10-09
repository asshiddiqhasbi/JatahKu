import type { TransactionCategory } from '../types/transaction';

export interface CategoryMeta {
  id: TransactionCategory;
  label: string;
  shortLabel: string;
  iconName: string;
  description: string;
  accentColor: string;
}

export const TRANSACTION_CATEGORIES: CategoryMeta[] = [
  {
    id: 'Makanan',
    label: 'Makanan & Minuman',
    shortLabel: 'Makanan',
    iconName: 'Utensils',
    description: 'Sarapan, makan siang, jajan, galon',
    accentColor: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'Kebutuhan Kos',
    label: 'Kebutuhan Kos & Laundry',
    shortLabel: 'Kos',
    iconName: 'Home',
    description: 'Laundry, sabun mandi, odol, token listrik kos',
    accentColor: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'Transportasi',
    label: 'Transportasi & Bensin',
    shortLabel: 'Transport',
    iconName: 'Bike',
    description: 'Bensin motor, ojek online, parkir, angkutan',
    accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'Kuliah',
    label: 'Kuliah & Tugas',
    shortLabel: 'Kuliah',
    iconName: 'GraduationCap',
    description: 'Fotokopi modul, print tugas, buku, alat tulis',
    accentColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'Hiburan & Sosial',
    label: 'Hiburan & Nongkrong',
    shortLabel: 'Nongkrong',
    iconName: 'Coffee',
    description: 'Ngopi bareng teman, jajan bareng, hiburan',
    accentColor: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    id: 'Lainnya',
    label: 'Kebutuhan Lainnya',
    shortLabel: 'Lainnya',
    iconName: 'MoreHorizontal',
    description: 'Pulsa, kuota internet, obat, kebutuhan tak terduga',
    accentColor: 'text-slate-600 bg-slate-50 border-slate-200',
  },
];
