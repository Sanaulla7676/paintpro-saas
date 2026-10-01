import fitz
import json
import re

doc = fitz.open(r"C:\Users\user\Downloads\Asian_Birla_Berger_Paint_Product_Master_Catalogue.pdf")

products = []

for page_idx in range(3, 17):  # Pages 4 to 17 (0-indexed 3 to 16)
    page = doc[page_idx]
    # Use PyMuPDF's table extraction if available, or parse blocks/text
    tabs = page.find_tables()
    if tabs.tables:
        for t in tabs.tables:
            df = t.extract()
            # df is a list of rows
            for row in df:
                # row looks like ['No.', 'Brand', 'Category', 'Product / Named Entry']
                if not row or not row[0]:
                    continue
                no_col = str(row[0]).strip()
                if not no_col.isdigit():
                    continue
                # Valid numbered row
                no = int(no_col)
                brand = str(row[1]).strip() if len(row) > 1 else ""
                category = str(row[2]).strip() if len(row) > 2 else ""
                prod_name = str(row[3]).strip() if len(row) > 3 else ""
                # Clean up newlines within cells
                brand = " ".join(brand.split())
                category = " ".join(category.split())
                prod_name = " ".join(prod_name.split())
                products.append({
                    "no": no,
                    "brand": brand,
                    "category": category,
                    "name": prod_name,
                    "page": page_idx + 1
                })
    else:
        print(f"Warning: No table found on page {page_idx + 1}")

print(f"Total extracted products from tables: {len(products)}")

# Check breakdown by brand
by_brand = {}
for p in products:
    by_brand[p["brand"]] = by_brand.get(p["brand"], 0) + 1

print("By brand:", by_brand)

with open("scripts/extracted_pdf_products.json", "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2)

print("Saved to scripts/extracted_pdf_products.json")
