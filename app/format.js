// format.js — semua cara angka dan tanggal ditampilkan di Dompet Keluarga.

export function rupiah(amount) {
  return "Rp " + Number(amount).toLocaleString("id-ID");
}

export function rupiahShort(amount) {
  if (amount >= 1000000) return "Rp " + (amount / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " jt";
  if (amount >= 1000) return "Rp " + Math.round(amount / 1000) + " rb";
  return rupiah(amount);
}

export function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function tanggalIndonesia(iso) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return Number(parts[2]) + " " + months[Number(parts[1]) - 1] + " " + parts[0];
}

export function signedAmount(tx) {
  return (tx.type === "in" ? "+ " : "− ") + rupiah(tx.amount);
}
