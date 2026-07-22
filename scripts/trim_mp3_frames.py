from pathlib import Path
import sys


BITRATES_MPEG1_LAYER3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
BITRATES_MPEG2_LAYER3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]
SAMPLE_RATES = [44100, 48000, 32000]


def audio_start(data: bytes) -> int:
    if data[:3] != b"ID3" or len(data) < 10:
        return 0
    size = 0
    for byte in data[6:10]:
        size = (size << 7) | (byte & 0x7F)
    return 10 + size


def frame_info(header: int) -> tuple[int, float] | None:
    if (header >> 21) & 0x7FF != 0x7FF:
        return None
    version_bits = (header >> 19) & 0b11
    layer_bits = (header >> 17) & 0b11
    bitrate_index = (header >> 12) & 0b1111
    sample_rate_index = (header >> 10) & 0b11
    padding = (header >> 9) & 1
    if version_bits == 0b01 or layer_bits != 0b01 or bitrate_index in (0, 15) or sample_rate_index == 3:
        return None

    is_mpeg1 = version_bits == 0b11
    divisor = 1 if is_mpeg1 else 2 if version_bits == 0b10 else 4
    sample_rate = SAMPLE_RATES[sample_rate_index] // divisor
    bitrates = BITRATES_MPEG1_LAYER3 if is_mpeg1 else BITRATES_MPEG2_LAYER3
    bitrate = bitrates[bitrate_index] * 1000
    frame_length = int((144 if is_mpeg1 else 72) * bitrate / sample_rate) + padding
    samples = 1152 if is_mpeg1 else 576
    return frame_length, samples / sample_rate


def trim(source: Path, target: Path, start_seconds: float, end_seconds: float) -> None:
    data = source.read_bytes()
    position = audio_start(data)
    elapsed = 0.0
    selected: list[bytes] = []
    selected_duration = 0.0

    while position + 4 <= len(data):
        info = frame_info(int.from_bytes(data[position:position + 4], "big"))
        if info is None:
            position += 1
            continue
        frame_length, duration = info
        if position + frame_length > len(data):
            break
        if elapsed + duration > start_seconds and elapsed < end_seconds:
            selected.append(data[position:position + frame_length])
            selected_duration += duration
        if elapsed >= end_seconds:
            break
        position += frame_length
        elapsed += duration

    if not selected:
        raise ValueError(f"Geen MP3-frames gevonden tussen {start_seconds} en {end_seconds} seconden")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(b"".join(selected))
    print(f"{target.name}: {selected_duration:.3f} seconden, {len(selected)} frames")


if __name__ == "__main__":
    if len(sys.argv) != 5:
        raise SystemExit("Gebruik: trim_mp3_frames.py <bron.mp3> <doel.mp3> <start> <einde>")
    trim(Path(sys.argv[1]), Path(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]))
