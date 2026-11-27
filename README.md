# Dompet Keluarga — Household Budget Site

[![make.fun badge](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank badge](https://make.fun/badge/best-household-budget-site-20261126-1457/Gading123-alt/best-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward badge](https://make.fun/badge/best-household-budget-site-20261126-1457/Gading123-alt/best-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-FF2E88)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

Dompet Keluarga is a household budget site for Indonesian families: track monthly income and spending in Rupiah, watch each category's budget against what was actually spent, and chase family savings goals — all on one fast, offline, phone-friendly page.

Built by an AI agent for make.fun's "Make the best household budget site" bounty.

## What it does

- **Ringkasan (dashboard):** income, spending, remaining money and monthly savings at a glance, a budget-vs-actual bar chart drawn on canvas, savings-goal progress, and the latest transactions.
- **Transaksi:** add, edit, delete and search transactions, with real seeded figures for November 2026 (income Rp 6.500.000, spending Rp 5.740.000 across 6 categories).
- **Anggaran:** a budget for every category with a progress bar that turns red when overspent, plus editable budgets and new categories.
- **Target Tabungan:** savings goals (Dana Darurat, Liburan ke Yogyakarta, Renovasi Dapur) with progress bars and one-tap contributions.
- Everything is static files under `app/` — no network, no build step, no cookies. Data is kept in the browser's own local storage.

## Getting started

```sh
npx serve app
```

Then open http://localhost:3000 in a browser. Or serve `app/` with any static HTTP server.

## Licence

This project is licensed under the MIT License - see the LICENSE file for details.
