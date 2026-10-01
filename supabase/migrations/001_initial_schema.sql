-- ============================================================
-- PaintPro SaaS Premium — Supabase PostgreSQL Schema
-- Run in Supabase SQL Editor: https://app.supabase.com
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Profiles ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name       TEXT NOT NULL DEFAULT '',
  company_name    TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  pincode         TEXT,
  gst_number      TEXT,
  logo_url        TEXT,
  signature_url   TEXT,
  default_gst             NUMERIC(5,2)  NOT NULL DEFAULT 18,
  default_validity        TEXT          NOT NULL DEFAULT '15 days',
  default_advance         NUMERIC(5,2)  NOT NULL DEFAULT 30,
  default_labour_interior NUMERIC(10,2) NOT NULL DEFAULT 0,
  default_labour_exterior NUMERIC(10,2) NOT NULL DEFAULT 0,
  default_terms           TEXT,
  quotation_prefix        TEXT          NOT NULL DEFAULT 'PP',
  quotation_counter       INT           NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Brands ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brands (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  logo_url   TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Categories ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id    UUID REFERENCES brands(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Products ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id             UUID REFERENCES brands(id) ON DELETE SET NULL,
  category_id          UUID REFERENCES categories(id) ON DELETE SET NULL,
  name                 TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  brand                TEXT NOT NULL,
  category             TEXT NOT NULL,
  subcategory          TEXT NOT NULL DEFAULT '',
  description          TEXT NOT NULL DEFAULT '',
  technical_description TEXT,
  finish               TEXT,
  application          TEXT,
  coverage             NUMERIC(10,2),
  recommended_coats    INT DEFAULT 2,
  pack_sizes           TEXT[] DEFAULT '{}',
  product_code         TEXT,
  initials             TEXT,
  image_url            TEXT,
  active               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full text search index on products
CREATE INDEX IF NOT EXISTS idx_products_search ON products
  USING GIN (to_tsvector('english', name || ' ' || brand || ' ' || category || ' ' || subcategory || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);

-- ─── Product Images ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  image_type  TEXT NOT NULL DEFAULT 'primary', -- primary, gallery, before_after, technical
  alt_text    TEXT,
  sort_order  INT NOT NULL DEFAULT 0
);

-- ─── Shades ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shades (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id   UUID REFERENCES brands(id) ON DELETE SET NULL,
  brand      TEXT NOT NULL DEFAULT '',
  code       TEXT NOT NULL,
  name       TEXT NOT NULL,
  family     TEXT NOT NULL DEFAULT '',
  hex        TEXT NOT NULL DEFAULT '#cccccc',
  image_url  TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(brand, code)
);

CREATE INDEX IF NOT EXISTS idx_shades_brand ON shades(brand);
CREATE INDEX IF NOT EXISTS idx_shades_family ON shades(family);

-- ─── Product Prices ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_prices (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  pack_size     TEXT NOT NULL DEFAULT '1L',
  unit          TEXT NOT NULL DEFAULT 'L',
  mrp           NUMERIC(10,2),
  working_price NUMERIC(10,2),
  dealer_price  NUMERIC(10,2),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, pack_size)
);

-- ─── Customers ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  address    TEXT,
  city       TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_owner ON customers(owner_id);

-- ─── Projects ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  project_name  TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'Apartment',
  project_type  TEXT NOT NULL DEFAULT 'Residential',
  address       TEXT,
  city          TEXT,
  floors        INT  NOT NULL DEFAULT 1,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);

-- ─── Quotations ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id      UUID REFERENCES customers(id) ON DELETE SET NULL,
  project_id       UUID REFERENCES projects(id) ON DELETE SET NULL,
  quotation_number TEXT NOT NULL,
  quotation_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until      DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
  -- Customer snapshot
  customer_name    TEXT,
  customer_phone   TEXT,
  customer_email   TEXT,
  customer_city    TEXT,
  site_address     TEXT,
  -- Project snapshot
  project_name     TEXT,
  property_type    TEXT,
  project_type     TEXT,
  floors           INT DEFAULT 1,
  -- Financial
  subtotal         NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2)  NOT NULL DEFAULT 0,
  discount_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
  taxable_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst_percent      NUMERIC(5,2)  NOT NULL DEFAULT 18,
  gst_amount       NUMERIC(14,2) NOT NULL DEFAULT 0,
  grand_total      NUMERIC(14,2) NOT NULL DEFAULT 0,
  advance_percent  NUMERIC(5,2)  NOT NULL DEFAULT 0,
  advance_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
  balance_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
  -- Labour
  labour_interior_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  labour_exterior_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Content
  status           TEXT NOT NULL DEFAULT 'Draft',
  terms            TEXT,
  notes            TEXT,
  rooms_json       JSONB NOT NULL DEFAULT '[]',
  items_json       JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, quotation_number)
);

CREATE INDEX IF NOT EXISTS idx_quotations_owner ON quotations(owner_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(quotation_date DESC);

-- ─── Quotation Activity ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotation_activity (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id   UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  activity_type  TEXT NOT NULL, -- created, updated, sent, accepted, rejected, pdf_downloaded
  metadata       JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Favorites ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS favorites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_owner ON favorites(owner_id);

-- ─── Updated At Triggers ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_customers
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_projects
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_quotations
  BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Auto-create Profile on Signup ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;

-- Products, brands, categories, shades: globally readable
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shades ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Catalog: public read
CREATE POLICY "catalog_public_read" ON products FOR SELECT USING (active = true);
CREATE POLICY "brands_public_read" ON brands FOR SELECT USING (active = true);
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (active = true);
CREATE POLICY "shades_public_read" ON shades FOR SELECT USING (active = true);
CREATE POLICY "product_images_public_read" ON product_images FOR SELECT USING (true);

-- Authenticated writes to catalog (owner mutations via service-role in scripts)
CREATE POLICY "catalog_auth_write" ON products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "brands_auth_write" ON brands FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "categories_auth_write" ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Profiles: own profile only
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- Customers: owner only
CREATE POLICY "customers_owner" ON customers
  FOR ALL USING (auth.uid() = owner_id);

-- Projects: owner only
CREATE POLICY "projects_owner" ON projects
  FOR ALL USING (auth.uid() = owner_id);

-- Quotations: owner only
CREATE POLICY "quotations_owner" ON quotations
  FOR ALL USING (auth.uid() = owner_id);

-- Quotation activity: owner via quotation
CREATE POLICY "quotation_activity_owner" ON quotation_activity
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quotations q
      WHERE q.id = quotation_id AND q.owner_id = auth.uid()
    )
  );

-- Favorites: owner only
CREATE POLICY "favorites_owner" ON favorites
  FOR ALL USING (auth.uid() = owner_id);

-- Product prices: authenticated read/write
CREATE POLICY "product_prices_read" ON product_prices
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "product_prices_write" ON product_prices
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ─── Storage Buckets ──────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('logos', 'logos', true, 2097152, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('signatures', 'signatures', false, 1048576, ARRAY['image/jpeg','image/png','image/webp']),
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies: logos public read
CREATE POLICY "logos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "logos_owner_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');
CREATE POLICY "logos_owner_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'logos' AND auth.uid() = owner);
CREATE POLICY "logos_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'logos' AND auth.uid() = owner);

-- Signatures: private
CREATE POLICY "signatures_owner" ON storage.objects FOR ALL
  USING (bucket_id = 'signatures' AND auth.uid() = owner);

-- Product images: public read
CREATE POLICY "product_images_storage_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
CREATE POLICY "product_images_auth_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
