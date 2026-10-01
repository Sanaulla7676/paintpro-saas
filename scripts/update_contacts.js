const fs = require('fs');
let html = fs.readFileSync('scripts/template.html', 'utf8');

const replacements = [
  // Phone number - old placeholder to real
  ['9845012345',              '9844686199'],
  ['+91 98450 12345',        '+91 98446 86199'],
  ['98450 12345',             '98446 86199'],
  // Landline - remove/replace
  ['Landline: 080-4123 4567', 'Rating: 4.2★ (10 Reviews)'],
  // GSTIN - keep if no real one, or clear for now  
  // Address in print header
  ['#48/2, Outer Ring Road, Bellandur, Bengaluru - 560103',
   'Near Bharath Petrol Bunk, 2nd Main, Uttarahalli, Bengaluru - 560060'],
  // Address in WhatsApp message
  ['www.wallcareexperts.com', 'www.wallcareexperts.in'],
  // UPI - can update later
  ['wallcareexperts@hdfcbank', 'wallcareexperts@upi'],
];

let count = 0;
replacements.forEach(([from, to]) => {
  const escaped = from.replace(/[+|()[\]{}*?.\\^$]/g, c => '\\' + c);
  const re = new RegExp(escaped, 'g');
  const before = html;
  html = html.replace(re, to);
  const changed = (html !== before);
  console.log((changed ? '✅' : '❌') + ' ' + from + '  →  ' + to);
  if (changed) count++;
});

// Also update the print header company details block 
// Fix address in print quotation header
html = html.replace(
  "'<div>Helpline: +91 98446 86199 | Rating: 4.2★ (10 Reviews)</div>'",
  "'<div>Helpline: +91 98446 86199 | Business Hours: 8am–7pm, Mon–Sat</div>'"
);

// Update the print header address line
html = html.replace(
  /'\<div\>Email:.*?info@wallcareexperts\.com.*?\<\/div\>'/,
  "'<div>Email: wallcareexperts@gmail.com | Web: www.wallcareexperts.in</div>'"
);

// Also find and update address block in printQuote
html = html.replace(
  "Email: info@wallcareexperts.com",
  "Email: wallcareexperts@gmail.com"
);

fs.writeFileSync('scripts/template.html', html, 'utf8');
console.log('\nDone! ' + count + ' replacements made.');
