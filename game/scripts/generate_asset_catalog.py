#!/usr/bin/env python3
from pathlib import Path
import re
import shutil
from PIL import Image, ImageSequence

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT.parent
SOURCE = PROJECT / "sorted-octo-assets"
PUBLIC = ROOT / "public" / "assets"
RAW = PUBLIC / "raw"
GENERATED = PUBLIC / "generated"
CATALOG = ROOT / "src" / "game" / "data" / "assetCatalog.js"

FRAME_LIMIT = 16

SLOTS = [
    {
        "export": "BODY_ASSETS",
        "slot": "body",
        "kind": "body",
        "source": SOURCE / "octos player assets" / "Bodies",
        "raw": "octos player assets/Bodies",
        "generated": "bodies",
        "extensions": [".gif"],
    },
    {
        "export": "EYE_ASSETS",
        "slot": "eyes",
        "kind": "eyes",
        "source": SOURCE / "octos player assets" / "Eyes",
        "raw": "octos player assets/Eyes",
        "generated": "eyes",
        "extensions": [".gif"],
    },
    {
        "export": "HAT_ASSETS",
        "slot": "hat",
        "kind": "hat",
        "source": SOURCE / "octos player assets" / "Hats",
        "raw": "octos player assets/Hats",
        "generated": "hats",
        "extensions": [".gif"],
    },
    {
        "export": "CLOTHES_ASSETS",
        "slot": "clothes",
        "kind": "clothes",
        "source": SOURCE / "octos player assets" / "clothes",
        "raw": "octos player assets/clothes",
        "generated": "clothes",
        "extensions": [".gif"],
    },
    {
        "export": "BOOST_ASSETS",
        "slot": "boost",
        "kind": "boost",
        "source": SOURCE / "octos player assets" / "Throwables",
        "raw": "octos player assets/Throwables",
        "generated": None,
        "extensions": [".png"],
    },
    {
        "export": "LEGENDARY_ASSETS",
        "slot": "legendary",
        "kind": "legendary",
        "source": SOURCE / "octos player assets" / "legendaries ",
        "raw": "octos player assets/legendaries ",
        "generated": "legendaries",
        "extensions": [".gif"],
    },
    {
        "export": "HALLOWEEN_BODY_ASSETS",
        "slot": "halloween",
        "kind": "halloween",
        "source": SOURCE / "Halloween assets" / "halloween bodies",
        "raw": "Halloween assets/halloween bodies",
        "generated": "halloween-bodies",
        "extensions": [".gif"],
    },
]

METADATA_OVERRIDES = {
    "body-blue": {"price": 0, "rarity": "starter", "stats": "Balanced starter", "statMods": {}},
    "eyes-regular": {"price": 0, "rarity": "starter", "stats": "No modifier", "statMods": {}},
    "body-red": {"stats": "Damage +0.06x, Speed -0.05x"},
    "body-yellow": {"stats": "Magnet +0.06x"},
    "body-acid": {"stats": "Damage +0.09x, Idle Efficiency +0.03x"},
    "body-magma": {"stats": "Damage +0.09x, Idle Efficiency +0.03x"},
    "body-rainbow": {"rarity": "rare", "price": 350},
}

RARITY_PRICE = {
    "starter": 0,
    "common": 60,
    "uncommon": 125,
    "rare": 240,
    "legendary": 900,
    "event": 500,
}

SLOT_PRICE_MULTIPLIER = {
    "body": 1.2,
    "eyes": 0.7,
    "hat": 1.0,
    "clothes": 1.15,
    "boost": 1.05,
    "legendary": 1.0,
    "halloween": 1.0,
}

STAT_PRICE_WEIGHTS = {
    "swimSpeed": 520,
    "magnetRange": 440,
    "gemValue": 560,
    "luck": 460,
    "damage": 520,
    "armor": 70,
    "idleEfficiency": 480,
}

RARITY_KEYWORDS = [
    ("legendary", ["legendary"]),
    ("rare", ["rainbow", "death", "gold", "metal", "crypto", "crown", "laser", "lazer", "wizard", "all seeing", "diamond", "dimond", "katana", "nunchucks"]),
    ("uncommon", ["magma", "acid", "zombie", "midnight", "pepe", "space", "helmet", "pirate", "alien", "vr", "monocle", "scuba", "halo", "devil", "mage", "scientist", "hazmat", "btc"]),
]

