from pathlib import Path
import math
import struct
import wave


SAMPLE_RATE = 44100
DURATION = 0.52


def envelope(time: float) -> float:
    attack = min(1.0, time / 0.018)
    release = min(1.0, max(0.0, (DURATION - time) / 0.12))
    return attack * release


def synthesize(target: Path) -> None:
    frames: list[bytes] = []
    for index in range(round(SAMPLE_RATE * DURATION)):
        time = index / SAMPLE_RATE
        frequency = 330.0 if time < 0.22 else 247.0
        local_time = time if time < 0.22 else time - 0.22
        phase = 2 * math.pi * frequency * local_time
        fundamental = math.sin(phase)
        soft_harmonic = 0.18 * math.sin(phase * 2)
        gap = 0.35 if 0.205 < time < 0.235 else 1.0
        sample = (fundamental + soft_harmonic) * envelope(time) * gap * 0.28
        frames.append(struct.pack("<h", round(max(-1.0, min(1.0, sample)) * 32767)))

    target.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(target), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(SAMPLE_RATE)
        output.writeframes(b"".join(frames))
    print(f"{target.name}: {DURATION:.2f} seconden")


if __name__ == "__main__":
    synthesize(Path("public/assets/sounds/wrong-answer.wav"))
