const fs = require('fs');

let html = fs.readFileSync('scripts/template.html', 'utf8');
const lines = html.split('\n');

// Find line indices for both blocks (0-indexed)
let catalogStart = -1, catalogEnd = -1;
let pricingStart = -1, pricingEnd = -1;

lines.forEach((l, i) => {
  if (l.includes('/* =====================================================================') && lines[i+1] && lines[i+1].includes('CATALOG BROWSER TAB')) catalogStart = i;
  if (l.includes('/* =====================================================================') && lines[i+1] && lines[i+1].includes('PRICE BOOK VIEW')) pricingStart = i;
});

// Find end of each block (next /* === */ comment after start)
for (let i = catalogStart + 3; i < lines.length; i++) {
  if (lines[i].includes('/* ===') && i > catalogStart + 5) { catalogEnd = i; break; }
}
for (let i = pricingStart + 3; i < lines.length; i++) {
  if (lines[i].includes('/* ===') && i > pricingStart + 5) { pricingEnd = i; break; }
}

console.log('Catalog block:', catalogStart+1, '→', catalogEnd);
console.log('Pricing block:', pricingStart+1, '→', pricingEnd);

const newCatalog = `/* =====================================================================
   CATALOG BROWSER TAB
   ===================================================================== */
// Catalog navigation state
let _catalogBrand = null;
let _catalogCategory = null;

function renderCatalogHTML() {
  return '<div class="crumb">Portal <span>›</span> Product Catalog</div>' +
    '<div class="qcard"><div class="qcard-head"><div>' +
    '<b>Official Three-Brand Architectural Catalog</b>' +
    '<small>' + products.length + ' Verified Products — choose a brand to begin</small>' +
    '</div></div><div class="qcard-body"><div id="catalogRoot"></div></div></div>';
}

function renderCatalogGrid() {
  const root = document.getElementById('catalogRoot');
  if (!root) return;
  if (!_catalogBrand) _renderBrandLanding(root);
  else if (!_catalogCategory) _renderCategoryPicker(root);
  else _renderProductGrid(root);
}

function _renderBrandLanding(root) {
  const brands = [
    {
      name: 'Asian Paints',
      tagline: 'Har Ghar Kuch Kehta Hai',
      since: 'Since 1942',
      bg: '#fff5f0',
      border: '#e8521a',
      countColor: '#e8521a',
      logoSvg: '<svg width="160" height="64" viewBox="0 0 160 64"><g><text x="4" y="42" font-family="Georgia,serif" font-size="34" font-weight="900" fill="#e8521a">asian</text><text x="6" y="60" font-family="Georgia,serif" font-size="18" font-weight="400" fill="#f59e0b">paints</text></g></svg>'
    },
    {
      name: 'Berger Paints',
      tagline: 'Paint Your Imagination',
      since: 'Since 1760',
      bg: '#f8f0fc',
      border: '#7e22ce',
      countColor: '#7e22ce',
      logoSvg: '<svg width="160" height="64" viewBox="0 0 160 64"><text x="4" y="46" font-family="Georgia,serif" font-size="38" font-weight="900" fill="#6d1f7e">Berger</text><text x="6" y="62" font-family="Arial,sans-serif" font-size="11" fill="#9c4daa" letter-spacing="2">Since 1760</text></svg>'
    },
    {
      name: 'Birla Opus',
      tagline: 'Bring Your Walls to Life',
      since: 'Birla Group',
      bg: '#f8f8f8',
      border: '#111111',
      countColor: '#111',
      logoSvg: '<svg width="160" height="64" viewBox="0 0 170 64"><text x="4" y="22" font-family="Arial Black,sans-serif" font-size="13" font-weight="900" fill="#111">BIRLA</text><text x="4" y="52" font-family="Arial Black,sans-serif" font-size="30" font-weight="900" fill="#111">opus.</text><circle cx="148" cy="12" r="11" fill="#00b89c"/><circle cx="136" cy="28" r="8" fill="#f5a623"/><circle cx="150" cy="30" r="8" fill="#7b5ea7"/><circle cx="139" cy="45" r="6" fill="#e8521a"/></svg>'
    }
  ];

  root.innerHTML =
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:8px 0">' +
      brands.map(b => {
        const cnt = products.filter(p => p.brand === b.name).length;
        return '<div onclick="_pickBrand(\\'' + b.name + '\\')" ' +
          'style="cursor:pointer;background:' + b.bg + ';border:2px solid ' + b.border + '20;border-radius:22px;' +
          'padding:28px 20px 22px;display:flex;flex-direction:column;align-items:center;gap:16px;' +
          'transition:all .22s;box-shadow:0 4px 18px rgba(0,0,0,.05)"' +
          ' onmouseover="this.style.borderColor=\\'' + b.border + '\\';this.style.transform=\\'translateY(-5px)\\';this.style.boxShadow=\\'0 14px 36px rgba(0,0,0,.13)\\'"' +
          ' onmouseout="this.style.borderColor=\\'' + b.border + '20\\';this.style.transform=\\'none\\';this.style.boxShadow=\\'0 4px 18px rgba(0,0,0,.05)\\'">' +
          '<div style="height:70px;display:flex;align-items:center;justify-content:center">' + b.logoSvg + '</div>' +
          '<div style="text-align:center">' +
            '<div style="font-size:11px;color:#64748b;margin-bottom:6px">' + b.tagline + '</div>' +
            '<div style="font-size:13px;font-weight:800;color:' + b.countColor + ';background:white;border-radius:20px;padding:4px 14px;display:inline-block;box-shadow:0 2px 6px rgba(0,0,0,.08)">' + cnt + ' Products</div>' +
          '</div>' +
          '<div style="background:' + b.border + ';color:white;border-radius:12px;padding:9px 28px;font-weight:800;font-size:13px">Browse →</div>' +
        '</div>';
      }).join('') +
    '</div>';
}

function _pickBrand(brandName) {
  _catalogBrand = brandName;
  _catalogCategory = null;
  const root = document.getElementById('catalogRoot');
  if (root) _renderCategoryPicker(root);
}

function _renderCategoryPicker(root) {
  const clr = { 'Asian Paints':'#e8521a', 'Berger Paints':'#7e22ce', 'Birla Opus':'#111' };
  const color = clr[_catalogBrand] || 'var(--primary)';
  const cats = [...new Set(products.filter(p => p.brand === _catalogBrand).map(p => p.category))].sort();
  const icons = {
    'Interior Wall Paint':'🏠','Exterior Wall Paint':'🏢','Waterproofing':'💧',
    'Primer':'🎨','Metal Primer':'🔩','Surface Preparation':'⚙️',
    'Wood Finish':'🪵','Enamel Paint':'✨','Interior Wall Texture':'🧱',
    'Exterior Wall Texture':'🪨','Construction Chemical':'🏗️','Wall Coverings':'🖼️',
    'Industrial / Enamel':'🏭','Tile Installation':'◻️','Wood Adhesive':'🪚',
    'Contact Adhesive':'🧲','General Glue':'🫙','Tape & Accessories':'📦',
    'Instant Fixative':'⚡','Fast Epoxy':'🔬','Structural Epoxy':'🏛️',
    'Multi-Substrate Adhesive':'🔗','Application Tool':'🖌️'
  };

  root.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:22px;flex-wrap:wrap">' +
      '<button onclick="_catalogBrand=null;renderCatalogGrid()" style="background:white;border:1.5px solid var(--border);border-radius:10px;padding:7px 16px;cursor:pointer;font-weight:700;font-size:13px">← All Brands</button>' +
      '<span style="font-weight:800;font-size:18px;color:' + color + '">' + _catalogBrand + '</span>' +
      '<span style="color:var(--ink-muted);font-size:14px">— Select a Category</span>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px">' +
      cats.map(c => {
        const cnt = products.filter(p => p.brand === _catalogBrand && p.category === c).length;
        return '<div onclick="_pickCategory(\\'' + esc(c) + '\\')" ' +
          'style="cursor:pointer;background:white;border:1.5px solid var(--border);border-radius:16px;padding:18px 12px;text-align:center;transition:all .18s"' +
          ' onmouseover="this.style.borderColor=\\'' + color + '\\';this.style.transform=\\'translateY(-3px)\\';this.style.boxShadow=\\'0 8px 20px rgba(0,0,0,.1)\\'"' +
          ' onmouseout="this.style.borderColor=\\'var(--border)\\';this.style.transform=\\'none\\';this.style.boxShadow=\\'none\\'">' +
          '<div style="font-size:26px;margin-bottom:8px">' + (icons[c] || '🖌️') + '</div>' +
          '<div style="font-weight:700;font-size:12px;color:var(--ink);margin-bottom:6px;line-height:1.3">' + esc(c) + '</div>' +
          '<div style="font-size:11px;font-weight:800;color:' + color + ';background:' + color + '15;border-radius:20px;padding:2px 10px;display:inline-block">' + cnt + ' products</div>' +
        '</div>';
      }).join('') +
    '</div>';
}

function _pickCategory(catName) {
  _catalogCategory = catName;
  const root = document.getElementById('catalogRoot');
  if (root) _renderProductGrid(root);
}

function _renderProductGrid(root) {
  const clr = { 'Asian Paints':'#e8521a', 'Berger Paints':'#7e22ce', 'Birla Opus':'#111' };
  const color = clr[_catalogBrand] || 'var(--primary)';
  const list = products.filter(p => p.brand === _catalogBrand && (!_catalogCategory || p.category === _catalogCategory));

  root.innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      '<button onclick="_catalogBrand=null;_catalogCategory=null;renderCatalogGrid()" style="background:white;border:1.5px solid var(--border);border-radius:10px;padding:6px 14px;cursor:pointer;font-weight:700;font-size:12px">⌂ Brands</button>' +
      '<button onclick="_catalogCategory=null;renderCatalogGrid()" style="background:white;border:1.5px solid var(--border);border-radius:10px;padding:6px 14px;cursor:pointer;font-weight:700;font-size:12px">← Categories</button>' +
      '<span style="font-weight:800;color:' + color + '">' + _catalogBrand + '</span>' +
      '<span style="color:var(--ink-muted)">›</span>' +
      '<span style="font-weight:700;color:var(--ink)">' + (_catalogCategory || 'All') + '</span>' +
      '<span style="color:var(--ink-muted);font-size:12px">(' + list.length + ' products)</span>' +
    '</div>' +
    '<div class="product-picker-list">' + renderProductPickerCardsHTML(list) + '</div>';
}

function filterCatalogByBrand(b) {
  _catalogBrand = (b === 'All Brands') ? null : b;
  _catalogCategory = null;
  renderCatalogGrid();
}

`;

