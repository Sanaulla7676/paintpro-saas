const fs = require('fs');
const content = fs.readFileSync('public/wallcare.html', 'utf8');
console.log('Local public/wallcare.html has authScreen:', content.includes('id="authScreen"'));
console.log('Local public/wallcare.html has cats:', content.includes('const cats = [...new Set(products.filter'));
