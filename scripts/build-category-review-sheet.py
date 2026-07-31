from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


PROJECT_ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = PROJECT_ROOT / "assets" / "character-system" / "category-masters-v1"
SOURCE_ROOT = ASSET_ROOT / "transparent"
OUTPUT_PATH = ASSET_ROOT / "category-masters-review.png"

ITEMS = [
    ("01", "肉类", "meat"),
    ("02", "鱼类", "fish"),
    ("03", "奶制品与鸡蛋", "dairy_eggs"),
    ("04", "蔬菜", "vegetable"),
    ("05", "水果", "fruit"),
    ("06", "沙拉", "salad"),
    ("07", "剩菜", "leftovers"),
    ("08", "即食餐", "ready_meal"),
    ("09", "烘焙", "bakery"),
    ("10", "饮料", "drink"),
    ("11", "调味品", "condiment"),
    ("12", "干货", "dry_goods"),
    ("13", "冷冻食品", "frozen_food"),
    ("14", "其他", "other"),
]

BACKGROUND = "#F7F1E3"
CARD = "#FFFDF7"
LINE = "#DCCFB9"
INK = "#173D2C"
MUTED = "#6F756D"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    family = "msyhbd.ttc" if bold else "msyh.ttc"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / family), size)


def main() -> None:
    canvas = Image.new("RGB", (1600, 1760), BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    draw.text((80, 54), "Eat First  分类角色初始母版 V1", font=font(48, True), fill=INK)
    draw.text(
        (82, 122),
        "仅供造型审核 · 初始新鲜形态 · 尚未接入产品",
        font=font(23),
        fill=MUTED,
    )

    columns = 4
    card_width = 350
    card_height = 370
    gap_x = 24
    gap_y = 24
    start_x = 80
    start_y = 190

    for index, (number, chinese, key) in enumerate(ITEMS):
        row, column = divmod(index, columns)
        left = start_x + column * (card_width + gap_x)
        top = start_y + row * (card_height + gap_y)
        right = left + card_width
        bottom = top + card_height
        draw.rounded_rectangle(
            (left, top, right, bottom),
            radius=28,
            fill=CARD,
            outline=LINE,
            width=2,
        )

        image = Image.open(SOURCE_ROOT / f"{key}.png").convert("RGBA")
        alpha_box = image.getchannel("A").getbbox()
        if alpha_box:
            image = image.crop(alpha_box)
        image.thumbnail((275, 265), Image.Resampling.LANCZOS)
        image_left = left + (card_width - image.width) // 2
        image_top = top + 22 + (270 - image.height) // 2
        canvas.paste(image, (image_left, image_top), image)

        draw.text(
            (left + 22, top + 302),
            number,
            font=font(19, True),
            fill=MUTED,
        )
        draw.text(
            (left + 70, top + 294),
            chinese,
            font=font(27, True),
            fill=INK,
        )
        draw.text(
            (left + 70, top + 333),
            key,
            font=font(16),
            fill=MUTED,
        )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUTPUT_PATH, optimize=True)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
