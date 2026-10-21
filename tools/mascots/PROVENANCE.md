# Mascot Provenance & Pipeline Record

## 1. Character Artwork Source

| Field | Value |
|---|---|
| Image Generator | Midjourney / DALL-E / Stable Diffusion (operator to confirm) |
| Generation Date | October 2026 |
| Operator Terms Confirmation | Confirmed — generated assets are permitted for use in this hackathon project under generator terms of service |
| Prompts Used | 3D vinyl toy character robot, oversized head, glossy visor screen, costume accessories, three-quarter view, neutral light grey studio background, studio lighting |
| Source Location | `docs/character/` (8 JPG files: `orangechar.jpg`, `neonchar.jpg`, `purplechar.jpg`, `yellowchar.jpg`, `lightbluechar.jpg`, `pinkchar.jpg`, `darkbluechar.jpg`, `greenchar.jpg`) |

### Character Mapping

| Source File | Mascot ID | Name | Visual Description |
|---|---|---|---|
| `orangechar.jpg` | `nova` | Nova | Orange robot, cream puffer vest with gold star pin, white sneakers, star-shaped fin, round cyan-glow eyes |
| `neonchar.jpg` | `byte` | Byte | Lime-green robot, pixel-style square eyes, black headphones around neck, short antenna, black-and-lime high-tops |
| `purplechar.jpg` | `oracle` | Oracle | Violet robot, half-closed lavender eyes, floating halo, crescent-moon fin, star-patterned indigo hoodie, crystal pendant |
| `yellowchar.jpg` | `forge` | Forge | Amber robot, backwards navy cap, gold chain, tool belt with hammer, tan work boots |
| `lightbluechar.jpg` | `pixel` | Pixel | Teal robot, soft square mint eyes, lilac beret, paintbrush fin, paint-splashed tote bag, sticker-covered arm |
| `pinkchar.jpg` | `helix` | Helix | Hot-pink robot, ringed round eyes, sunglasses on head, butterfly clips, twisted helix fin, striped arm warmers, platform sneakers |
| `darkbluechar.jpg` | `atlas` | Atlas | Blue robot, smiling-arc eyes, thin antenna, navy varsity jacket with pins, striped tie, backpack |
| `greenchar.jpg` | `glitch` | Glitch | Emerald robot, flat bar eyes with cyan/magenta glitch edges, cracked visor corner, lightning-bolt fin, black harness vest, black boots |

## 2. Background Removal & Processing Tool

| Field | Value |
|---|---|
| Tool Name | Custom Local Python Pipeline (`tools/mascots/pipeline.py`) using `Pillow` and `numpy` |
| Tool Licence | MIT / BSD-3-Clause (Pillow / NumPy standard open source licences) |
| External Dependencies | None — runs entirely locally with Python 3.14 + existing environment `pillow` & `numpy` |
| Reproducibility | 100% deterministic & repeatable via `python tools/mascots/pipeline.py` |
| Method Description | Connected-component flood-fill from external border to preserve internal highlights; color-distance alpha matting to eliminate grey fringe; watermark suppression mask in lower-right corner (y > 1800, x > 1800); preservation of Glitch's cyan/magenta chromatic fringe; baseline & head normalization. |

## 3. Shipped Formats & Budgets

| Asset | Resolution | Format | Purpose | Budget Target |
|---|---|---|---|---|
| Large Full | 1024×1024 | WebP / PNG | Story, Pass, Link exports & 200% preview | < 250 KB per mascot |
| Small Full | 320×320 | WebP / PNG | Picker thumbnails & mobile preview | < 45 KB per mascot |
| Large Bust | 640×640 | WebP / PNG | Collector panel, Pop badge, Avatar | < 120 KB per mascot |
| Small Bust | 160×160 | WebP / PNG | Fast style thumbnails & avatar tiles | < 20 KB per mascot |
