from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
MASTER_ROOT = ROOT / "assets" / "character-system" / "category-masters-v1" / "transparent"
STATE_ROOT = ROOT / "assets" / "character-system" / "category-states-v1"
SHEET_ROOT = STATE_ROOT / "transparent-sheets"
OUTPUT_ROOT = STATE_ROOT / "transparent"
RUNTIME_ROOT = ROOT / "public" / "art" / "category-characters"

CATEGORIES = [
    ("meat", "肉类"),
    ("fish", "鱼类"),
    ("dairy_eggs", "奶制品与鸡蛋"),
    ("vegetable", "蔬菜"),
    ("fruit", "水果"),
    ("salad", "沙拉"),
    ("leftovers", "剩菜"),
    ("ready_meal", "即食餐"),
    ("bakery", "烘焙"),
    ("drink", "饮料"),
    ("condiment", "调味品"),
    ("dry_goods", "干货"),
    ("frozen_food", "冷冻食品"),
    ("other", "其他"),
]

STATES = ("use_soon", "expired")
STATE_LABELS = ("新鲜", "临期", "过期 / 检查")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    filename = "msyhbd.ttc" if bold else "msyh.ttc"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / filename), size=size)


def alpha_crop(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    bbox = rgba.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Image has no visible pixels")
    return rgba.crop(bbox)


def square_master(image: Image.Image, size: int = 1024) -> Image.Image:
    cropped = alpha_crop(image)
    max_width = int(size * 0.84)
    max_height = int(size * 0.84)
    scale = min(max_width / cropped.width, max_height / cropped.height)
    resized = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - resized.width) // 2
    y = int(size * 0.92) - resized.height
    canvas.alpha_composite(resized, (x, y))
    return canvas


def runtime_asset(image: Image.Image, size: int = 720) -> Image.Image:
    cropped = alpha_crop(image)
    max_width = int(size * 0.86)
    max_height = int(size * 0.86)
    scale = min(max_width / cropped.width, max_height / cropped.height)
    resized = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((size - resized.width) // 2, int(size * 0.93) - resized.height))
    return canvas


def split_sheet(sheet: Image.Image) -> tuple[Image.Image, Image.Image]:
    rgba = sheet.convert("RGBA")
    midpoint = rgba.width // 2
    left = rgba.crop((0, 0, midpoint, rgba.height))
    right = rgba.crop((midpoint, 0, rgba.width, rgba.height))
    return square_master(left), square_master(right)


def thumbnail(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    cropped = alpha_crop(image)
    result = Image.new("RGBA", size, (0, 0, 0, 0))
    cropped.thumbnail((int(size[0] * 0.9), int(size[1] * 0.9)), Image.Resampling.LANCZOS)
    result.alpha_composite(cropped, ((size[0] - cropped.width) // 2, size[1] - cropped.height))
    return result


def build_review(processed: dict[str, dict[str, Image.Image]]) -> None:
    page = Image.new("RGB", (2320, 2550), "#F8F1E2")
    draw = ImageDraw.Draw(page)
    draw.text((88, 52), "Eat First  分类角色状态母版 V1", fill="#153F33", font=font(52, True))
    draw.text((90, 119), "统一状态语言 · 新鲜 / 临期 / 过期（需检查）", fill="#6F766F", font=font(25))

    card_width, card_height = 1050, 300
    start_x, start_y = 80, 185
    gap_x, gap_y = 60, 34
    art_width, art_height = 250, 190

    for index, (category, zh_name) in enumerate(CATEGORIES):
        col, row = index % 2, index // 2
        x = start_x + col * (card_width + gap_x)
        y = start_y + row * (card_height + gap_y)
        draw.rounded_rectangle(
            (x, y, x + card_width, y + card_height),
            radius=28,
            fill="#FFFDF7",
            outline="#D9C8A9",
            width=2,
        )
        draw.text((x + 28, y + 22), f"{index + 1:02d}  {zh_name}", fill="#153F33", font=font(28, True))
        draw.text((x + 30, y + 62), category, fill="#7A817A", font=font(18))

        images = [processed[category]["fresh"], processed[category]["use_soon"], processed[category]["expired"]]
        for state_index, image in enumerate(images):
            art_x = x + 230 + state_index * 265
            art_y = y + 24
            thumb = thumbnail(image, (art_width, art_height))
            page.paste(thumb, (art_x, art_y), thumb)
            label_box = draw.textbbox((0, 0), STATE_LABELS[state_index], font=font(20, True))
            label_width = label_box[2] - label_box[0]
            draw.text(
                (art_x + (art_width - label_width) // 2, y + 244),
                STATE_LABELS[state_index],
                fill="#153F33" if state_index == 0 else ("#A27620" if state_index == 1 else "#B85042"),
                font=font(20, True),
            )

    output = STATE_ROOT / "category-states-review.png"
    page.save(output, optimize=True)
    print(f"review {output.relative_to(ROOT)}")


def main() -> None:
    processed: dict[str, dict[str, Image.Image]] = {}
    for state in STATES:
        (OUTPUT_ROOT / state).mkdir(parents=True, exist_ok=True)
        (RUNTIME_ROOT / state).mkdir(parents=True, exist_ok=True)

    for category, _ in CATEGORIES:
        sheet_path = SHEET_ROOT / f"{category}.png"
        master_path = MASTER_ROOT / f"{category}.png"
        existing_use_soon = OUTPUT_ROOT / "use_soon" / f"{category}.png"
        existing_expired = OUTPUT_ROOT / "expired" / f"{category}.png"
        if not master_path.exists():
            raise FileNotFoundError(f"Missing source for {category}")

        fresh = square_master(Image.open(master_path))
        if existing_use_soon.exists() and existing_expired.exists():
            use_soon = Image.open(existing_use_soon).convert("RGBA")
            expired = Image.open(existing_expired).convert("RGBA")
        elif sheet_path.exists():
            use_soon, expired = split_sheet(Image.open(sheet_path))
        else:
            raise FileNotFoundError(
                f"Missing transparent states for {category}; remove the chroma key from raw-sheets first"
            )
        processed[category] = {"fresh": fresh, "use_soon": use_soon, "expired": expired}

        for state, image in (("use_soon", use_soon), ("expired", expired)):
            png_path = OUTPUT_ROOT / state / f"{category}.png"
            webp_path = RUNTIME_ROOT / state / f"{category}.webp"
            image.save(png_path, optimize=True)
            runtime_asset(image).save(webp_path, "WEBP", quality=90, method=6)
            if Image.open(png_path).getpixel((0, 0))[3] != 0:
                raise ValueError(f"Transparent corner validation failed for {png_path}")
            print(f"{state:8} {category:12} {webp_path.stat().st_size:7} bytes")

    build_review(processed)


if __name__ == "__main__":
    main()
