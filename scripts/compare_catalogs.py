import json

with open("scripts/extracted_pdf_products.json", encoding="utf-8") as f:
    pdf_products = json.load(f)

with open("scripts/enriched_catalog.json", encoding="utf-8") as f:
    cur_catalog = json.load(f)

def norm(s):
    return "".join(c.lower() for c in s if c.isalnum())

cur_map = {}
for p in cur_catalog:
    key = (norm(p["brand"]), norm(p["name"]))
    cur_map[key] = p

print(f"PDF products: {len(pdf_products)}")
print(f"Current catalog products: {len(cur_catalog)}")

matched = []
missing = []

for p in pdf_products:
    b_norm = norm(p["brand"])
    p_norm = norm(p["name"])
    
    found = cur_map.get((b_norm, p_norm))
    if not found:
        for (cb, cn), cp in cur_map.items():
            if cb == b_norm and (cn in p_norm or p_norm in cn):
                found = cp
                break
    
    if found:
        matched.append((p, found))
    else:
        missing.append(p)

print(f"Matched: {len(matched)}")
print(f"Missing from current catalog: {len(missing)}")

missing_by_brand = {}
for m in missing:
    b = m["brand"]
    missing_by_brand[b] = missing_by_brand.get(b, 0) + 1

print("Missing by brand:", missing_by_brand)

for b in ["Asian Paints", "Birla Opus", "Berger Paints"]:
    b_missing = [m for m in missing if m["brand"] == b]
    print(f"\nSample missing from {b} (total {len(b_missing)}):")
    for item in b_missing[:8]:
        print(f"  [{item['category']}] {item['name']}")
