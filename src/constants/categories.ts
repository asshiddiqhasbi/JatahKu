import type { TransactionCategory } from '../types/transaction';
import {
  Utensils,
  Home,
  Bike,
  GraduationCap,
  Coffee,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryMeta {
  id: TransactionCategory;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  iconName: string;
  description: string;
  accentColor: string;
  badgeClass: string;
  barColor: string;
  iconColor: string;
  iconBg: string;
}

export const TRANSACTION_CATEGORIES: CategoryMeta[] = [
  {
    id: 'Makanan',
    label: 'Makanan & Minuman',
    shortLabel: 'Makanan',
    icon: Utensils,
    iconName: 'Utensils',
    description: 'Sarapan, makan siang, jajan, galon',
    accentColor: 'text-amber-600 bg-amber-50 border-amber-200',
    badgeClass: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60',
    barColor: 'bg-amber-500',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  {
    id: 'Kebutuhan Kos',
    label: 'Kos & Laundry',
    shortLabel: 'Kos',
    icon: Home,
    iconName: 'Home',
    description: 'Laundry, sabun mandi, odol, token listrik kos',
    accentColor: 'text-sky-600 bg-sky-50 border-sky-200',
    badgeClass: 'text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60',
    barColor: 'bg-sky-500',
    iconColor: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
  },
  {
    id: 'Transportasi',
    label: 'Transportasi',
    shortLabel: 'Transport',
    icon: Bike,
    iconName: 'Bike',
    description: 'Bensin motor, ojek online, parkir, angkutan',
    accentColor: 'text-[#2D6A4F] bg-[#E8F5E9] border-emerald-200',
    badgeClass: 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60',
    barColor: 'bg-[#2D6A4F] dark:bg-[#42B07E]',
    iconColor: 'text-[#2D6A4F] dark:text-[#42B07E]',
    iconBg: 'bg-[#E8F5E9] dark:bg-[#1A2E22]',
  },
  {
    id: 'Kuliah',
    label: 'Kuliah & Tugas',
    shortLabel: 'Kuliah',
    icon: GraduationCap,
    iconName: 'GraduationCap',
    description: 'Fotokopi modul, print tugas, buku, alat tulis',
    accentColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    badgeClass: 'text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60',
    barColor: 'bg-indigo-500',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
  },
  {
    id: 'Hiburan & Sosial',
    label: 'Nongkrong & Hiburan',
    shortLabel: 'Nongkrong',
    icon: Coffee,
    iconName: 'Coffee',
    description: 'Ngopi bareng teman, jajan bareng, hiburan',
    accentColor: 'text-rose-600 bg-rose-50 border-rose-200',
    badgeClass: 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60',
    barColor: 'bg-rose-500',
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
  },
  {
    id: 'Lainnya',
    label: 'Kebutuhan Lainnya',
    shortLabel: 'Lainnya',
    icon: MoreHorizontal,
    iconName: 'MoreHorizontal',
    description: 'Pulsa, kuota internet, obat, kebutuhan tak terduga',
    accentColor: 'text-stone-600 bg-stone-50 border-stone-200',
    badgeClass: 'text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700',
    barColor: 'bg-stone-400 dark:bg-stone-500',
    iconColor: 'text-stone-500 dark:text-stone-400',
    iconBg: 'bg-[#F4F1EA] dark:bg-[#2C2925]',
  },
];

export function getCategoryMeta(id: TransactionCategory | string): CategoryMeta {
  const found = TRANSACTION_CATEGORIES.find((c) => c.id === id);
  if (found) return found;
  return {
    id: 'Lainnya',
    label: 'Kebutuhan Lainnya',
    shortLabel: 'Lainnya',
    icon: MoreHorizontal,
    iconName: 'MoreHorizontal',
    description: 'Kebutuhan lainnya',
    accentColor: 'text-stone-600 bg-stone-50 border-stone-200',
    badgeClass: 'text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700',
    barColor: 'bg-stone-400 dark:bg-stone-500',
    iconColor: 'text-stone-500 dark:text-stone-400',
    iconBg: 'bg-[#F4F1EA] dark:bg-[#2C2925]',
  };
}
