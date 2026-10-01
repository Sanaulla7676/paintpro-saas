async function test() {
  const dpl = 'https://paintpro-saas-m2kv8xzsa-sanaulla7676s-projects.vercel.app/wallcare.html';
  console.log('Fetching deployment URL:', dpl);
  const r1 = await fetch(dpl, { headers: { 'Cache-Control': 'no-cache' } });
  const html = await r1.text();
  console.log('Has authScreen:', html.includes('id="authScreen"'));
  console.log('Fixed cats:', html.includes('const cats = [...new Set(products.filter'));

  const alias = 'https://paintpro-saas.vercel.app/wallcare.html?v=' + Date.now();
  console.log('Fetching alias with query cache-buster:', alias);
  const r2 = await fetch(alias);
  const html2 = await r2.text();
  console.log('Alias has authScreen:', html2.includes('id="authScreen"'));
  console.log('Alias fixed cats:', html2.includes('const cats = [...new Set(products.filter'));
}
test();
