// data.js — satu-satunya tempat data Dompet Keluarga tinggal:
// data awal keluarga, daftar kategori, anggaran, dan target tabungan,
// plus simpan/muat ke localStorage peramban.

export const STORAGE_KEY = "dompet-keluarga-v1";

export const CATEGORIES = [
  "Gaji",
  "Belanja Harian",
  "Listrik & Air",
  "Sekolah Anak",
  "Transport",
  "Tabungan",
  "Hiburan",
];

export function seedState() {
  return {
    categories: [...CATEGORIES],
    budgets: {
      "Belanja Harian": 2000000,
      "Listrik & Air": 700000,
      "Sekolah Anak": 1200000,
      "Transport": 800000,
      "Tabungan": 1000000,
      "Hiburan": 500000,
    },
    goals: [
      { id: "g1", name: "Dana Darurat", target: 10000000, saved: 6200000 },
      { id: "g2", name: "Liburan ke Yogyakarta", target: 5000000, saved: 2750000 },
      { id: "g3", name: "Renovasi Dapur", target: 8000000, saved: 1500000 },
    ],
    transactions: [
      { id: "t1", date: "2026-11-01", desc: "Gaji November", category: "Gaji", type: "in", amount: 6500000 },
      { id: "t2", date: "2026-11-02", desc: "SPP sekolah Delion", category: "Sekolah Anak", type: "out", amount: 750000 },
      { id: "t3", date: "2026-11-03", desc: "Belanja pasar tradisional", category: "Belanja Harian", type: "out", amount: 450000 },
      { id: "t4", date: "2026-11-04", desc: "Token listrik", category: "Listrik & Air", type: "out", amount: 400000 },
      { id: "t5", date: "2026-11-05", desc: "Setor tabungan dana darurat", category: "Tabungan", type: "out", amount: 1000000 },
      { id: "t6", date: "2026-11-07", desc: "Bensin motor & mobil", category: "Transport", type: "out", amount: 400000 },
      { id: "t7", date: "2026-11-09", desc: "Supermarket mingguan", category: "Belanja Harian", type: "out", amount: 620000 },
      { id: "t8", date: "2026-11-11", desc: "Buku & alat tulis anak", category: "Sekolah Anak", type: "out", amount: 200000 },
      { id: "t9", date: "2026-11-13", desc: "Nonton bioskop keluarga", category: "Hiburan", type: "out", amount: 180000 },
      { id: "t10", date: "2026-11-15", desc: "Sayur & buah pasar", category: "Belanja Harian", type: "out", amount: 280000 },
      { id: "t11", date: "2026-11-17", desc: "Tagihan air PDAM", category: "Listrik & Air", type: "out", amount: 220000 },
      { id: "t12", date: "2026-11-19", desc: "Ojek online antar anak", category: "Transport", type: "out", amount: 200000 },
      { id: "t13", date: "2026-11-21", desc: "Beras 10 kg + minyak", category: "Belanja Harian", type: "out", amount: 150000 },
      { id: "t14", date: "2026-11-22", desc: "Langganan streaming", category: "Hiburan", type: "out", amount: 120000 },
      { id: "t15", date: "2026-11-23", desc: "Les tambahan anak", category: "Sekolah Anak", type: "out", amount: 150000 },
      { id: "t16", date: "2026-11-24", desc: "Parkir & tol", category: "Transport", type: "out", amount: 150000 },
      { id: "t17", date: "2026-11-25", desc: "Jajan akhir pekan", category: "Hiburan", type: "out", amount: 120000 },
      { id: "t18", date: "2026-11-26", desc: "Daging & lauk seminggu", category: "Belanja Harian", type: "out", amount: 350000 },
    ],
  };
}

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch (err) {
    // localStorage tidak tersedia: pakai data awal di memori saja.
  }
  return seedState();
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Penyimpanan penuh atau diblokir: perubahan tetap berlaku di halaman ini.
  }
}

export function spentByCategory(state) {
  const spent = {};
  for (const tx of state.transactions) {
    if (tx.type === "out") spent[tx.category] = (spent[tx.category] || 0) + tx.amount;
  }
  return spent;
}

export function totals(state) {
  let income = 0;
  let expense = 0;
  for (const tx of state.transactions) {
    if (tx.type === "in") income += tx.amount;
    else expense += tx.amount;
  }
  return { income, expense, balance: income - expense };
}
