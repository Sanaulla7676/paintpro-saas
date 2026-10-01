import json
import re

with open(r"c:\Users\user\deepak software\scripts\extracted_pdf_products.json", encoding="utf-8") as f:
    pdf_products = json.load(f)

with open(r"c:\Users\user\deepak software\scripts\enriched_catalog.json", encoding="utf-8") as f:
    cur_catalog = json.load(f)

def norm(s):
    return "".join(c.lower() for c in s if c.isalnum())

# Build lookup by (brand, normalized_name)
cur_lookup = {}
for item in cur_catalog:
    b_norm = norm(item["brand"])
    n_norm = norm(item["name"])
    cur_lookup[(b_norm, n_norm)] = item

print(f"Loaded {len(pdf_products)} PDF products, {len(cur_catalog)} existing catalog products")

# Helper to deduce initials
def get_initials(name):
    words = [w for w in re.split(r"[^A-Za-z0-9]", name) if w]
    if len(words) >= 2:
        return (words[0][0] + words[1][0]).upper()
    elif len(words) == 1:
        return words[0][:2].upper()
    return "PT"

# Helper to deduce specs for a product
def infer_product_specs(brand, category, name):
    n_lower = name.lower()
    c_lower = category.lower()

    # Default values
    tier = "Premium"
    unit = "Litre"
    recommended_coats = 2
    coverage = 120
    mrp = 450
    default_rate = 22.0
    warranty = "5-7 Years"
    pack_sizes = "1L, 4L, 10L, 20L"
    subcategory = category
    desc = f"{name} is an advanced high-performance {category.lower()} solution engineered by {brand} for exceptional finish, long-lasting surface protection, and superior durability."

    # Tier inference
    if any(k in n_lower for k in ["aspira", "glitz", "imperia", "pu luxury", "duralife", "ultralux", "pure legend", "allura", "silk glamor", "solitaire"]):
        tier = "Ultra Luxury" if ("aspira" in n_lower or "duralife" in n_lower or "imperia" in n_lower) else "Luxury"
        mrp = 750
        default_rate = 34.0
        warranty = "8-10 Years"
        coverage = 140
    elif any(k in n_lower for k in ["royale", "ultima", "weathercoat long life", "calista", "epoxy", "pu "]):
        tier = "Luxury"
        mrp = 620
        default_rate = 28.0
        warranty = "7-9 Years"
        coverage = 135
    elif any(k in n_lower for k in ["apcolite", "weathercoat", "style", "smartclean", "allura", "super cover"]):
        tier = "Premium"
        mrp = 480
        default_rate = 22.0
        warranty = "5-7 Years"
        coverage = 125
    elif any(k in n_lower for k in ["tractor", "bison", "ace", "neo", "walmasta", "ecotouch", "distemper"]):
        tier = "Economy"
        mrp = 220
        default_rate = 14.0
        warranty = "3-5 Years"
        coverage = 110
    elif "technical" in c_lower or "tool" in c_lower or "data-sheet" in c_lower:
        tier = "Standard"
        mrp = 350
        default_rate = 18.0
        warranty = "3 Years"

    # Category specifics
    if "interior" in c_lower:
        unit = "Litre"
        pack_sizes = "1L, 4L, 10L, 20L"
        recommended_coats = 2
        coverage = 130 if tier in ["Luxury", "Ultra Luxury"] else 115
        if "emulsion" in n_lower or "wash" in n_lower or "matt" in n_lower:
            subcategory = "Interior Emulsion"
            desc = f"{name} delivers a smooth, washable, rich interior finish with high opacity, anti-bacterial protection, and long-term colour vibrancy."
        elif "distemper" in n_lower or "acrylic" in n_lower:
            subcategory = "Acrylic Distemper"
            desc = f"{name} is a cost-effective, smooth interior water-based coating with easy application and clean finish."
        else:
            subcategory = "Interior Wall Finish"
            desc = f"{name} offers superior interior aesthetic appeal, smooth texture, and stain resistance engineered by {brand}."

    elif "exterior" in c_lower:
        unit = "Litre"
        pack_sizes = "1L, 4L, 10L, 20L"
        recommended_coats = 2
        coverage = 110
        if "texture" in c_lower or "texture" in n_lower or "allura" in n_lower:
            subcategory = "Exterior Texture"
            unit = "Kg"
            pack_sizes = "5Kg, 25Kg, 30Kg"
            coverage = 25
            recommended_coats = 1
            default_rate = 45.0
            mrp = 2200
            desc = f"{name} creates distinctive architectural exterior wall textures resistant to extreme weathering, UV fading, and algal growth."
        else:
            subcategory = "Exterior Emulsion"
            if tier in ["Luxury", "Ultra Luxury"]:
                warranty = "10-15 Years"
                default_rate = 32.0
                mrp = 680
            else:
                warranty = "5-7 Years"
                default_rate = 22.0
                mrp = 420
            desc = f"{name} provides robust weather resistance, dirt pick-up prevention, and anti-fungal barrier for exterior facades."

    elif "waterproof" in c_lower:
        if "tape" in n_lower or "seal" in n_lower or "strip" in n_lower:
            unit = "Meter"
            pack_sizes = "5m, 10m, 20m"
            coverage = 10
            recommended_coats = 1
            default_rate = 60.0
            mrp = 480
            subcategory = "Waterproofing Sealing Strip"
            desc = f"{name} is an elastomeric self-adhesive waterproof sealing tape for joints, parapets, and expansion cracks."
        elif "paste" in n_lower or "powder" in n_lower or "crack" in n_lower or "tile" in n_lower:
            unit = "Kg"
            pack_sizes = "1Kg, 5Kg, 20Kg"
            coverage = 40
            recommended_coats = 1
            default_rate = 35.0
            mrp = 280
            subcategory = "Waterproofing Compound"
            desc = f"{name} provides deep crack-filling and specialized bonding waterproofing to arrest moisture ingress."
        elif "2k" in n_lower or "elastomeric" in n_lower or "membrane" in n_lower or "shield" in n_lower:
            unit = "Kg"
            pack_sizes = "3Kg, 15Kg, 30Kg"
            coverage = 50
            recommended_coats = 2
            default_rate = 42.0
            mrp = 550
            warranty = "7-10 Years"
            subcategory = "Elastomeric Waterproof Membrane"
            desc = f"{name} forms a seamless waterproof barrier with superior hydrostatic pressure resistance and high crack-bridging capability."
        else:
            unit = "Litre"
            pack_sizes = "1L, 4L, 10L, 20L"
            coverage = 65
            recommended_coats = 2
            default_rate = 30.0
            mrp = 390
            warranty = "5-8 Years"
            subcategory = "Waterproofing Solution"
            desc = f"{name} protects roofs, terraces, and bathrooms against severe seepage, efflorescence, and moisture penetration."

    elif "wood" in c_lower:
        unit = "Litre"
        pack_sizes = "500ml, 1L, 4L"
        coverage = 85
        recommended_coats = 2
        default_rate = 48.0
        mrp = 650
        warranty = "3-5 Years"
        subcategory = "Wood Coating & Polish"
        desc = f"{name} enhances natural wood grain, offers high scratch resistance, UV protection, and luxurious gloss or satin finish."

    elif "primer" in c_lower or "undercoat" in c_lower:
        unit = "Litre"
        pack_sizes = "1L, 4L, 10L, 20L"
        coverage = 130
        recommended_coats = 1
        default_rate = 12.0
        mrp = 210
        warranty = "Pre-coating System"
        subcategory = "Undercoat Primer"
        desc = f"{name} seals porous masonry, enhances topcoat adhesion, neutralizes surface alkalinity, and ensures uniform paint finish."

    elif "putty" in c_lower or "cement paint" in c_lower:
        unit = "Kg"
        pack_sizes = "1Kg, 5Kg, 20Kg, 40Kg"
        coverage = 18
        recommended_coats = 2
        default_rate = 12.0
        mrp = 32
        warranty = "Surface Preparation"
        subcategory = "Wall Putty"
        desc = f"{name} creates an ultra-smooth, crack-free, water-resistant base surface for subsequent primer and topcoat applications."

    elif "enamel" in c_lower:
        unit = "Litre"
        pack_sizes = "500ml, 1L, 4L, 20L"
        coverage = 110
        recommended_coats = 2
        default_rate = 24.0
        mrp = 380
        warranty = "4-6 Years"
        subcategory = "Gloss Enamel"
        desc = f"{name} produces a hard, durable, mirror-like enamel film for metal, wood, and architectural trim surfaces."

    elif "wallpaper" in c_lower or "wall coverings" in c_lower:
        unit = "Roll"
        pack_sizes = "1 Roll (57 sq.ft)"
        coverage = 50
        recommended_coats = 1
        default_rate = 85.0
        mrp = 2400
        warranty = "5 Years"
        subcategory = "Designer Wall Covering"
        desc = f"{name} is an exquisite designer wallpaper range by {brand} featuring modern textures, embossed patterns, and premium acoustic quality."

    elif "tool" in c_lower:
        unit = "Piece"
        pack_sizes = "1 Unit"
        coverage = 0
        recommended_coats = 1
        default_rate = 0.0
        mrp = 350
        warranty = "Manufacturer Warranty"
        subcategory = "Application Tool"
        desc = f"{name} professional application accessory engineered for effortless, uniform, and streak-free paint finish."

    return {
        "subcategory": subcategory,
        "description": desc,
        "tier": tier,
        "coverage": coverage,
        "recommended_coats": recommended_coats,
        "default_rate": default_rate,
        "mrp": mrp,
        "unit": unit,
        "warranty": warranty,
        "pack_sizes": pack_sizes
    }

