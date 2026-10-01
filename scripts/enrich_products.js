const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scripts/products_catalog.json', 'utf8'));

function getSpecs(p) {
  const cat = (p.category + ' ' + p.subcategory + ' ' + p.name).toLowerCase();
  
  // Default values
  let coverage = 130; // sq.ft per litre
  let coats = 2;
  let rate = 22; // per sq.ft
  let mrp = 450; // per litre/kg
  let unit = 'Litre';
  let tier = 'Premium';
  let warranty = '5 Years';
  let packSizes = '1L, 4L, 10L, 20L';

  if (cat.includes('super luxury') || cat.includes('dazzle') || cat.includes('aspira') || cat.includes('glitz') || cat.includes('one (luxury)')) {
    tier = 'Super Luxury';
    coverage = 150;
    coats = 2;
    rate = 34;
    mrp = 750;
    warranty = '8-10 Years';
  } else if (cat.includes('luxury') || cat.includes('royale') || cat.includes('silk') || cat.includes('calista')) {
    tier = 'Luxury';
    coverage = 140;
    coats = 2;
    rate = 26;
    mrp = 550;
    warranty = '6-8 Years';
  } else if (cat.includes('economy') || cat.includes('distemper') || cat.includes('bison') || cat.includes('tractor') || cat.includes('style') || cat.includes('sparc')) {
    tier = 'Economy';
    coverage = 120;
    coats = 2;
    rate = 14;
    mrp = 190;
    warranty = '3 Years';
  } else if (cat.includes('waterproof') || cat.includes('damp') || cat.includes('alldry') || cat.includes('roof') || cat.includes('smartcare') || cat.includes('homeshield')) {
    tier = 'Waterproofing System';
    coverage = 35;
    coats = 2;
    rate = 32;
    mrp = 480;
    warranty = '5-12 Years';
    unit = 'Litre/Kg';
    packSizes = '1L, 4L, 20L';
  } else if (cat.includes('putty') || cat.includes('surface preparation') || cat.includes('leveling')) {
    tier = 'Surface Preparation';
    coverage = 15;
    coats = 2;
    rate = 12;
    mrp = 28;
    unit = 'Kg';
    warranty = 'System Base';
    packSizes = '5kg, 20kg, 40kg';
  } else if (cat.includes('primer') || cat.includes('undercoat') || cat.includes('decoprime')) {
    tier = 'Primers & Undercoats';
    coverage = 110;
    coats = 1;
    rate = 8;
    mrp = 160;
    warranty = 'System Base';
    packSizes = '1L, 4L, 10L, 20L';
  } else if (cat.includes('texture') || cat.includes('stucco') || cat.includes('metallic') || cat.includes('designer') || cat.includes('play')) {
    tier = 'Designer / Texture';
    coverage = 25;
    coats = 2;
    rate = 65;
    mrp = 1200;
    warranty = '5 Years';
    packSizes = '1L, 4L';
  } else if (cat.includes('wood') || cat.includes('pu') || cat.includes('enamel') || cat.includes('imperia') || cat.includes('woodtech')) {
    tier = 'Wood & Metal Finish';
    coverage = 85;
    coats = 2;
    rate = 38;
    mrp = 620;
    warranty = '5 Years';
    packSizes = '500ml, 1L, 4L, 20L';
  } else if (cat.includes('exterior') || cat.includes('weather') || cat.includes('apex') || cat.includes('walmasta') || cat.includes('ultima')) {
    tier = cat.includes('protek') || cat.includes('long life') ? 'Super Luxury Exterior' : 'Premium Exterior';
    coverage = 60;
    coats = 2;
    rate = 32;
    mrp = 580;
    warranty = cat.includes('15') || cat.includes('duralife') ? '15 Years' : '7-10 Years';
  }

  return {
    ...p,
    tier,
    coverage,
    recommended_coats: coats,
    default_rate: rate,
    mrp,
    unit,
    warranty,
    pack_sizes: packSizes
  };
}

const enriched = raw.map(getSpecs);
console.log('Sample enriched product:', enriched[0]);
fs.writeFileSync('scripts/enriched_catalog.json', JSON.stringify(enriched, null, 2));
console.log('Saved enriched catalog with', enriched.length, 'products');
