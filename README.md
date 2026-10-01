# PaintPro SaaS — Production Painter Workspace & Estimation Platform

PaintPro is a production-grade, deployable full-stack SaaS platform designed specifically for professional painting contractors, interior decorators, and architectural coatings specialists in India.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row Level Security & Auth)**, PaintPro preserves the entire visual aesthetic, brand hierarchy, and measurement workflows of the gold-standard reference prototype.

---

## 🌟 Key Capabilities & Features

### 1. Architectural Coatings Catalog
- **Multi-Brand Catalog**: Complete curated coverage of Asian Paints, Berger Paints, Birla Opus, and Dulux coatings.
- **Product Hierarchy**: Brand → Category (Interior, Exterior, Enamels, Waterproofing, Primers, Wood Finishes, Textures) → Subcategory → Finish → Application.
- **Dynamic Search & Multi-Filters**: Instant client and server search across product codes, descriptions, sheens, and brands.
- **Persistent Favorites**: Save preferred products directly linked to your painter account.
- **Product Details**: Complete technical specifications, coverage rates (sq.ft/unit), recommended coat counts, and packaging variants.

### 2. Precision Quotation Studio (`/quotations/new` & `/quotations/[number]/edit`)
- **Room-by-Room Measurement Engine**:
  - Length, Width, and Height (ft) inputs.
  - Automatic computation of **Wall Area ($2 \times (L + W) \times H$)**, **Ceiling Area ($L \times W$)**, and **Carpet Area**.
  - Window & Door deduction tracking with positive net wall area validation.
  - Surface condition classification (New Plaster, Sound Existing Paint, Peeling/Flaking, Damp/Moisture, Cracked Surface).
- **Scope of Work Itemization**:
  - Material and labour line items linked directly to catalog products.
  - Automatic coverage & paint quantity estimator: $\text{Quantity} = \frac{\text{Area} \times \text{Coats}}{\text{Coverage}}$.
  - Manual override toggle for quantity, rate, and units (L, kg, sq.ft, job).
- **Labour Cost Breakdown**:
  - Interior and exterior rate per sq.ft or customizable lumpsum labour lines.
- **Commercial Summary**:
  - Automatic Subtotal calculation.
  - Discount percentage and absolute rupee deduction.
  - Indian GST calculation (customizable default 18%).
  - Advance payment percentage & amount calculation with remaining balance.
  - Custom terms & conditions and quotation prefixes (e.g. `PP-2025-001`).

### 3. Printable / Exportable Quotation Document (`/quotations/[number]`)
- Print-optimized CSS stylesheet matching high-end Indian architectural quotation templates.
- One-click browser print to PDF (`Ctrl + P` / Print button).
- Client contact card, site address, detailed room dimensions table, scope of work breakdown, tax invoice summary, and contractor signature sign-off box.
- Status management (Draft, Sent, Accepted, Rejected).

### 4. Interactive Price Book (`/price-book`)
- Real-time inline editing of MRP, Working Contractor Rate, and Dealer Purchase Price per product across package sizes (1L, 4L, 10L, 20L).
- Only modified rows are sent to Supabase in batch for optimal network performance.

### 5. Client Relationship Management (`/customers`)
- Customer CRM with telephone, email, property location, and site notes.
- Quick "Add to Quote" action directly pre-populating client details into new estimates.
- Inline edit and delete with confirmation dialogs.

### 6. Digital Colour Shade Finder (`/shades`)
- Curated architectural shade library across Berger Silk and Asian Paints Royale palettes.
- Search by shade name, alphanumeric code (e.g., `1P2048`, `0943`), or HEX values.
- Color family filters (Whites & Creams, Earth & Browns, Blues, Greens, Warm & Yellows, Pastels, Darks).
- One-touch copy for shade code and HEX color values with toast feedback.

### 7. Business & Defaults Settings (`/settings`)
- Business Profile: Contractor Name, Company Trade Name, GSTIN, Phone, Email, Office Address.
- Estimation Defaults: Default GST %, Default Advance %, Default Interior/Exterior Labour Rate, Default Payment Terms.
- Account Security & Password updates.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components & Server Actions)
- **Language**: TypeScript 5.7+ (Strict mode)
- **Styling**: Tailwind CSS + Custom PaintPro Theme (Warm Parchment `#f6f4f1`, Dark Slate `#1f2528`, Heritage Gold `#d2ad76`)
- **Icons**: Lucide React
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Auth**: Supabase SSR Authentication with middleware-based route protection
- **State Management**: Zustand 5 (persistent quotation draft in local storage)
- **Testing**: Vitest with unit test suites for estimation calculations and utilities

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.17+ or 20+
- A Supabase project (Free or Pro tier)

### 2. Environment Setup
Copy `.env.example` (or `.env.local.example`) to `.env.local`:
```bash
cp .env.local.example .env.local
```

Fill in your Supabase project credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Migration & RLS Setup
In your Supabase SQL Editor:
1. Open [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).
2. Run the script. This provisions:
   - `profiles` table with automatic user creation trigger
   - `brands`, `categories`, `products`, `product_prices`, `shades`, `product_images`
   - `customers` table with owner-based RLS
   - `quotations`, `quotation_rooms`, `quotation_items` tables with cascade rules
   - `favorites` table for saved products

### 4. Catalog Seeding
Populate all 180+ paint products, variants, pack prices, and shades:
```bash
npm run seed
```

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the test suite:
```bash
npm test
```

Run TypeScript compilation check:
```bash
npm run typecheck
```

Build for production:
```bash
npm run build
```

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import the repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**. Vercel will build the application using `npm run build` and publish it on an optimized global edge CDN.
