# JBB - Marketplace Jual Beli Barang Bekas (Enterprise-Grade)

Platform marketplace C2C/B2C jual beli barang bekas modern, responsif, berkinerja tinggi, dan scalable yang dirancang secara native untuk ekosistem **Cloudflare** (Cloudflare Workers, Pages, Cloudflare D1 SQLite Edge, Cloudflare R2 Object Storage, dan KV Caching).

---

## 🚀 Arsitektur & Teknologi

| Lapisan | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Monorepo** | `pnpm` + `turborepo` | Isolasi paket, fast build caching, dan seamless workspace linking |
| **Frontend** | **Next.js 15** + **OpenNext** / **Vinext** | App Router, Server/Client components, optimized for Cloudflare Workers |
| **Styling** | **Tailwind CSS v4** + Modern UI Primitives | CSS v4 engine baru, mobile-first responsive layout, dark/light theme |
| **Backend API** | **Hono v4** (`hono@4.13.5`) | Sub-millisecond routing di Cloudflare Workers, strict type-safe RPC |
| **Validasi** | **Zod v4** (`zod@4.5.4`) | Single source of truth untuk skema validasi form & DTO payload |
| **Database & ORM**| **Drizzle ORM** (`drizzle-orm@0.45.2`) + **Cloudflare D1** | SQLite di edge tanpa cold-start, type-safe queries, relasi & migrasi |
| **Media Storage** | **Cloudflare R2** | Object storage S3-compatible tanpa biaya egress fee |
| **Data Fetching** | **TanStack Query v5** (`@tanstack/react-query@5.102.8`) | State management, client caching, dan optimistic UI updates |

---

## 📂 Struktur Monorepo

```
jbb-barang-bekas/
├── apps/
│   ├── web/                     # Frontend Next.js 15 (App Router, Tailwind v4, OpenNext)
│   │   ├── app/                 # Beranda, /cari, /jual, /listing/[id], /nego
│   │   ├── components/          # Navbar, Mobile Bottom Bar, Cards, Modals, Timeline
│   │   └── lib/                 # API Client, Formatters (IDR, TimeAgo, Condition)
│   │
│   └── api/                     # Backend Hono Cloudflare Worker API
│       ├── src/routes/          # Auth, Categories, Listings, Offers, Orders, Reviews, Uploads
│       ├── src/middlewares/     # CORS, Auth Guard (Web Crypto JWT), Error Handler
│       └── wrangler.jsonc       # Bindings: D1 (DB), R2 (STORAGE), KV (CACHE)
│
├── packages/
│   ├── database/                # Drizzle ORM schemas, relations, and Indonesian seed dataset
│   ├── validators/              # Shared Zod 4 schemas (Auth, Listing, Offer, Order, Review)
│   └── types/                   # Shared TypeScript interfaces, Enums, and API Envelopes
│
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 🌟 Fitur Utama & Keunggulan

1. **Inspeksi Kondisi Fisik Transparan (Smart Condition Inspector)**:
   - Grading jelas: *Baru (100%), Seperti Baru (95%+), Bekas Bagus (85%+), Bekas Wajar (70%+), Ada Minus Minor, Sparepart*.
   - Verifikasi kelengkapan: Fullset, Batangan, Dus, Nota Asli, Garansi Resmi Aktif.

2. **Mesin Tawar-Menawar Resmi (Negotiation Engine)**:
   - Calon pembeli dapat menawar harga secara resmi (*Make an Offer*).
   - Penjual dapat **Terima (Accept)**, **Tawar Balik (Counter Offer)**, atau **Tolak (Reject)**.
   - Saat tawaran diterima, harga barang terkunci khusus untuk pembeli tersebut selama 24 jam.

3. **Rekening Bersama 100% Aman (Escrow State Machine)**:
   - Dana pembeli ditahan aman di sistem Rekber JBB.
   - Penjual mengemas & memasukkan nomor resi pengiriman.
   - Pembeli memiliki **jendela inspeksi 48 jam** saat barang tiba untuk cek fungsi fisik.
   - Dana baru diteruskan ke saldo penjual setelah pembeli mengonfirmasi atau waktu inspeksi habis tanpa sengketa.

4. **Sistem Kepercayaan & Reputasi (Trust & Safety)**:
   - Badge Penjual Terverifikasi KTP & No. WhatsApp.
   - Skor reputasi & ulasan bintang transaksional.
   - Opsi COD (Ketemuan Langsung) di tempat umum terverifikasi.

---

## 🛠️ Menjalankan di Lingkungan Lokal

### 1. Install Dependensi
```bash
pnpm install
```

### 2. Jalankan Mode Development (Semua Aplikasi)
```bash
pnpm dev
```
- **Frontend Web**: `http://localhost:3000`
- **Backend API Worker**: `http://localhost:8787`

### 3. Jalankan Typecheck & Build
```bash
pnpm turbo typecheck
pnpm turbo build
```

---

## ☁️ Deployment ke Cloudflare

### Deploy Backend API ke Cloudflare Workers:
```bash
pnpm --filter @jbb/api deploy
```

### Deploy Frontend ke Cloudflare Pages / Workers via OpenNext:
```bash
pnpm --filter @jbb/web deploy
```

---

## 👥 Demo Akun Siap Pakai (1-Click Login)
- **Pembeli**: `dimas.ardi@example.com` (Dimas Ardiansyah - Skor: 92%)
- **Penjual**: `budi.gadget@example.com` (Budi Santoso - Skor: 98% Terverifikasi KTP)
