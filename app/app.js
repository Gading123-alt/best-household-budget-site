// app.js — pengendali Dompet Keluarga: pindah halaman, gambar ringkasan,
// daftar transaksi, anggaran, dan target tabungan, semua dari data.js.

import { loadState, saveState, spentByCategory, totals } from "./data.js";
import { rupiah, percent, tanggalIndonesia, signedAmount } from "./format.js";
import { drawBudgetChart } from "./chart.js";

const state = loadState();
let editingId = null;

const $ = (id) => document.getElementById(id);

function sortedTx() {
  return [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function budgetRows() {
  const spent = spentByCategory(state);
  return Object.keys(state.budgets).map((cat) => ({
    category: cat,
    budget: state.budgets[cat],
    spent: spent[cat] || 0,
  }));
}

function renderSummary() {
  const t = totals(state);
  $("sumIncome").textContent = rupiah(t.income);
  $("sumExpense").textContent = rupiah(t.expense);
  $("sumBalance").textContent = rupiah(t.balance);
  $("balanceNote").textContent = percent(t.balance, t.income) + "% dari pemasukan";
  const saved = state.goals.reduce((s, g) => s + g.saved, 0);
  $("sumSaving").textContent = rupiah(state.budgets["Tabungan"] || 0);
  $("expenseNote").textContent = Object.keys(state.budgets).length + " kategori aktif";

  const rows = budgetRows();
  drawBudgetChart($("budgetChart"), rows);

  $("goalPreview").innerHTML = state.goals
    .slice(0, 2)
    .map((g) => goalHtml(g, false))
    .join("");

  const recent = sortedTx().slice(0, 5);
  $("recentTable").querySelector("tbody").innerHTML = recent
    .map(
      (tx) =>
        `<tr><td>${tanggalIndonesia(tx.date)}</td><td>${escapeHtml(tx.desc)}</td><td>${escapeHtml(tx.category)}</td><td class="num ${tx.type}">${signedAmount(tx)}</td></tr>`
    )
    .join("");

  const worst = rows.filter((r) => r.budget > 0).sort((a, b) => b.spent / b.budget - a.spent / a.budget)[0];
  if (worst) {
    const p = percent(worst.spent, worst.budget);
    $("tipText").textContent =
      worst.category + " sudah memakai " + p + "% anggarannya — sisakan " + rupiah(Math.max(0, worst.budget - worst.spent)) +
      " sampai akhir bulan. Cek halaman Anggaran kalau ada kategori yang sudah lewat batas.";
  }
}

function goalHtml(g, withActions) {
  const p = percent(g.saved, g.target);
  const done = g.saved >= g.target;
  return `<div class="goal">
    <div class="rowhead"><strong>${escapeHtml(g.name)}</strong>
    <span>${rupiah(g.saved)} dari ${rupiah(g.target)} · ${p}% ${done ? '<span class="done">— Lunas!</span>' : ""}</span></div>
    <div class="bar"><i style="width:${Math.min(100, p)}%"></i></div>
    ${withActions ? `<div class="addgoal">
      <input type="number" min="1000" step="1000" placeholder="Setor Rp…" aria-label="Setor ke ${escapeHtml(g.name)}" data-goal="${g.id}">
      <button class="btn small" type="button" data-add-goal="${g.id}">+ Setor</button>
      <button class="btn small danger" type="button" data-del-goal="${g.id}">Hapus</button>
    </div>` : ""}
  </div>`;
}

function renderGoals() {
  $("goalList").innerHTML = state.goals.map((g) => goalHtml(g, true)).join("") || "<p>Belum ada target. Buat satu di bawah.</p>";
  document.querySelectorAll("[data-add-goal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.querySelector(`input[data-goal="${btn.dataset.addGoal}"]`);
      const amount = Number(input.value);
      if (!amount || amount < 1000) { alert("Tulis jumlah setor minimal Rp 1.000."); return; }
      const goal = state.goals.find((g) => g.id === btn.dataset.addGoal);
      goal.saved += amount;
      saveState(state);
      renderAll();
    });
  });
  document.querySelectorAll("[data-del-goal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm("Hapus target ini?")) return;
      state.goals = state.goals.filter((g) => g.id !== btn.dataset.delGoal);
      saveState(state);
      renderAll();
    });
  });
}

function renderBudgets() {
  const rows = budgetRows();
  $("budgetList").innerHTML = rows
    .map((r) => {
      const p = percent(r.spent, r.budget);
      const over = r.spent > r.budget;
      const cls = over ? "over" : p >= 85 ? "warn" : "";
      return `<div class="budgetrow">
        <div class="rowhead"><strong>${escapeHtml(r.category)}</strong>
        <span>${rupiah(r.spent)} dari ${rupiah(r.budget)} · <b class="${over ? "over" : ""}">${p}%</b></span></div>
        <div class="bar"><i class="${cls}" style="width:${Math.min(100, p)}%"></i></div>
        <span class="pct">${over ? "Lewat anggaran " + rupiah(r.spent - r.budget) + " — kurangi minggu ini." : "Sisa " + rupiah(r.budget - r.spent) + " sampai akhir bulan."}</span>
        <div style="margin-top:8px"><button class="btn small" type="button" data-edit-budget="${escapeHtml(r.category)}">Ubah Anggaran</button></div>
      </div>`;
    })
    .join("");
  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);
  $("budgetTotals").textContent = "Total anggaran " + rupiah(totalBudget) + " · terpakai " + rupiah(totalSpent) + " (" + percent(totalSpent, totalBudget) + "%).";

  document.querySelectorAll("[data-edit-budget]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.editBudget;
      const current = state.budgets[cat];
      const raw = prompt("Anggaran baru untuk " + cat + " (Rp):", String(current));
      if (raw === null) return;
      const value = Number(raw.replace(/[^0-9]/g, ""));
      if (!value || value < 1000) { alert("Tulis angka minimal Rp 1.000."); return; }
      state.budgets[cat] = value;
      saveState(state);
      renderAll();
    });
  });
}

