// chart.js — grafik batang Anggaran vs Realisasi, digambar langsung di <canvas>
// tanpa pustaka apa pun, supaya muat awal tetap ringan.

import { rupiahShort } from "./format.js";

const GREEN = "#166534";
const AMBER = "#f59e0b";
const RED = "#b91c1c";
const INK = "#1c2b21";
const MUTED = "#5b6b60";

export function drawBudgetChart(canvas, rows) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 640;
  const cssH = 300;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.font = "12px 'Segoe UI', system-ui, sans-serif";

  const max = Math.max(100000, ...rows.map((r) => Math.max(r.budget, r.spent)));
  const padL = 118;
  const padR = 70;
  const padT = 8;
  const padB = 8;
  const plotW = cssW - padL - padR;
  const rowH = (cssH - padT - padB) / rows.length;
  const barH = 11;

  rows.forEach((row, i) => {
    const y = padT + i * rowH;
    const midY = y + rowH / 2;
    ctx.fillStyle = INK;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(row.category, padL - 8, midY);
    const budgetW = (row.budget / max) * plotW;
    const spentW = (row.spent / max) * plotW;
    ctx.fillStyle = GREEN;
    ctx.fillRect(padL, midY - barH - 2, budgetW, barH);
    ctx.fillStyle = row.spent > row.budget ? RED : AMBER;
    ctx.fillRect(padL, midY + 2, spentW, barH);
    ctx.fillStyle = MUTED;
    ctx.textAlign = "left";
    ctx.fillText(rupiahShort(row.budget), padL + budgetW + 6, midY - barH / 2 - 2);
    ctx.fillText(rupiahShort(row.spent), padL + spentW + 6, midY + barH / 2 + 2);
  });
}