STAT_KEYWORDS = [
    ("damage", ["angry", "evil", "katana", "nunchucks", "devil", "magma", "fire", "red"]),
    ("magnetRange", ["cute", "all seeing", "alien", "satellite", "shell", "hook"]),
    ("luck", ["pirate", "gold", "crown", "rainbow", "party", "banana"]),
    ("swimSpeed", ["space", "astro", "aqua", "teal", "lime", "coffee", "propeller"]),
    ("armor", ["helmet", "hazmat", "jail", "trench", "metal", "charcoal", "shield"]),
    ("gemValue", ["btc", "crypto", "diamond", "dimond", "gold", "earring"]),
]

STAT_LABELS = {
    "damage": "Damage",
    "magnetRange": "Magnet",
    "luck": "Luck",
    "swimSpeed": "Speed",
    "armor": "Armor",
    "gemValue": "Gem Value",
    "idleEfficiency": "Idle Efficiency",
}

SLOT_BASE_STATS = {
    "body": {"idleEfficiency": 0.03},
    "eyes": {"magnetRange": 0.04},
    "hat": {"luck": 0.03},
    "clothes": {"armor": 0.3},
    "boost": {"gemValue": 0.04},
    "legendary": {"swimSpeed": 0.15, "magnetRange": 0.15, "gemValue": 0.15, "luck": 0.15, "damage": 0.15, "armor": 1.0, "idleEfficiency": 0.15},
    "halloween": {"damage": 0.1, "luck": 0.08},
}

RARITY_STAT_MULTIPLIER = {
    "starter": 0.0,
    "common": 1.0,
    "uncommon": 1.45,
    "rare": 2.0,
    "legendary": 3.0,
    "event": 2.4,
}

NEGATIVE_STATS = {
    "body-red": {"swimSpeed": -0.05},
}

def slugify(name):
    slug = name.lower().replace("&", " and ")
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    return slug or "asset"


def title_name(path):
    stem = path.stem.replace("_", " ").replace("-", " ")
    stem = re.sub(r"\s+", " ", stem).strip()
    return " ".join(part.capitalize() for part in stem.split(" "))


def copy_raw(src, raw_rel):
    dst = RAW / raw_rel / src.name
    dst.parent.mkdir(parents=True, exist_ok=True)
    if not dst.exists() or src.stat().st_mtime > dst.stat().st_mtime or src.stat().st_size != dst.stat().st_size:
        shutil.copy2(src, dst)


def extract_frames(src, generated_rel, slug):
    out_dir = GENERATED / generated_rel / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    try:
        image = Image.open(src)
        frames = []
        for frame in ImageSequence.Iterator(image):
            frames.append(frame.convert("RGBA"))
            if len(frames) >= FRAME_LIMIT:
                break
        if not frames:
            return 0
        for old in out_dir.glob("frame_*.png"):
            old.unlink()
        for index, frame in enumerate(frames):
            frame.save(out_dir / f"frame_{index:02d}.png")
        return len(frames)
    except Exception as exc:
        print(f"Could not extract {src}: {exc}")
        return 0


def rarity_for(name, slot):
    lowered = name.lower()
    if slot == "legendary":
        return "legendary"
    if slot == "halloween":
        return "event"
    for rarity, keywords in RARITY_KEYWORDS:
        if any(keyword in lowered for keyword in keywords):
            return rarity
    return "common"


def stat_mods_for(asset_id, name, slot, rarity):
    if rarity == "starter":
        return {}

    lowered = name.lower()
    scale = RARITY_STAT_MULTIPLIER.get(rarity, 1.0)
    mods = dict(SLOT_BASE_STATS.get(slot, {}))

    for stat_key, keywords in STAT_KEYWORDS:
        if any(keyword in lowered for keyword in keywords):
            if stat_key == "armor":
                mods[stat_key] = mods.get(stat_key, 0) + round(0.5 * scale, 2)
            else:
                mods[stat_key] = mods.get(stat_key, 0) + round(0.06 * scale, 2)

    for stat_key, value in NEGATIVE_STATS.get(asset_id, {}).items():
        mods[stat_key] = mods.get(stat_key, 0) + value

    return {key: round(value, 2) for key, value in mods.items() if value}


