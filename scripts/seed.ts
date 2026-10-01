#!/usr/bin/env tsx
/**
 * PaintPro Catalog Seed Script
 * Usage: npm run seed
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY (only used server-side in this script)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Copy .env.example to .env.local and fill in your Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── Data ─────────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function truncate(str: string, len = 80): string {
  return str && str.length > len ? str.slice(0, len) + '…' : (str || '');
}

interface RawProduct {
  id: string;
  brand: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  initials?: string;
  finish?: string;
  application?: string;
  coverage?: number;
  recommended_coats?: number;
  product_code?: string;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎨 PaintPro Catalog Seed\n' + '─'.repeat(50));

  // Load catalog
  const catalogPath = resolve(process.cwd(), 'scripts/products_catalog.json');
  const rawProducts: RawProduct[] = JSON.parse(readFileSync(catalogPath, 'utf-8'));

  console.log(`📦 Source catalog: ${rawProducts.length} products`);

  // Count by brand
  const brandCounts: Record<string, number> = {};
  for (const p of rawProducts) {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  }
  for (const [brand, count] of Object.entries(brandCounts)) {
    console.log(`   ${brand}: ${count}`);
  }

  // ─── Insert Brands ──────────────────────────────────────────────────────────

  console.log('\n🏷️  Seeding brands...');
  const uniqueBrands = [...new Set(rawProducts.map((p) => p.brand))];
  const brandIdMap: Record<string, string> = {};

  for (const brandName of uniqueBrands) {
    const { data, error } = await supabase
      .from('brands')
      .upsert({ name: brandName, slug: slugify(brandName), active: true }, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (error) {
      console.error(`   ❌ Brand "${brandName}": ${error.message}`);
    } else if (data) {
      brandIdMap[brandName] = data.id;
      console.log(`   ✅ ${brandName} → ${data.id}`);
    }
  }

  // ─── Insert Categories ──────────────────────────────────────────────────────

  console.log('\n📂 Seeding categories...');
  const uniqueCategories = [...new Set(rawProducts.map((p) => p.category))];
  const categoryIdMap: Record<string, string> = {};

  for (const catName of uniqueCategories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert(
        { name: catName, slug: slugify(catName), active: true, sort_order: 0 },
        { onConflict: 'slug' }
      )
      .select('id, slug')
      .single();

    if (error) {
      console.error(`   ❌ Category "${catName}": ${error.message}`);
    } else if (data) {
      categoryIdMap[catName] = data.id;
      console.log(`   ✅ ${catName} → ${data.id}`);
    }
  }

  // ─── Insert Products ────────────────────────────────────────────────────────

  console.log('\n🛍️  Seeding products...');

  let inserted = 0;
  let updated = 0;
  let failed = 0;
  let missingFields = 0;
  const failedRecords: { name: string; error: string }[] = [];

  for (const p of rawProducts) {
    // Validate required fields
    const warnings: string[] = [];
    if (!p.brand) warnings.push('missing brand');
    if (!p.name) warnings.push('missing name');
    if (!p.category) warnings.push('missing category');
    if (!p.description || p.description.length < 5) warnings.push('incomplete description');
    if (warnings.length > 0) missingFields++;

    // Generate stable slug from brand + name
    const baseSlug = slugify(`${p.brand}-${p.name}`);

    const productPayload = {
      name: p.name || 'Unknown Product',
      slug: baseSlug,
      brand: p.brand || '',
      brand_id: brandIdMap[p.brand] || null,
      category: p.category || '',
      category_id: categoryIdMap[p.category] || null,
      subcategory: p.subcategory || '',
      description: p.description || '',
      initials: p.initials || (p.name ? p.name.substring(0, 2).toUpperCase() : 'NA'),
      finish: p.finish || null,
      application: p.application || null,
      coverage: p.coverage || null,
      recommended_coats: p.recommended_coats || 2,
      product_code: p.product_code || null,
      active: true,
    };

    const { data, error } = await supabase
      .from('products')
      .upsert(productPayload, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`   ❌ "${p.name}": ${error.message}`);
      failed++;
      failedRecords.push({ name: p.name, error: error.message });
    } else if (data) {
      inserted++;
      if (warnings.length > 0) {
        console.log(`   ⚠️  "${p.name}" — ${warnings.join(', ')}`);
      }
    }
  }

  // ─── Seed Default Shades ────────────────────────────────────────────────────

  console.log('\n🎨 Seeding sample shade families...');
  const sampleShades = [
    { brand: 'Berger Paints', code: 'B001', name: 'Airy Cream', family: 'Neutrals', hex: '#efe1c9' },
    { brand: 'Berger Paints', code: 'B002', name: 'Warm Sand', family: 'Neutrals', hex: '#dbc7aa' },
    { brand: 'Berger Paints', code: 'B003', name: 'Terracotta Mist', family: 'Reds & Terracottas', hex: '#cfaa8e' },
    { brand: 'Berger Paints', code: 'B004', name: 'Dusty Rose', family: 'Reds & Terracottas', hex: '#b97e69' },
    { brand: 'Berger Paints', code: 'B005', name: 'Deep Burgundy', family: 'Reds & Terracottas', hex: '#8f5849' },
    { brand: 'Asian Paints', code: 'A001', name: 'Sage Green', family: 'Greens', hex: '#b9c4b0' },
    { brand: 'Asian Paints', code: 'A002', name: 'Fern Mist', family: 'Greens', hex: '#93aa95' },
    { brand: 'Asian Paints', code: 'A003', name: 'Petal Pink', family: 'Pinks', hex: '#d7bcc8' },
    { brand: 'Asian Paints', code: 'A004', name: 'Steel Blue', family: 'Blues', hex: '#9aa6c0' },
    { brand: 'Asian Paints', code: 'A005', name: 'Lavender Haze', family: 'Purples', hex: '#c1b3d3' },
    { brand: 'Birla Opus', code: 'BO001', name: 'Golden Wheat', family: 'Yellows & Golds', hex: '#dfc66d' },
    { brand: 'Birla Opus', code: 'BO002', name: 'Antique Beige', family: 'Neutrals', hex: '#b9a377' },
    { brand: 'Birla Opus', code: 'BO003', name: 'Ivory White', family: 'Whites', hex: '#eceae4' },
    { brand: 'Birla Opus', code: 'BO004', name: 'Pebble Grey', family: 'Greys', hex: '#aeb2ae' },
    { brand: 'Birla Opus', code: 'BO005', name: 'Slate', family: 'Greys', hex: '#71787d' },
    { brand: 'Birla Opus', code: 'BO006', name: 'Charcoal', family: 'Greys', hex: '#454b4e' },
  ];

  for (const shade of sampleShades) {
    const brandId = brandIdMap[shade.brand] || null;
    const { error } = await supabase
      .from('shades')
      .upsert({ ...shade, brand_id: brandId }, { onConflict: 'brand,code' });
    if (error) console.error(`   ❌ Shade ${shade.code}: ${error.message}`);
  }

  // ─── Report ─────────────────────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(50));
  console.log('📊 SEED REPORT');
  console.log('═'.repeat(50));
  console.log(`Source catalog total: ${rawProducts.length}`);
  console.log(`Berger Paints:        ${brandCounts['Berger Paints'] || 0}`);
  console.log(`Asian Paints:         ${brandCounts['Asian Paints'] || 0}`);
  console.log(`Birla Opus:           ${brandCounts['Birla Opus'] || 0}`);
  console.log(`Inserted/Updated:     ${inserted}`);
  console.log(`Failed:               ${failed}`);
  console.log(`Records with warnings:${missingFields}`);
  console.log(`Shades seeded:        ${sampleShades.length}`);

  if (failedRecords.length > 0) {
    console.log('\n❌ Failed records:');
    for (const r of failedRecords) {
      console.log(`   - ${r.name}: ${r.error}`);
    }
  }

  if (inserted === rawProducts.length - failed) {
    console.log('\n✅ Seed complete! All products imported successfully.');
  } else {
    console.warn(`\n⚠️  Imported ${inserted} of ${rawProducts.length}. Check failed records above.`);
  }
  console.log('═'.repeat(50) + '\n');
}

main().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
