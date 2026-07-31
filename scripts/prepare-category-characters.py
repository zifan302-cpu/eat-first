from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = (
    ROOT
    / "assets"
    / "character-system"
    / "category-masters-v1"
    / "transparent"
)
OUT_DIR = ROOT / "public" / "art" / "category-characters"

CATEGORIES = (
    "meat",
    "fish",
    "dairy_eggs",
    "vegetable",
    "fruit",
    "salad",
    "leftovers",
    "ready_meal",
    "bakery",
    "drink",
    "condiment",
    "dry_goods",
    "frozen_food",
    "other",
)


def prepare_character(source_path: Path) -> Image.Image:
    source = Image.open(source_path).convert("RGBA")
    bbox = source.getchannel("A").getbbox()
    if bbox is None:
        raise RuntimeError(f"No visible character found in {source_path}")

    character = source.crop(bbox)
    character.thumbnail((620, 620), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (720, 720), (0, 0, 0, 0))
    x = (canvas.width - character.width) // 2
    y = 668 - character.height
    canvas.alpha_composite(character, (x, y))
    return canvas


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for category in CATEGORIES:
        source_path = SOURCE_DIR / f"{category}.png"
        if not source_path.exists():
            raise FileNotFoundError(f"Missing category master: {source_path}")

        output = prepare_character(source_path)
        destination = OUT_DIR / f"{category}.webp"
        output.save(destination, "WEBP", quality=90, method=6)
        print(f"{category}: {destination.stat().st_size} bytes")


if __name__ == "__main__":
    main()