def stats_text_for(mods, slot):
    if mods:
        labels = []
        for key, value in mods.items():
            sign = "+" if value > 0 else ""
            suffix = "" if key == "armor" else "x"
            labels.append(f"{STAT_LABELS.get(key, key)} {sign}{value}{suffix}")
        return ", ".join(labels[:3])
    if slot == "body":
        return "Base identity modifier"
    if slot == "eyes":
        return "Perception modifier"
    if slot == "hat":
        return "Weapon modifier"
    if slot == "clothes":
        return "Survival modifier"
    if slot == "boost":
        return "Passive boost"
    if slot == "legendary":
        return "Complete legendary form"
    if slot == "halloween":
        return "Event body form"
    return "Trait modifier"


def stat_price_value(stat_mods):
    value = 0
    for stat_key, amount in stat_mods.items():
        weight = STAT_PRICE_WEIGHTS.get(stat_key, 400)
        if amount > 0:
            value += amount * weight
        else:
            value += amount * weight * 0.45
    return value


def price_for(rarity, slot, index, stat_mods):
    base = RARITY_PRICE[rarity]
    if base == 0:
        return 0
    multiplier = SLOT_PRICE_MULTIPLIER.get(slot, 1.0)
    variance = (index % 4) * 10
    stat_value = stat_price_value(stat_mods)
    price = base * multiplier + stat_value + variance
    return max(35, int(round(price / 5) * 5))


def js_string(value):
    return '"' + str(value).replace('\\', '\\\\').replace('"', '\\"') + '"'


def js_object(entry):
    parts = []
    for key, value in entry.items():
        if value is None:
            continue
        if isinstance(value, str):
            parts.append(f"{key}: {js_string(value)}")
        elif isinstance(value, dict):
            inner = ", ".join(f"{inner_key}: {inner_value}" for inner_key, inner_value in value.items())
            parts.append(f"{key}: {{ {inner} }}")
        else:
            parts.append(f"{key}: {value}")
    return "{ " + ", ".join(parts) + " }"


def build_slot(config):
    files = []
    if config["source"].exists():
        for path in sorted(config["source"].iterdir(), key=lambda p: p.name.lower()):
            if not path.is_file() or path.suffix.lower() not in config["extensions"]:
                continue
            if config["kind"] == "legendary" and path.name.endswith("t.png"):
                continue
            files.append(path)

    entries = []
    for index, path in enumerate(files):
        name = title_name(path)
        slug = slugify(path.stem)
        asset_id = f"{config['slot']}-{slug}"
        key = asset_id
        copy_raw(path, config["raw"])
        frames = 0
        frame_path = None
        if config["generated"]:
            frames = extract_frames(path, config["generated"], slug)
            if frames:
                frame_path = f"/assets/generated/{config['generated']}/{slug}/frame_00.png"
        rarity = rarity_for(name, config["slot"])
        stat_mods = stat_mods_for(asset_id, name, config["slot"], rarity)
        entry = {
            "id": asset_id,
            "name": name,
            "slot": config["slot"],
            "rarity": rarity,
            "price": price_for(rarity, config["slot"], index, stat_mods),
            "stats": stats_text_for(stat_mods, config["slot"]),
            "statMods": stat_mods,
            "key": key,
            "frames": frames or None,
            "framePath": frame_path,
            "path": f"/assets/raw/{config['raw']}/{path.name}",
        }
        entry.update(METADATA_OVERRIDES.get(asset_id, {}))
        if "statMods" not in entry:
            entry["statMods"] = stat_mods
        entries.append(entry)
    return entries


