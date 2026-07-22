from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art" / "generated-sources"
OUTPUT = ROOT / "public" / "assets" / "pixel"
OUTPUT.mkdir(parents=True, exist_ok=True)


def trim(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    box = alpha.getbbox()
    if box is None:
        raise ValueError("Asset bevat geen zichtbare pixels")
    return image.crop(box)


def contain(image: Image.Image, canvas_size: tuple[int, int], inset: int = 2) -> Image.Image:
    image = trim(image)
    max_width = canvas_size[0] - inset * 2
    max_height = canvas_size[1] - inset * 2
    scale = min(max_width / image.width, max_height / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    resized = image.resize(size, Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    x = (canvas_size[0] - resized.width) // 2
    y = canvas_size[1] - inset - resized.height
    canvas.alpha_composite(resized, (x, y))
    return canvas


def process_floor() -> None:
    floor = Image.open(SOURCE / "floor-v1.png").convert("RGB")
    target_ratio = 1152 / 460
    crop_height = round(floor.width / target_ratio)
    top = max(0, (floor.height - crop_height) // 2)
    floor = floor.crop((0, top, floor.width, top + crop_height))
    floor.resize((1152, 460), Image.Resampling.NEAREST).save(OUTPUT / "floor-v1.png")


def process_furniture() -> None:
    sheet = Image.open(SOURCE / "furniture-alpha-v1.png").convert("RGBA")
    x_edges = [0, 627, 1254]
    y_edges = [0, 627, 1254]
    cells: list[Image.Image] = []
    for row in range(2):
        for column in range(2):
            left = x_edges[column] + 5
            top = y_edges[row] + 5
            right = x_edges[column + 1] - 5
            bottom = y_edges[row + 1] - 5
            cells.append(sheet.crop((left, top, right, bottom)))

    contain(cells[0], (220, 150), 3).save(OUTPUT / "bookshelf-v1.png")
    contain(cells[1], (420, 250), 3).save(OUTPUT / "desk-concept-v1.png")
    contain(cells[2], (92, 112), 3).save(OUTPUT / "book-cart-v1.png")
    contain(cells[3], (92, 112), 3).save(OUTPUT / "plant-v1.png")


def process_counter() -> None:
    counter = Image.open(SOURCE / "counter-alpha-v1.png").convert("RGBA")
    contain(counter, (1100, 150), 2).save(OUTPUT / "counter-v1.png")


def process_characters() -> None:
    sheet = Image.open(SOURCE / "characters-alpha-v1.png").convert("RGBA")
    x_edges = [0, 314, 627, 941, 1254]
    y_edges = [0, 418, 836, 1254]
    index = 0
    for row in range(3):
        for column in range(4):
            cell = sheet.crop((
                x_edges[column] + 5,
                y_edges[row] + 5,
                x_edges[column + 1] - 5,
                y_edges[row + 1] - 5,
            ))
            filename = "player-v1.png" if index == 0 else f"visitor-{index - 1}-v1.png"
            contain(cell, (56, 72), 3).save(OUTPUT / filename)
            index += 1


def process_walk_sheet(source_name: str, output_prefix: str) -> None:
    sheet = Image.open(SOURCE / source_name).convert("RGBA")
    x_edges = [round(sheet.width * index / 3) for index in range(4)]
    y_edges = [round(sheet.height * index / 3) for index in range(4)]
    frames: list[Image.Image] = []
    for row in range(3):
        for column in range(3):
            cell = sheet.crop((
                x_edges[column] + 5,
                y_edges[row] + 5,
                x_edges[column + 1] - 5,
                y_edges[row + 1] - 5,
            ))
            frames.append(trim(cell))

    canvas_size = (56, 72)
    max_width = max(frame.width for frame in frames)
    max_height = max(frame.height for frame in frames)
    scale = min((canvas_size[0] - 6) / max_width, (canvas_size[1] - 6) / max_height)
    directions = ["down", "side", "up"]
    for index, frame in enumerate(frames):
        size = (max(1, round(frame.width * scale)), max(1, round(frame.height * scale)))
        resized = frame.resize(size, Image.Resampling.NEAREST)
        canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
        x = (canvas_size[0] - resized.width) // 2
        y = canvas_size[1] - 3 - resized.height
        canvas.alpha_composite(resized, (x, y))
        direction = directions[index // 3]
        frame_index = index % 3
        canvas.save(OUTPUT / f"{output_prefix}-walk-{direction}-{frame_index}-v1.png")


def process_walk_cycles() -> None:
    process_walk_sheet("player-walk-alpha-v1.png", "character-sam")
    for character_id in ["lina", "milan", "aya", "noah"]:
        process_walk_sheet(
            f"character-{character_id}-walk-alpha-v1.png",
            f"character-{character_id}",
        )


def process_genre_icons() -> None:
    sheet = Image.open(SOURCE / "genre-icons-alpha-v1.png").convert("RGBA")
    genre_ids = [
        "avontuur", "fantasy", "humor", "spanning",
        "detective", "sciencefiction", "historisch", "informatie",
    ]
    cell_width = sheet.width // 4
    cell_height = sheet.height // 2
    for index, genre_id in enumerate(genre_ids):
        column = index % 4
        row = index // 4
        gutter = max(4, min(cell_width, cell_height) // 50)
        cell = sheet.crop((
            column * cell_width + gutter,
            row * cell_height + gutter,
            (column + 1) * cell_width - gutter,
            (row + 1) * cell_height - gutter,
        ))
        contain(cell, (36, 36), 2).save(OUTPUT / f"genre-icon-{genre_id}-v1.png")


def process_genre_sign() -> None:
    sign = Image.open(SOURCE / "genre-sign-alpha-v1.png").convert("RGBA")
    contain(sign, (220, 46), 1).save(OUTPUT / "genre-sign-v1.png")


def process_visitor_side_walks() -> None:
    for frame_index, step_name in enumerate(["a", "b"]):
        sheet = Image.open(SOURCE / f"visitors-side-step-{step_name}-alpha-v1.png").convert("RGBA")
        x_edges = [round(sheet.width * index / 4) for index in range(5)]
        y_edges = [round(sheet.height * index / 3) for index in range(4)]
        cast_index = 0
        for row in range(3):
            for column in range(4):
                cell = sheet.crop((
                    x_edges[column] + 5,
                    y_edges[row] + 5,
                    x_edges[column + 1] - 5,
                    y_edges[row + 1] - 5,
                ))
                if cast_index > 0:
                    visitor_index = cast_index - 1
                    contain(cell, (56, 72), 3).save(
                        OUTPUT / f"visitor-{visitor_index}-walk-side-{frame_index}-v1.png"
                    )
                cast_index += 1


if __name__ == "__main__":
    process_floor()
    process_furniture()
    process_counter()
    process_characters()
    process_walk_cycles()
    process_genre_icons()
    process_genre_sign()
    process_visitor_side_walks()
    print(f"Assets geschreven naar {OUTPUT}")