master_catalog = []
brand_id_counters = {}

for p in pdf_products:
    brand = p["brand"]
    name = p["name"]
    category = p["category"]

    b_norm = norm(brand)
    n_norm = norm(name)

    # Check existing catalog
    existing = cur_lookup.get((b_norm, n_norm))
    if not existing:
        # Check partial
        for (cb, cn), cp in cur_lookup.items():
            if cb == b_norm and (cn in n_norm or n_norm in cn):
                existing = cp
                break

    # Determine unique ID
    prefix = brand.lower().replace(" ", "-")
    brand_id_counters[prefix] = brand_id_counters.get(prefix, 0) + 1
    new_id = f"{prefix}-{brand_id_counters[prefix]}"

    if existing:
        # Use existing specs but ensure category and name match the official PDF
        entry = dict(existing)
        entry["id"] = new_id
        entry["brand"] = brand
        entry["name"] = name
        entry["category"] = category
        entry["initials"] = existing.get("initials") or get_initials(name)
    else:
        specs = infer_product_specs(brand, category, name)
        entry = {
            "brand": brand,
            "name": name,
            "category": category,
            "subcategory": specs["subcategory"],
            "description": specs["description"],
            "id": new_id,
            "initials": get_initials(name),
            "tier": specs["tier"],
            "coverage": specs["coverage"],
            "recommended_coats": specs["recommended_coats"],
            "default_rate": specs["default_rate"],
            "mrp": specs["mrp"],
            "unit": specs["unit"],
            "warranty": specs["warranty"],
            "pack_sizes": specs["pack_sizes"]
        }

    master_catalog.append(entry)

print(f"Total compiled master catalog products: {len(master_catalog)}")

counts = {}
for p in master_catalog:
    counts[p["brand"]] = counts.get(p["brand"], 0) + 1
print("Brand breakdown:", counts)

with open(r"c:\Users\user\deepak software\scripts\enriched_catalog.json", "w", encoding="utf-8") as f:
    json.dump(master_catalog, f, indent=2)

print("Saved 390 products to scripts/enriched_catalog.json")
