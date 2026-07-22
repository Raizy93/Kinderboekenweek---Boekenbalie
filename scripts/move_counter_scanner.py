from pathlib import Path
import sys

from PIL import Image


SCANNER_BOX = (536, 8, 587, 82)
WOOD_SOURCE_BOX = (820, 8, 871, 82)
NEW_SCANNER_POSITION = (205, 8)


def move_scanner(source: Path, target: Path) -> None:
    counter = Image.open(source).convert("RGBA")
    scanner_patch = counter.crop(SCANNER_BOX)
    wood_patch = counter.crop(WOOD_SOURCE_BOX)

    moved = counter.copy()
    moved.paste(wood_patch, SCANNER_BOX[:2])
    moved.paste(scanner_patch, NEW_SCANNER_POSITION)
    target.parent.mkdir(parents=True, exist_ok=True)
    moved.save(target, optimize=True)

    if moved.size != counter.size or moved.getpixel((0, 0))[3] != counter.getpixel((0, 0))[3]:
        raise ValueError("Afmetingen of transparantie van de balie zijn gewijzigd")
    print(f"{target.name}: scanner verplaatst naar x={NEW_SCANNER_POSITION[0]}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Gebruik: move_counter_scanner.py <bron.png> <doel.png>")
    move_scanner(Path(sys.argv[1]), Path(sys.argv[2]))
