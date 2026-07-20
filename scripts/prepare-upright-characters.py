from collections import deque
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path.cwd()
SOURCE_DIR = ROOT / "assets" / "character-system"
SOURCE = SOURCE_DIR / "upright-fresh-production-sheet-alpha.png"
OUT_DIR = ROOT / "public" / "art" / "upright-characters"


CHARACTERS = {
    "tomato": (0, 430),
    "carrot": (400, 700),
    "broccoli": (680, 1115),
    "eggplant": (1080, 1410),
    "mushroom": (1380, 1776),
}


def fit_character(source: Image.Image, x_range: tuple[int, int]) -> Image.Image:
    segment = source.crop((x_range[0], 0, x_range[1], source.height))
    alpha = keep_largest_component(segment.getchannel("A"))
    segment.putalpha(alpha)
    bbox = alpha.getbbox()
    if bbox is None:
        raise RuntimeError(f"No visible character found in segment {x_range}")

    character = segment.crop(bbox)
    character.thumbnail((620, 620), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (720, 720), (0, 0, 0, 0))
    x = (canvas.width - character.width) // 2
    y = 668 - character.height
    canvas.alpha_composite(character, (x, y))
    return canvas


def keep_largest_component(alpha: Image.Image) -> Image.Image:
    binary = alpha.point(lambda value: 255 if value > 10 else 0)
    pixels = binary.load()
    width, height = binary.size
    seen = bytearray(width * height)
    largest: list[tuple[int, int]] = []

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if seen[index] or pixels[x, y] == 0:
                continue

            component: list[tuple[int, int]] = []
            queue = deque([(x, y)])
            seen[index] = 1
            while queue:
                px, py = queue.popleft()
                component.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    neighbour = ny * width + nx
                    if seen[neighbour] or pixels[nx, ny] == 0:
                        continue
                    seen[neighbour] = 1
                    queue.append((nx, ny))

            if len(component) > len(largest):
                largest = component

    mask = Image.new("L", (width, height), 0)
    mask_pixels = mask.load()
    source_pixels = alpha.load()
    for x, y in largest:
        mask_pixels[x, y] = source_pixels[x, y]
    return mask


def write_app_icons(tomato: Image.Image) -> None:
    master = Image.new("RGBA", (1024, 1024), "#244936")
    paper = Image.new("RGBA", (760, 760), "#F7EEDC")
    mask = Image.new("L", paper.size, 0)
    rounded = ImageOps.expand(mask, border=0)
    from PIL import ImageDraw

    draw = ImageDraw.Draw(rounded)
    draw.rounded_rectangle((0, 0, 759, 759), radius=190, fill=255)
    master.alpha_composite(Image.composite(paper, Image.new("RGBA", paper.size), rounded), (132, 132))

    tomato_copy = tomato.copy()
    tomato_copy.thumbnail((670, 670), Image.Resampling.LANCZOS)
    master.alpha_composite(
        tomato_copy,
        ((1024 - tomato_copy.width) // 2, 240 + (570 - tomato_copy.height)),
    )

    art_master = ROOT / "public" / "art" / "app-icon-upright.webp"
    master.convert("RGB").save(art_master, "WEBP", quality=94, method=6)

    icon_dir = ROOT / "public" / "icons"
    icon_dir.mkdir(parents=True, exist_ok=True)
    for name, size in (("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)):
        master.resize((size, size), Image.Resampling.LANCZOS).convert("RGB").save(icon_dir / name, "PNG", optimize=True)


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    outputs: dict[str, Image.Image] = {}

    for name, x_range in CHARACTERS.items():
        output = fit_character(source, x_range)
        output.save(OUT_DIR / f"{name}.webp", "WEBP", quality=92, method=6)
        outputs[name] = output

    write_app_icons(outputs["tomato"])



if __name__ == "__main__":
    main()