function txRow(tx) {
  return `<tr><td>${tanggalIndonesia(tx.date)}</td><td>${escapeHtml(tx.desc)}</td><td>${escapeHtml(tx.category)}</td>
  <td class="num ${tx.type}">${signedAmount(tx)}</td>
  <td><button class="btn small" type="button" data-edit-tx="${tx.id}">Ubah</button>
  <button class="btn small danger" type="button" data-del-tx="${tx.id}">Hapus</button></td></tr>`;
}

function renderTransactions() {
  const q = $("q").value.trim().toLowerCase();
  const cat = $("filterCat").value;
  const type = $("filterType").value;
  const list = sortedTx().filter(
    (tx) =>
      (!q || tx.desc.toLowerCase().includes(q)) &&
      (!cat || tx.category === cat) &&
      (!type || tx.type === type)
  );
  $("allTable").querySelector("tbody").innerHTML = list.map(txRow).join("") || `<tr><td colspan="5">Tidak ada transaksi yang cocok.</td></tr>`;
  $("txCount").textContent = list.length + " transaksi ditampilkan dari " + state.transactions.length + " transaksi.";

  document.querySelectorAll("[data-edit-tx]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tx = state.transactions.find((t) => t.id === btn.dataset.editTx);
      editingId = tx.id;
      $("fDesc").value = tx.desc;
      $("fAmount").value = tx.amount;
      $("fType").value = tx.type;
      $("fCategory").value = tx.category;
      $("fDate").value = tx.date;
      $("submitTx").textContent = "Simpan Perubahan";
      $("cancelEdit").hidden = false;
      $("formHint").textContent = "Mengubah transaksi: " + tx.desc + ". Tekan Simpan Perubahan untuk menyimpan.";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  document.querySelectorAll("[data-del-tx]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tx = state.transactions.find((t) => t.id === btn.dataset.delTx);
      if (!confirm("Hapus transaksi “" + tx.desc + "”?")) return;
      state.transactions = state.transactions.filter((t) => t.id !== tx.id);
      saveState(state);
      renderAll();
    });
  });
}

function fillCategorySelects() {
  const opts = state.categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  $("fCategory").innerHTML = opts;
  $("filterCat").innerHTML = `<option value="">Semua kategori</option>` + opts;
}

function renderAll() {
  fillCategorySelects();
  renderSummary();
  renderTransactions();
  renderBudgets();
  renderGoals();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function route() {
  const hash = window.location.hash.replace(/^#\/?/, "") || "ringkasan";
  const name = ["ringkasan", "transaksi", "anggaran", "target"].includes(hash) ? hash : "ringkasan";
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  $("view-" + name).classList.remove("hidden");
  document.querySelectorAll(".mainnav a").forEach((a) => a.classList.toggle("active", a.dataset.route === name));
  if (name === "ringkasan") renderSummary();
}

$("txForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = Number($("fAmount").value);
  const desc = $("fDesc").value.trim();
  if (!desc || !amount || amount < 1000) { alert("Isi keterangan dan jumlah minimal Rp 1.000."); return; }
  if (editingId) {
    const tx = state.transactions.find((t) => t.id === editingId);
    Object.assign(tx, { desc, amount, type: $("fType").value, category: $("fCategory").value, date: $("fDate").value });
    editingId = null;
    $("submitTx").textContent = "Simpan Transaksi";
    $("cancelEdit").hidden = true;
    $("formHint").textContent = "Transaksi tersimpan di peramban ini, jadi tetap ada saat halaman dibuka lagi.";
  } else {
    state.transactions.push({
      id: "t" + Date.now(),
      date: $("fDate").value,
      desc,
      category: $("fCategory").value,
      type: $("fType").value,
      amount,
    });
  }
  saveState(state);
  e.target.reset();
  $("fDate").value = "2026-11-27";
  renderAll();
});

$("cancelEdit").addEventListener("click", () => {
  editingId = null;
  $("txForm").reset();
  $("fDate").value = "2026-11-27";
  $("submitTx").textContent = "Simpan Transaksi";
  $("cancelEdit").hidden = true;
});

["q", "filterCat", "filterType"].forEach((id) => $(id).addEventListener("input", renderTransactions));

$("catForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("cName").value.trim();
  const budget = Number($("cBudget").value);
  if (!name || !budget || budget < 1000) { alert("Isi nama kategori dan anggaran minimal Rp 1.000."); return; }
  if (state.categories.includes(name)) { alert("Kategori itu sudah ada."); return; }
  state.categories.push(name);
  state.budgets[name] = budget;
  saveState(state);
  e.target.reset();
  renderAll();
  window.location.hash = "#/anggaran";
});

$("goalForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("gName").value.trim();
  const target = Number($("gTarget").value);
  const saved = Number($("gSaved").value) || 0;
  if (!name || !target || target < 10000) { alert("Isi nama target dan jumlah minimal Rp 10.000."); return; }
  state.goals.push({ id: "g" + Date.now(), name, target, saved });
  saveState(state);
  e.target.reset();
  $("gSaved").value = "0";
  renderAll();
});

$("monthSelect").addEventListener("change", (e) => {
  alert("Data contoh ini untuk November 2026. Bulan " + e.target.selectedOptions[0].text + " belum diisi — kembali ke November 2026.");
  e.target.value = "2026-11";
});

window.addEventListener("hashchange", route);
window.addEventListener("resize", () => renderSummary());
renderAll();
route();