const newPricing = `/* =====================================================================
   PRICE BOOK VIEW
   ===================================================================== */
function renderPricingBookHTML() {
  const brandColors = { 'Asian Paints':'#e8521a', 'Berger Paints':'#7e22ce', 'Birla Opus':'#111' };
  const brandList = ['Asian Paints', 'Berger Paints', 'Birla Opus'];

  const tabHtml = brandList.map((b, i) => {
    const cnt = products.filter(p => p.brand === b).length;
    return '<button id="pb-tab-' + i + '" onclick="switchPriceTab(' + i + ')" style="' +
      'padding:8px 20px;border-radius:12px;border:none;cursor:pointer;font-weight:700;font-size:13px;' +
      'background:' + (i === 0 ? brandColors[b] : 'white') + ';' +
      'color:' + (i === 0 ? 'white' : 'var(--ink-muted)') + ';' +
      'border:1.5px solid ' + (i === 0 ? brandColors[b] : 'var(--border)') + ';transition:all .18s">' +
      b + ' <span style="opacity:.75;font-size:11px">(' + cnt + ')</span>' +
    '</button>';
  }).join('');

  const buildTable = (brand) => {
    const rows = products.filter(p => p.brand === brand).map(p =>
      '<tr>' +
        '<td style="font-weight:600;max-width:180px">' + esc(p.name) + '</td>' +
        '<td><span style="background:#f0f4f8;padding:2px 8px;border-radius:6px;font-size:11px">' + esc(p.category) + '</span></td>' +
        '<td>' + p.coverage + ' sq.ft/' + p.unit + '</td>' +
        '<td style="text-align:center">' + p.recommended_coats + '</td>' +
        '<td>' + money(p.mrp) + '</td>' +
        '<td>' +
          '<input class="tbl-rate" type="number" step="0.5" value="' + p.default_rate + '" ' +
          'style="width:80px" ' +
          'onchange="(function(v){var pr=products.find(function(x){return x.id===\\'' + p.id + '\\';});if(pr){pr.default_rate=Number(v)||0;saveLocalState();toast(\\'Updated \\'+pr.name+\\' rate\\');}})(this.value)"/>' +
        '</td>' +
      '</tr>'
    ).join('');
    return '<div style="overflow-x:auto"><table class="scope-tbl" style="width:100%">' +
      '<thead><tr><th>Product Name</th><th>Category</th><th>Coverage</th>' +
      '<th style="text-align:center">Coats</th><th>Benchmark MRP</th><th>Working Rate (₹/sq.ft)</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  };

  const panels = brandList.map((b, i) =>
    '<div id="pb-panel-' + i + '" style="display:' + (i === 0 ? 'block' : 'none') + '">' +
      buildTable(b) +
    '</div>'
  ).join('');

  return '<div class="crumb">Portal <span>›</span> Working Price Book</div>' +
    '<div class="qcard">' +
      '<div class="qcard-head">' +
        '<div>' +
          '<b>Painter &amp; Dealer Working Rate Book</b>' +
          '<small>All ' + products.length + ' products across 3 brands — edit any rate, changes saved locally</small>' +
        '</div>' +
        '<button class="btn-pill-green" onclick="saveLocalState();toast(\\'All rates saved!\\');">💾 Save All Rates</button>' +
      '</div>' +
      '<div class="qcard-body">' +
        '<div style="display:flex;gap:10px;margin-bottom:20px">' + tabHtml + '</div>' +
        panels +
      '</div>' +
    '</div>';
}

function switchPriceTab(idx) {
  const brandColors = { 'Asian Paints':'#e8521a', 'Berger Paints':'#7e22ce', 'Birla Opus':'#111' };
  const brandList = ['Asian Paints', 'Berger Paints', 'Birla Opus'];
  brandList.forEach(function(b, i) {
    const tab = document.getElementById('pb-tab-' + i);
    const panel = document.getElementById('pb-panel-' + i);
    if (!tab || !panel) return;
    const active = i === idx;
    tab.style.background = active ? brandColors[b] : 'white';
    tab.style.color = active ? 'white' : 'var(--ink-muted)';
    tab.style.borderColor = active ? brandColors[b] : 'var(--border)';
    panel.style.display = active ? 'block' : 'none';
  });
}

`;

// Build new lines array: keep everything before catalogStart, insert new blocks, skip old blocks
const before = lines.slice(0, catalogStart).join('\n');
const middle = lines.slice(catalogEnd, pricingStart).join('\n');
const after = lines.slice(pricingEnd).join('\n');

const result = before + '\n' + newCatalog + middle + '\n' + newPricing + after;

fs.writeFileSync('scripts/template.html', result, 'utf8');
console.log('Template updated successfully. Lines:', result.split('\n').length);