def write_catalog(all_entries):
    by_export = {config["export"]: all_entries[config["export"]] for config in SLOTS}
    lines = []
    lines.append("export const GEM_TYPES = {")
    lines.append("    green: { label: \"Green\", value: 1, key: \"gem-green\", frames: 9, framePath: \"/assets/generated/gems/green/frame_00.png\" },")
    lines.append("    blue: { label: \"Blue\", value: 3, key: \"gem-blue\", frames: 9, framePath: \"/assets/generated/gems/blue/frame_00.png\" },")
    lines.append("    yellow: { label: \"Yellow\", value: 5, key: \"gem-yellow\", frames: 9, framePath: \"/assets/generated/gems/yellow/frame_00.png\" },")
    lines.append("    pink: { label: \"Pink\", value: 10, key: \"gem-pink\", frames: 9, framePath: \"/assets/generated/gems/pink/frame_00.png\" },")
    lines.append("    silver: { label: \"Silver\", value: 25, key: \"gem-silver\", frames: 9, framePath: \"/assets/generated/gems/silver/frame_00.png\" }")
    lines.append("};")
    lines.append("")
    lines.append("export const STARTER_LOADOUT = {")
    lines.append("    body: \"body-blue\",")
    lines.append("    eyes: \"eyes-regular\",")
    lines.append("    hat: null,")
    lines.append("    clothes: null,")
    lines.append("    boost: null")
    lines.append("};")
    lines.append("")
    for export_name, entries in by_export.items():
        lines.append(f"export const {export_name} = [")
        for i, entry in enumerate(entries):
            comma = "," if i < len(entries) - 1 else ""
            lines.append(f"    {js_object(entry)}{comma}")
        lines.append("];\n")
    lines.append("export const SHOP_ASSETS = [")
    lines.append("    ...BODY_ASSETS,")
    lines.append("    ...EYE_ASSETS,")
    lines.append("    ...HAT_ASSETS,")
    lines.append("    ...CLOTHES_ASSETS,")
    lines.append("    ...BOOST_ASSETS")
    lines.append("];\n")
    lines.append("export const SPECIAL_FORM_ASSETS = [")
    lines.append("    ...LEGENDARY_ASSETS,")
    lines.append("    ...HALLOWEEN_BODY_ASSETS")
    lines.append("];\n")
    lines.append("export const ALL_ASSETS = [")
    lines.append("    ...SHOP_ASSETS,")
    lines.append("    ...SPECIAL_FORM_ASSETS")
    lines.append("];\n")
    lines.append("export const STARTER_UNLOCKS = [\"body-blue\", \"eyes-regular\"];")
    lines.append("")
    lines.append("export const RARE_TRAIT_POOL = [")
    lines.append("    ...EYE_ASSETS.filter(asset => asset.price > 0),")
    lines.append("    ...HAT_ASSETS,")
    lines.append("    ...CLOTHES_ASSETS,")
    lines.append("    ...BOOST_ASSETS")
    lines.append("];\n")
    lines.append("export function getAssetById(id) {")
    lines.append("    return ALL_ASSETS.find(asset => asset.id === id) || null;")
    lines.append("}\n")
    lines.append("function frameUrl(basePath, index) {")
    lines.append("    return basePath.replace(\"frame_00.png\", `frame_${String(index).padStart(2, \"0\")}.png`);")
    lines.append("}\n")
    lines.append("export function preloadCatalog(scene) {")
    lines.append("    for (const gem of Object.values(GEM_TYPES)) {")
    lines.append("        for (let i = 0; i < gem.frames; i += 1) scene.load.image(`${gem.key}-${i}`, frameUrl(gem.framePath, i));")
    lines.append("        scene.load.image(gem.key, gem.framePath);")
    lines.append("    }\n")
    lines.append("    for (const asset of ALL_ASSETS) {")
    lines.append("        if (asset.frames && asset.framePath) {")
    lines.append("            for (let i = 0; i < asset.frames; i += 1) scene.load.image(`${asset.key}-${i}`, frameUrl(asset.framePath, i));")
    lines.append("        }")
    lines.append("        scene.load.image(asset.key, asset.framePath || asset.path);")
    lines.append("    }\n")
    lines.append("    scene.load.image(\"tank-bg\", \"/assets/raw/Backgrounds/newbg1.png\");")
    lines.append("    scene.load.image(\"ocean-bg\", \"/assets/raw/Backgrounds/deep1.png\");")
    lines.append("}")
    CATALOG.write_text("\n".join(lines) + "\n")


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    GENERATED.mkdir(parents=True, exist_ok=True)
    all_entries = {}
    for config in SLOTS:
        entries = build_slot(config)
        all_entries[config["export"]] = entries
        print(f"{config['export']}: {len(entries)}")
    write_catalog(all_entries)
    print(f"Wrote {CATALOG.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
