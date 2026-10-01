import fitz  # PyMuPDF
import json

pdf_path = r"C:\Users\user\Downloads\Asian_Birla_Berger_Paint_Product_Master_Catalogue.pdf"
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")

full_text = []
for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text()
    print(f"--- Page {page_num + 1} (chars: {len(text)}) ---")
    full_text.append(f"=== PAGE {page_num + 1} ===\n" + text)

with open("scripts/pdf_dump.txt", "w", encoding="utf-8") as f:
    f.write("\n\n".join(full_text))

print("Dumped all text to scripts/pdf_dump.txt")
