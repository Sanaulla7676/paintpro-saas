const fs = require('fs');

const catalogJson = fs.readFileSync('scripts/enriched_catalog.json', 'utf8');
const template = fs.readFileSync('scripts/template.html', 'utf8');

const output = template.replace('/*__PRODUCTS_CATALOG_PLACEHOLDER__*/', catalogJson);

fs.writeFileSync('index.html', output, 'utf8');
fs.writeFileSync('PaintPro-SaaS-Premium.html', output, 'utf8');
fs.writeFileSync('public/wallcare.html', output, 'utf8');
fs.writeFileSync('public/index.html', output, 'utf8');

console.log('Successfully generated index.html, PaintPro-SaaS-Premium.html, public/wallcare.html, and public/index.html! Size:', Math.round(output.length / 1024), 'KB');
