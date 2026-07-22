from pathlib import Path
import sys

from PIL import Image


TARGET_SIZE = (48, 60)
CONTENT_SIZE = (44, 56)


def process(source: Path, target: Path) -> None:
    image = Image.open(source).convert("RGBA")
    bounds = image.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError(f"Geen zichtbare pixels in {source}")

    cropped = image.crop(bounds)
    scale = min(CONTENT_SIZE[0] / cropped.width, CONTENT_SIZE[1] / cropped.height)
    resized_size = (
        max(1, round(cropped.width * scale)),
        max(1, round(cropped.height * scale)),
    )
    resized = cropped.resize(resized_size, Image.Resampling.NEAREST)
    sprite = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    position = (
        (TARGET_SIZE[0] - resized.width) // 2,
        (TARGET_SIZE[1] - resized.height) // 2,
    )
    sprite.alpha_composite(resized, position)
    target.parent.mkdir(parents=True, exist_ok=True)
    sprite.save(target, optimize=True)

    alpha = sprite.getchannel("A")
    visible = sum(alpha.histogram()[1:])
    if sprite.getpixel((0, 0))[3] != 0 or visible < 300:
        raise ValueError(f"Ongeldige transparantie of dekking in {target}")
    print(f"{target.name}: {sprite.width}x{sprite.height}, {visible} zichtbare pixels")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Gebruik: process_book_sprites.py <bron.png> <doel.png>")
    process(Path(sys.argv[1]), Path(sys.argv[2]))
