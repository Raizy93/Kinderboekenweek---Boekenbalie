from pathlib import Path
import sys

from PIL import Image


TARGET_SIZE = (198, 44)
CONTENT_SIZE = (192, 40)


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
    if sprite.getpixel((0, 0))[3] != 0 or alpha.getbbox() is None:
        raise ValueError(f"Ongeldige transparantie in {target}")
    print(f"{target.name}: {sprite.width}x{sprite.height}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Gebruik: process_bookworm_sprite.py <bron.png> <doel.png>")
    process(Path(sys.argv[1]), Path(sys.argv[2]))
