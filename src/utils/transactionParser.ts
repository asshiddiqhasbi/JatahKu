import type { TransactionCategory } from '../types/transaction';

export interface ParsedTransactionDraft {
  id: string;
  note: string;
  amount: number;
  qty: number;
  unitPrice: number;
  category: TransactionCategory;
  date: string;
}

const MONTH_MAP: Record<string, number> = {
  jan: 1,
  januari: 1,
  january: 1,
  feb: 2,
  februari: 2,
  february: 2,
  mar: 3,
  maret: 3,
  march: 3,
  apr: 4,
  april: 4,
  mei: 5,
  may: 5,
  jun: 6,
  juni: 6,
  june: 6,
  jul: 7,
  juli: 7,
  july: 7,
  agu: 8,
  agt: 8,
  agustus: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  okt: 10,
  oct: 10,
  oktober: 10,
  october: 10,
  nov: 11,
  november: 11,
  des: 12,
  dec: 12,
  desember: 12,
  december: 12,
};

/**
 * Parses header line representing a date, e.g.:
 * - "20 sep", "20 september", "senin 20 sep", "20 sep 2026"
 * - "20/09", "20-09", "20/09/2026", "20/9"
 * - "Hari ini", "Kemarin"
 */
export function parseDateHeader(
  line: string,
  referenceYear = new Date().getFullYear()
): string | null {
  const cleaned = line.trim().toLowerCase().replace(/^[-*•#\s]+|[:\s]+$/g, '');
  if (!cleaned) return null;

  if (cleaned === 'hari ini' || cleaned === 'today') {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  if (cleaned === 'kemarin' || cleaned === 'yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Format 1: Textual month e.g. "20 sep", "20 september", "senin 20 sep"
  const textDateMatch = cleaned.match(
    /^(?:(?:senin|selasa|rabu|kamis|jumat|sabtu|minggu|mon|tue|wed|thu|fri|sat|sun)[,\s]+)?(\d{1,2})\s+([a-z]{3,9})(?:\s+(\d{2,4}))?$/i
  );
  if (textDateMatch) {
    const day = parseInt(textDateMatch[1], 10);
    const monthKey = textDateMatch[2].toLowerCase();
    const month =
      MONTH_MAP[monthKey] ||
      MONTH_MAP[Object.keys(MONTH_MAP).find((k) => monthKey.startsWith(k)) || ''];

    if (day >= 1 && day <= 31 && month) {
      let year = referenceYear;
      if (textDateMatch[3]) {
        const rawYear = parseInt(textDateMatch[3], 10);
        year = rawYear < 100 ? 2000 + rawYear : rawYear;
      }
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Format 2: Numeric e.g. "20/09", "20-09", "20/09/2026"
  const numDateMatch = cleaned.match(
    /^(?:(?:senin|selasa|rabu|kamis|jumat|sabtu|minggu)[,\s]+)?(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/i
  );
  if (numDateMatch) {
    const day = parseInt(numDateMatch[1], 10);
    const month = parseInt(numDateMatch[2], 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      let year = referenceYear;
      if (numDateMatch[3]) {
        const rawYear = parseInt(numDateMatch[3], 10);
        year = rawYear < 100 ? 2000 + rawYear : rawYear;
      }
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
}

const CATEGORY_KEYWORDS: Record<TransactionCategory, string[]> = {
  Makanan: [
    // Kata dasar & aktivitas makan
    'makan',
    'minum',
    'sarapan',
    'maksi',
    'dinner',
    'lunch',
    'jajan',
    'cemilan',
    'snack',
    'lauk',
    'porsi',
    'prasmanan',
    // Nasi & olahan beras
    'nasi',
    'nasgor',
    'naspad',
    'nasi uduk',
    'nasi kuning',
    'nasi liwet',
    'nasi bakar',
    'nasi goreng',
    'nasi gila',
    'nasi rames',
    'nasi kebuli',
    'beras',
    // Olahan ayam, bebek, daging, lele, ikan
    'ayam',
    'geprek',
    'aygep',
    'ayam bakar',
    'ayam goreng',
    'ayam penyet',
    'katsu',
    'bebek',
    'bebek goreng',
    'bebek bakar',
    'ikan',
    'lele',
    'pecel lele',
    'nila',
    'gurame',
    'tongkol',
    'teri',
    'sarden',
    'daging',
    'sapi',
    'kambing',
    'iga',
    'buntut',
    'rawon',
    'rendang',
    'gulai',
    'gule',
    'sate',
    'satay',
    'taichan',
    'telur',
    'telor',
    'ceplok',
    'dadar',
    'balado',
    'ati ampela',
    'usus',
    'kulit',
    'paru',
    'babat',
    'lalapan',
    'sambal',
    'sambel',
    'penyetan',
    // Soto & Sup Nusantara
    'soto',
    'soto ayam',
    'soto sapi',
    'soto babat',
    'soto lamongan',
    'soto betawi',
    'soto madura',
    'coto',
    // Bubur & Lontong
    'bubur',
    'bubur ayam',
    'buryam',
    'bubur kacang ijo',
    'burjo',
    'lontong',
    'lontong sayur',
    'kupat',
    'ketupat',
    'kupat tahu',
    // Sayur, tahu, tempe, masakan rumahan
    'sayur',
    'sop',
    'sup',
    'lodeh',
    'asem',
    'bayam',
    'kangkung',
    'tumis',
    'capcay',
    'cap cay',
    'oseng',
    'gudeg',
    'orek',
    'tahu',
    'tempe',
    'mendoan',
    'bacem',
    'pecel',
    'gado-gado',
    'karedok',
    'ketoprak',
    // Mie, bakso, pasta, olahan tepung
    'mie',
    'mi ',
    'miegor',
    'indomie',
    'warmindo',
    'magelangan',
    'bakmi',
    'mie ayam',
    'yamien',
    'bihun',
    'kwetiau',
    'kwetiaw',
    'ramen',
    'udon',
    'spaghetti',
    'pasta',
    'makaroni',
    'bakso',
    'baso',
    'baso aci',
    'boci',
    'cuanki',
    'pentol',
    'siomay',
    'batagor',
    'cilok',
    'cireng',
    'cimol',
    'cilor',
    'maklor',
    'seblak',
    'pempek',
    'dimsum',
    'pangsit',
    'gacoan',
    'mie gacoan',
    'wizzmie',
    'mie pedas',
    // Gorengan & jajanan
    'gorengan',
    'bakwan',
    'tahu bulat',
    'tahu gejrot',
    'pancong',
    'kue pancong',
    'jasuke',
    'pisang goreng',
    'pisgor',
    'pisang keju',
    'otak-otak',
    'bala-bala',
    'gehu',
    'risol',
    'risoles',
    'lumpia',
    'martabak',
    'terang bulan',
    'kue',
    'roti',
    'donat',
    'donut',
    'pukis',
    'serabi',
    'croissant',
    'sandwich',
    'toast',
    'waffle',
    'crepes',
    // Fast food & modern food
    'burger',
    'pizza',
    'kebab',
    'hotdog',
    'corndog',
    'kentang goreng',
    'nugget',
    'sosis',
    'mcd',
    'mcdonalds',
    'kfc',
    'hokben',
    'richeese',
    'solaria',
    'aw',
    'burger king',
    'subway',
    'sushi',
    'takoyaki',
    'steak',
    'bento',
    // Minuman & kopi
    'kopi',
    'coffee',
    'kopsus',
    'espresso',
    'americano',
    'latte',
    'cappuccino',
    'tubruk',
    'teh',
    'tea',
    'es teh',
    'esteh',
    'es jeruk',
    'teh manis',
    'teh tarik',
    'thai tea',
    'green tea',
    'matcha',
    'boba',
    'chatime',
    'mixue',
    'haus',
    'janji jiwa',
    'kenangan',
    'point coffee',
    'jus',
    'juice',
    'alpukat',
    'mangga',
    'jeruk',
    'melon',
    'susu',
    'milk',
    'yogurt',
    'ultra milk',
    'milo',
    'es campur',
    'es teler',
    'es buah',
    'es kelapa',
    'kelapa muda',
    'cendol',
    'cincau',
    'wedang',
    'jahe',
    'soda',
    'fanta',
    'cola',
    'sprite',
    'nutrisari',
    // Tempat makan
    'warteg',
    'padang',
    'angkringan',
    'burjo',
    'kantin',
    'cafe',
    'kafe',
    'food court',
    'gofood',
    'grabfood',
    'shopeefood',
    // Camilan kemasan & manis
    'chiki',
    'taro',
    'chitato',
    'oreo',
    'wafer',
    'beng-beng',
    'silverqueen',
    'cokelat',
    'coklat',
    'es krim',
    'ice cream',
    'gelato',
    'popcorn',
    'biskuit',
  ],
  Transportasi: [
    'bensin',
    'pertalite',
    'pertamax',
    'solar',
    'shell',
    'bp',
    'spbu',
    'pom bensin',
    'ojol',
    'gojek',
    'goride',
    'gocar',
    'grab',
    'grabride',
    'grabcar',
    'maxim',
    'indrive',
    'angkot',
    'jaklingko',
    'bus',
    'transjakarta',
    'tj',
    'damri',
    'kereta',
    'krl',
    'mrt',
    'lrt',
    'parkir',
    'karcis',
    'tol',
    'e-toll',
    'etoll',
    'tambal ban',
    'cuci motor',
    'cuci mobil',
    'oli',
    'ganti oli',
    'servis',
    'bengkel',
    'helm',
    'jas hujan',
    'ongkir',
  ],
  'Kebutuhan Kos': [
    'sabun',
    'sabun mandi',
    'sabun cuci',
    'sabun muka',
    'facial wash',
    'cuci muka',
    'facial',
    'skincare',
    'sunscreen',
    'moisturizer',
    'serum',
    'toner',
    'micellar',
    'shampoo',
    'sampo',
    'kondisioner',
    'odol',
    'pasta gigi',
    'sikat',
    'sikat gigi',
    'laundry',
    'cuci baju',
    'setrika',
    'deterjen',
    'rinso',
    'daia',
    'soklin',
    'pewangi',
    'downy',
    'molto',
    'sunlight',
    'mama lemon',
    'cuci piring',
    'galon',
    'air galon',
    'isi galon',
    'aqua galon',
    'le minerale',
    'listrik',
    'token',
    'token listrik',
    'pulsa listrik',
    'pln',
    'kost',
    'kos',
    'kosan',
    'kamar',
    'sewa kos',
    'iuran',
    'sampah',
    'sapu',
    'pel',
    'serokan',
    'kain lap',
    'tisu',
    'tissue',
    'kapas',
    'cotton bud',
    'hanger',
    'gantungan',
    'colokan',
    'kabel roll',
    'lampu',
    'bohlam',
    'kamper',
    'pewangi ruangan',
    'stella',
    'glade',
    'baygon',
    'hit',
    'autan',
    'parfum',
    'deodorant',
    'body wash',
    'lotion',
    'minyak kayu putih',
    'kayu putih',
    'telon',
    'tolak angin',
    'panadol',
    'bodrex',
    'paracetamol',
    'obat',
    'vitamin',
    'plester',
    'hansaplast',
    'betadine',
    'salonpas',
    'gas',
    'tabung gas',
    'lpg',
    'wifi',
  ],
  Kuliah: [
    'kuliah',
    'kampus',
    'buku',
    'print',
    'ngeprint',
    'cetak',
    'fotokopi',
    'fotocopy',
    'foto copy',
    'fc',
    'jilid',
    'makalah',
    'tugas',
    'modul',
    'laporan',
    'skripsi',
    'proposal',
    'kertas',
    'hvs',
    'a4',
    'pulpen',
    'pensil',
    'penghapus',
    'tipe-x',
    'tipex',
    'penggaris',
    'spidol',
    'stabilo',
    'binder',
    'buku tulis',
    'map',
    'amplop',
    'materai',
    'stapler',
    'seminar',
    'webinar',
    'workshop',
    'sertifikat',
    'praktikum',
    'jas lab',
    'spp',
    'ukt',
    'daftar ulang',
    'ktm',
  ],
  'Hiburan & Sosial': [
    'nongkrong',
    'nongki',
    'ngopi bareng',
    'jalan-jalan',
    'liburan',
    'staycation',
    'wisata',
    'bioskop',
    'cinema',
    'xxi',
    'cgv',
    'cinepolis',
    'tiket bioskop',
    'nonton',
    'film',
    'game',
    'top up',
    'topup',
    'diamond',
    'mobile legends',
    'ml',
    'valorant',
    'steam',
    'playstation',
    'ps',
    'rental ps',
    'billiard',
    'karaoke',
    'spotify',
    'netflix',
    'youtube premium',
    'disney',
    'party',
    'kado',
    'hadiah',
    'ulang tahun',
    'ultah',
    'patungan',
    'traktir',
  ],
  Lainnya: [],
};

// Pre-computed sorted keyword list for high performance
interface KeywordEntry {
  category: TransactionCategory;
  kw: string;
  len: number;
}

const SORTED_KEYWORD_ENTRIES: KeywordEntry[] = (() => {
  const entries: KeywordEntry[] = [];
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Lainnya') continue;
    for (const kw of keywords) {
      entries.push({
        category: category as TransactionCategory,
        kw: kw.toLowerCase(),
        len: kw.length,
      });
    }
  }
  // Sort descending by length: longer, more specific phrases match first!
  return entries.sort((a, b) => b.len - a.len);
})();

export function detectCategory(text: string): TransactionCategory {
  const lower = text.toLowerCase();

  for (const entry of SORTED_KEYWORD_ENTRIES) {
    const { category, kw, len } = entry;

    // For short words (3 chars or less like "aw", "krl", "mrt", "gas", "mie", "jus", "pel"):
    // Require word boundaries so it doesn't falsely match inside words like "sawit" or "gelas"
    if (len <= 3) {
      const regex = new RegExp(`(^|[^a-z0-9])${kw}([^a-z0-9]|$)`, 'i');
      if (regex.test(lower)) {
        return category;
      }
    } else {
      // Special exclusion: "kopi" should not match if the word is "fotokopi" or "fotocopy"
      if (
        kw === 'kopi' &&
        (lower.includes('fotokopi') || lower.includes('fotocopy') || lower.includes('foto copy'))
      ) {
        continue;
      }

      if (lower.includes(kw)) {
        return category;
      }
    }
  }

  return 'Lainnya';
}

/**
 * Parses free text containing multiple lines of notes into structured transaction drafts.
 * Supports:
 * - Date headers: "20 sep", "20/09", "kemarin" (affects subsequent items)
 * - Shorthand amounts: "Sabun muka 40" -> 40.000, "18k" -> 18.000, "24" -> 24.000
 * - Quantities in parentheses: "Tissue (3) 24" -> Qty 3, Total 24.000, UnitPrice 8.000
 * - Explicit unit price with @: "Tissue (3) @ 8" -> Qty 3, UnitPrice 8.000, Total 24.000
 */
export function parseNotesToTransactions(
  rawText: string,
  defaultDate: string
): ParsedTransactionDraft[] {
  if (!rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: ParsedTransactionDraft[] = [];
  let currentDate = defaultDate;

  for (const line of lines) {
    // Check if line is a Date Header (e.g. "20 sep", "21 sep", "20/09")
    const parsedHeaderDate = parseDateHeader(line);
    if (parsedHeaderDate) {
      currentDate = parsedHeaderDate;
      continue;
    }

    // 1. Remove leading list bullets / numbers like "1. ", "- ", "* ", "1) "
    const cleanedLine = line.replace(/^[\d]+[\.\)]\s*|^[-*•]\s*/, '').trim();
    if (!cleanedLine) continue;

    let amount = 0;
    let note = cleanedLine;
    let isExplicitUnitPrice = false;

    // Pattern 1: Explicit unit price with @ e.g. "Tissue (3) @ 8" or "Kopi 2 @ 15k"
    const atMatch = cleanedLine.match(/@\s*(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:k|rb)?\b/i);
    if (atMatch) {
      isExplicitUnitPrice = true;
      let rawVal = parseFloat(atMatch[1].replace(',', '.'));
      if (atMatch[0].toLowerCase().includes('k') || atMatch[0].toLowerCase().includes('rb')) {
        amount = Math.round(rawVal * 1000);
      } else if (rawVal < 1000) {
        amount = Math.round(rawVal * 1000);
      } else {
        amount = Math.round(rawVal);
      }
      note = cleanedLine.replace(atMatch[0], '').trim();
    } else {
      // Pattern 2: Number with 'k' or 'rb' e.g. "18k", "18.5k", "25rb"
      const kMatch = cleanedLine.match(/(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:k|rb)\b/i);
      if (kMatch) {
        const numVal = parseFloat(kMatch[1].replace(',', '.'));
        amount = Math.round(numVal * 1000);
        note = cleanedLine.replace(kMatch[0], '').trim();
      } else {
        // Pattern 3: Standard numbers with dot separators, e.g. "Rp 18.000", "Rp18.000", "18.000"
        const numWithDotsMatch = cleanedLine.match(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+)/i);
        if (numWithDotsMatch) {
          const rawNumStr = numWithDotsMatch[1].replace(/\./g, '');
          amount = parseInt(rawNumStr, 10);
          note = cleanedLine.replace(numWithDotsMatch[0], '').trim();
        } else {
          // Pattern 4: Shorthand numbers without 'k' e.g. "Sabun muka 40", "Sikat gigi 18", "Tissue (3) 24"
          const endNumMatch = cleanedLine.match(/(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*$/i);
          if (endNumMatch) {
            const rawVal = parseFloat(endNumMatch[1].replace(',', '.'));
            // Numbers < 1000 represent thousands (ribu) in daily student expenses
            if (rawVal < 1000) {
              amount = Math.round(rawVal * 1000);
            } else {
              amount = Math.round(rawVal);
            }
            note = cleanedLine.slice(0, endNumMatch.index).trim();
          }
        }
      }
    }

    // Clean note from trailing/leading punctuation like ":" or "-"
    note = note.replace(/^[:\-\s]+|[:\-\s]+$/g, '').trim();

    // Check for quantity in note, e.g. "(3)", "(2)", "3 biji", "3x", "4 pcs"
    let qty = 1;
    // Format A: in parentheses "(3)" or "(2)"
    const parenQtyMatch = note.match(/\(\s*(\d+)\s*\)/);
    if (parenQtyMatch) {
      const parsedQty = parseInt(parenQtyMatch[1], 10);
      if (parsedQty > 0 && parsedQty <= 1000) {
        qty = parsedQty;
        note = note.replace(parenQtyMatch[0], '').trim();
      }
    } else {
      // Format B: word units "3 biji", "3 pcs", "3 buah", "3x"
      const wordQtyMatch = note.match(
        /\b(\d+)\s*(?:biji|pcs|buah|kotak|bungkus|cup|porsi|pack|lembar|btg|butir|x)\b/i
      );
      if (wordQtyMatch) {
        const parsedQty = parseInt(wordQtyMatch[1], 10);
        if (parsedQty > 0 && parsedQty <= 1000) {
          qty = parsedQty;
          note = note.replace(wordQtyMatch[0], '').trim();
        }
      } else {
        // Format C: prefix "3 tissue", "2 sabun"
        const prefixQtyMatch = note.match(/^(\d+)\s+(?:x\s+)?([a-zA-Z].+)$/);
        if (prefixQtyMatch && parseInt(prefixQtyMatch[1], 10) <= 50) {
          qty = parseInt(prefixQtyMatch[1], 10);
          note = prefixQtyMatch[2].trim();
        }
      }
    }

    note = note.replace(/^[:\-\s]+|[:\-\s]+$/g, '').trim();

    // If note is completely empty, fallback
    if (!note && amount > 0) {
      note = 'Pengeluaran';
    }

    if (amount > 0 || note) {
      const capitalizedNote = note ? note.charAt(0).toUpperCase() + note.slice(1) : 'Pengeluaran';

      let totalAmount = amount;
      let unitPrice = amount;

      if (isExplicitUnitPrice) {
        // User wrote e.g. "Tissue (3) @ 8" -> unitPrice = 8000, total = 24000
        unitPrice = amount;
        totalAmount = unitPrice * qty;
      } else if (qty > 1) {
        // User wrote e.g. "Tissue (3) 24" -> total = 24000, unitPrice = 8000
        totalAmount = amount;
        unitPrice = Math.round(amount / qty);
      }

      results.push({
        id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        note: capitalizedNote,
        qty,
        unitPrice,
        amount: totalAmount,
        category: detectCategory(cleanedLine),
        date: currentDate,
      });
    }
  }

  return results;
}
