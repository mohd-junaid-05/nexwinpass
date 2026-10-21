#!/usr/bin/env python3
"""
Mascot Asset Pipeline for Builder Pass Studio (Phase 6).
Deterministic, fully reproducible pipeline that turns source JPGs in docs/character/
into clean cutouts, normalised cast assets, bust crops, review contact sheets,
and the mascot manifest.

Usage:
  python tools/mascots/pipeline.py
"""

import os
import sys
import json
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHAR_DIR = os.path.join(ROOT_DIR, "docs", "character")
CUTOUTS_DIR = os.path.join(CHAR_DIR, "cutouts")
PUBLIC_MASCOTS_DIR = os.path.join(ROOT_DIR, "public", "mascots")
REVIEW_DIR = os.path.join(ROOT_DIR, "docs", "review")
MANIFEST_JSON_PATH = os.path.join(ROOT_DIR, "lib", "mascots", "manifest.json")
MANIFEST_TS_PATH = os.path.join(ROOT_DIR, "lib", "mascots", "manifest.ts")

# 8 Characters specification and source mapping
CHARACTERS = [
    {
        "id": "nova",
        "file": "orangechar.jpg",
        "name": "Nova",
        "tagline": "The Launch Pilot",
        "description": "Warm orange robot in a cream puffer vest with a gold star pin, white sneakers, star-shaped fin, and glowing cyan eyes.",
        "theme": {
            "shell": "#EA580C",
            "deeper": "#9A3412",
            "tint": "#FFEDD5",
            "glow": "#38BDF8",
            "accent": "#FEF3C7",
            "gradient": ["#C2410C", "#7C2D12"],
            "popBg": "#0F172A",
            "collectorPanel": ["#1E1B4B", "#312E81"]
        }
    },
    {
        "id": "byte",
        "file": "neonchar.jpg",
        "name": "Byte",
        "tagline": "The Bug Hunter",
        "description": "Lime-green robot with pixel-style square eyes, black headphones around the neck, short antenna, and black-and-lime high-tops.",
        "theme": {
            "shell": "#65A30D",
            "deeper": "#3F6212",
            "tint": "#ECFCCB",
            "glow": "#4ADE80",
            "accent": "#18181B",
            "gradient": ["#3F6212", "#14532D"],
            "popBg": "#1E1B4B",
            "collectorPanel": ["#0F172A", "#1E293B"]
        }
    },
    {
        "id": "oracle",
        "file": "purplechar.jpg",
        "name": "Oracle",
        "tagline": "The Pattern Seer",
        "description": "Deep violet robot with calm half-closed lavender eyes, floating gold halo, crescent-moon fin, star-patterned indigo hoodie, and crystal pendant.",
        "theme": {
            "shell": "#7C3AED",
            "deeper": "#4C1D95",
            "tint": "#EDE9FE",
            "glow": "#FDE047",
            "accent": "#FACC15",
            "gradient": ["#4C1D95", "#2E1065"],
            "popBg": "#F59E0B",
            "collectorPanel": ["#1E1B4B", "#3B0764"]
        }
    },
    {
        "id": "forge",
        "file": "yellowchar.jpg",
        "name": "Forge",
        "tagline": "The Code Smith",
        "description": "Amber-gold robot wearing a backwards navy cap, gold chain, utility tool belt with hammer, and tan work boots.",
        "theme": {
            "shell": "#D97706",
            "deeper": "#78350F",
            "tint": "#FEF3C7",
            "glow": "#F59E0B",
            "accent": "#1E293B",
            "gradient": ["#92400E", "#451A03"],
            "popBg": "#0284C7",
            "collectorPanel": ["#1C1917", "#292524"]
        }
    },
    {
        "id": "pixel",
        "file": "lightbluechar.jpg",
        "name": "Pixel",
        "tagline": "The Interface Artist",
        "description": "Teal robot with soft square mint eyes, lilac beret, paintbrush fin, paint-splashed tote bag, and sticker-covered arm.",
        "theme": {
            "shell": "#0D9488",
            "deeper": "#115E59",
            "tint": "#CCFBF1",
            "glow": "#2DD4BF",
            "accent": "#C084FC",
            "gradient": ["#0F766E", "#134E4A"],
            "popBg": "#FFDE00",
            "collectorPanel": ["#0F172A", "#134E4A"]
        }
    },
    {
        "id": "helix",
        "file": "pinkchar.jpg",
        "name": "Helix",
        "tagline": "The Model Whisperer",
        "description": "Hot-pink robot with ringed round eyes, dark sunglasses on the head, butterfly clips, twisted helix fin, and striped arm warmers.",
        "theme": {
            "shell": "#DB2777",
            "deeper": "#831843",
            "tint": "#FCE7F3",
            "glow": "#F472B6",
            "accent": "#06B6D4",
            "gradient": ["#9D174D", "#500724"],
            "popBg": "#047857",
            "collectorPanel": ["#1E1B4B", "#4A044E"]
        }
    },
    {
        "id": "atlas",
        "file": "darkbluechar.jpg",
        "name": "Atlas",
        "tagline": "The Systems Navigator",
        "description": "Cobalt-blue robot with smiling-arc eyes, thin antenna, navy varsity jacket with pins, striped crimson tie, and backpack.",
        "theme": {
            "shell": "#2563EB",
            "deeper": "#1E3A8A",
            "tint": "#DBEAFE",
            "glow": "#60A5FA",
            "accent": "#DC2626",
            "gradient": ["#1D4ED8", "#172554"],
            "popBg": "#FBBF24",
            "collectorPanel": ["#0B0F19", "#1E293B"]
        }
    },
    {
        "id": "glitch",
        "file": "greenchar.jpg",
        "name": "Glitch",
        "tagline": "The Chaos Tester",
        "description": "Emerald-green robot with horizontal bar eyes, intentional cyan/magenta glitch fringe edges, cracked visor corner, lightning-bolt fin, and black harness vest.",
        "theme": {
            "shell": "#059669",
            "deeper": "#064E3B",
            "tint": "#D1FAE5",
            "glow": "#22D3EE",
            "accent": "#F43F5E",
            "gradient": ["#047857", "#022C22"],
            "popBg": "#881337",
            "collectorPanel": ["#09090B", "#18181B"]
        }
    }
]

def make_cutout(img_path, mascot_id):
    """
    Produces a pristine transparent RGBA cutout from a source JPG.
    - Samples border background color.
    - Eliminates bottom-right watermark.
    - Flood-fills from exterior border to preserve internal pale highlights.
    - Preserves Glitch's cyan/magenta chromatic fringe.
    - Un-mixes background color on anti-aliased edge pixels to prevent grey halo.
    """
    im = Image.open(img_path).convert("RGB")
    arr = np.array(im).astype(float)
    h, w, _ = arr.shape
    
    # 1. Determine background color from four borders
    border_pixels = np.concatenate([
        arr[0:6, :, :].reshape(-1, 3),
        arr[-6:, :, :].reshape(-1, 3),
        arr[:, 0:6, :].reshape(-1, 3),
        arr[:, -6:, :].reshape(-1, 3)
    ], axis=0)
    bg_color = border_pixels.mean(axis=0)
    
    # 2. Distance from background
    d = np.linalg.norm(arr - bg_color, axis=2)
    
    # 3. Suppress watermark in bottom-right corner (y >= 1780, x >= 1780)
    d[1780:, 1780:] = 0.0
    arr[1780:, 1780:] = bg_color
    
    # 4. Multi-scale exterior connected-component mask
    # Background seed threshold: d < 12
    d_small = Image.fromarray((d < 12.0).astype(np.uint8) * 255).resize((512, 512), Image.Resampling.NEAREST)
    ImageDraw.floodfill(d_small, (0, 0), 128)
    bg_coarse = (np.array(d_small) == 128)
    
    # Upsample coarse background mask to 2048x2048
    bg_mask = np.array(Image.fromarray(bg_coarse.astype(np.uint8) * 255).resize((w, h), Image.Resampling.NEAREST)) > 0
    
    # Iteratively expand exterior background mask into d < 16 candidates
    # This reaches exact boundaries while never breaching internal features
    is_bg_cand = (d < 16.0)
    for _ in range(8):
        exp = bg_mask.copy()
        exp[:-1, :] |= bg_mask[1:, :]
        exp[1:, :] |= bg_mask[:-1, :]
        exp[:, :-1] |= bg_mask[:, 1:]
        exp[:, 1:] |= bg_mask[:, :-1]
        bg_mask = exp & is_bg_cand
        
    # 5. Compute alpha channel
    alpha = np.ones((h, w), dtype=float)
    alpha[bg_mask] = 0.0
    
    # Boundary border pixels for anti-aliasing
    border = np.zeros_like(bg_mask)
    border[:-1, :] |= bg_mask[1:, :]
    border[1:, :] |= bg_mask[:-1, :]
    border[:, :-1] |= bg_mask[:, 1:]
    border[:, 1:] |= bg_mask[:, :-1]
    border &= (~bg_mask)
    
    # Smooth Hermite alpha transition for boundary pixels
    # For glitch, use slightly lower d_min to keep chromatic aberration fringe delicate
    d_min = 10.0 if mascot_id == "glitch" else 12.0
    d_max = 28.0
    
    d_border = d[border]
    a_border = np.clip((d_border - d_min) / (d_max - d_min), 0.0, 1.0)
    alpha[border] = a_border
    
    # 6. Un-mix background color from edge pixels to eliminate grey fringing
    out_rgb = arr.copy()
    partial = (alpha > 0.05) & (alpha < 0.98)
    if np.any(partial):
        a_p = alpha[partial, None]
        unmixed = (out_rgb[partial] - (1.0 - a_p) * bg_color) / a_p
        out_rgb[partial] = np.clip(unmixed, 0.0, 255.0)
        
    # Clean transparent pixels
    out_rgb[alpha <= 0.05] = 0.0
    alpha[alpha <= 0.05] = 0.0
    
    out_rgba = np.dstack([out_rgb, alpha * 255.0]).astype(np.uint8)
    return Image.fromarray(out_rgba, "RGBA")

def measure_anchors(cutout_img):
    """
    Measures anchor points from the cutout:
    - Lowest point of feet/hem (baseline)
    - Head width, head center (cx, cy), and head top
    """
    arr = np.array(cutout_img)
    alpha = arr[:, :, 3]
    ys, xs = np.where(alpha > 30)
    
    if len(ys) == 0:
        return {"baseline": 1950, "head_cx": 1024, "head_cy": 600, "head_width": 1300, "top": 100}
        
    baseline = int(ys.max())
    top = int(ys.min())
    
    # Inspect head region (y between 380 and 900)
    sub_widths = []
    for y in range(max(top, 380), min(baseline, 900), 10):
        row_xs = xs[ys == y]
        if len(row_xs) > 0:
            sub_widths.append((y, row_xs.max() - row_xs.min(), row_xs.min(), row_xs.max(), row_xs.mean()))
            
    if sub_widths:
        max_w = max(sub_widths, key=lambda x: x[1])
        head_cy = int(max_w[0])
        head_width = int(max_w[1])
        head_cx = int(round(max_w[4]))
    else:
        head_cy = int(top + (baseline - top) * 0.3)
        head_width = 1300
        head_cx = 1024
        
    return {
        "baseline": baseline,
        "head_cx": head_cx,
        "head_cy": head_cy,
        "head_width": head_width,
        "top": top
    }

def normalize_character(cutout_img, anchors, target_size=1024, target_head_w=580, target_baseline=960):
    """
    Scales and positions the cutout so that:
    - The head has exact target_head_w width across all characters.
    - The feet/shoes sit precisely on target_baseline.
    - Head center X is centered at target_size // 2.
    - Accessories (halo, beret, cap, antenna) simply extend above.
    """
    scale = float(target_head_w) / float(anchors["head_width"])
    
    # Scale cutout
    orig_w, orig_h = cutout_img.size
    new_w = max(1, int(round(orig_w * scale)))
    new_h = max(1, int(round(orig_h * scale)))
    
    scaled = cutout_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Target positions in 1024x1024
    scaled_baseline = int(round(anchors["baseline"] * scale))
    scaled_head_cx = int(round(anchors["head_cx"] * scale))
    
    dest_x = (target_size // 2) - scaled_head_cx
    dest_y = target_baseline - scaled_baseline
    
    canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
    canvas.paste(scaled, (dest_x, dest_y), scaled)
    return canvas

def make_bust_crop(normalized_full, target_size=640):
    """
    Creates a bust crop (head and upper chest) from the normalized full character.
    - Never cuts through halo, hat, antenna, beret, or sunglasses.
    - Focused on head and shoulders, perfect for circular avatar and badges.
    """
    arr = np.array(normalized_full)
    alpha = arr[:, :, 3]
    ys, xs = np.where(alpha > 30)
    
    if len(ys) == 0:
        return normalized_full.resize((target_size, target_size), Image.Resampling.LANCZOS)
        
    top_y = ys.min()
    # Bust extends down to mid-chest/vest (around y=680-720 in normalized 1024 canvas)
    bottom_y = min(1024, max(top_y + 400, 710))
    
    # Center X around 512
    center_x = 512
    crop_h = bottom_y - top_y
    # Crop size with comfortable breathing room
    crop_box_size = max(int(crop_h * 1.15), 620)
    
    crop_x1 = max(0, center_x - crop_box_size // 2)
    crop_x2 = min(1024, crop_x1 + crop_box_size)
    if crop_x2 == 1024:
        crop_x1 = max(0, 1024 - crop_box_size)
        
    crop_y1 = max(0, top_y - int(crop_box_size * 0.08))
    crop_y2 = min(1024, crop_y1 + crop_box_size)
    if crop_y2 == 1024:
        crop_y1 = max(0, 1024 - crop_box_size)
        
    cropped = normalized_full.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    return cropped.resize((target_size, target_size), Image.Resampling.LANCZOS)

def generate_review_contact_sheet(cutouts, normalized_fulls, output_path):
    """
    Generates a review contact sheet showing all 8 mascots on white, black,
    and their own theme colors, to verify edges, transparency, and consistency.
    """
    cols = 8
    thumb_sz = 240
    pad = 16
    header_h = 50
    row_h = thumb_sz + pad * 2
    
    # 3 Rows: on White, on Black, on Theme Color
    sheet_w = cols * (thumb_sz + pad) + pad
    sheet_h = header_h + row_h * 3
    
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (24, 24, 27, 255))
    draw = ImageDraw.Draw(sheet)
    
    draw.text((pad, 14), "Phase 6 Review Sheet: 8 Real Cast Cutouts on White, Black, and Theme Backgrounds", fill=(255, 255, 255, 255))
    
    for i, char in enumerate(CHARACTERS):
        cid = char["id"]
        im_norm = normalized_fulls[cid].resize((thumb_sz, thumb_sz), Image.Resampling.LANCZOS)
        x = pad + i * (thumb_sz + pad)
        
        # Row 1: White
        y1 = header_h + pad
        white_bg = Image.new("RGBA", (thumb_sz, thumb_sz), (255, 255, 255, 255))
        white_bg.alpha_composite(im_norm)
        sheet.paste(white_bg, (x, y1))
        
        # Row 2: Black
        y2 = header_h + row_h + pad
        black_bg = Image.new("RGBA", (thumb_sz, thumb_sz), (0, 0, 0, 255))
        black_bg.alpha_composite(im_norm)
        sheet.paste(black_bg, (x, y2))
        
        # Row 3: Theme Pop Color
        y3 = header_h + row_h * 2 + pad
        # Parse theme hex color
        hex_c = char["theme"]["popBg"].lstrip("#")
        theme_rgb = tuple(int(hex_c[k:k+2], 16) for k in (0, 2, 4)) + (255,)
        theme_bg = Image.new("RGBA", (thumb_sz, thumb_sz), theme_rgb)
        theme_bg.alpha_composite(im_norm)
        sheet.paste(theme_bg, (x, y3))
        
        # Label
        draw.text((x + 8, y1 + 8), char["name"], fill=(0, 0, 0, 255))
        draw.text((x + 8, y2 + 8), char["name"], fill=(255, 255, 255, 255))
        draw.text((x + 8, y3 + 8), char["name"], fill=(255, 255, 255, 255))
        
    sheet.save(output_path)

def generate_anchor_overlay_sheet(cutouts, raw_anchors, output_path):
    """
    Generates a sheet with anchor points drawn on each raw cutout to verify
    by eye that head centers, head widths, and baselines are aligned.
    """
    cols = 4
    rows = 2
    thumb_sz = 360
    pad = 20
    sheet_w = cols * (thumb_sz + pad) + pad
    sheet_h = rows * (thumb_sz + pad) + pad
    
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (15, 23, 42, 255))
    draw = ImageDraw.Draw(sheet)
    
    for idx, char in enumerate(CHARACTERS):
        cid = char["id"]
        col = idx % cols
        row = idx // cols
        x = pad + col * (thumb_sz + pad)
        y = pad + row * (thumb_sz + pad)
        
        raw_im = cutouts[cid]
        scale = thumb_sz / 2048.0
        scaled_im = raw_im.resize((thumb_sz, thumb_sz), Image.Resampling.LANCZOS)
        
        # Base background
        card = Image.new("RGBA", (thumb_sz, thumb_sz), (30, 41, 59, 255))
        card.alpha_composite(scaled_im)
        
        cdraw = ImageDraw.Draw(card)
        anc = raw_anchors[cid]
        
        # Draw baseline in bright cyan
        bl_y = int(round(anc["baseline"] * scale))
        cdraw.line([(0, bl_y), (thumb_sz, bl_y)], fill=(34, 211, 238, 255), width=2)
        
        # Draw head center crosshair in vibrant magenta
        hc_x = int(round(anc["head_cx"] * scale))
        hc_y = int(round(anc["head_cy"] * scale))
        cdraw.line([(hc_x - 12, hc_y), (hc_x + 12, hc_y)], fill=(244, 63, 94, 255), width=2)
        cdraw.line([(hc_x, hc_y - 12), (hc_x, hc_y + 12)], fill=(244, 63, 94, 255), width=2)
        
        # Draw head width bar in yellow
        hw_half = int(round((anc["head_width"] / 2.0) * scale))
        cdraw.line([(hc_x - hw_half, hc_y), (hc_x + hw_half, hc_y)], fill=(250, 204, 21, 255), width=3)
        cdraw.line([(hc_x - hw_half, hc_y - 6), (hc_x - hw_half, hc_y + 6)], fill=(250, 204, 21, 255), width=2)
        cdraw.line([(hc_x + hw_half, hc_y - 6), (hc_x + hw_half, hc_y + 6)], fill=(250, 204, 21, 255), width=2)
        
        # Label
        cdraw.text((10, 10), f"{char['name']} (Head: {anc['head_width']}px)", fill=(255, 255, 255, 255))
        cdraw.text((10, thumb_sz - 24), f"Baseline y={anc['baseline']}", fill=(34, 211, 238, 255))
        
        sheet.paste(card, (x, y))
        
    sheet.save(output_path)

def generate_review_matrix(normalized_fulls, output_path):
    """
    Generates a 4-style by 8-mascot matrix showing every combination
    of the real pass preview to guarantee contrast and visual excellence.
    """
    styles = ["editorial", "night", "pop", "collector"]
    card_w = 270
    card_h = 338
    pad = 16
    
    matrix_w = len(CHARACTERS) * (card_w + pad) + pad
    matrix_h = len(styles) * (card_h + pad) + pad + 50
    
    matrix = Image.new("RGBA", (matrix_w, matrix_h), (11, 15, 25, 255))
    draw = ImageDraw.Draw(matrix)
    
    draw.text((pad, 16), "Phase 6 Review Matrix: 4 Styles × 8 Mascots (32 Combinations)", fill=(255, 255, 255, 255))
    
    for s_idx, style in enumerate(styles):
        row_y = 50 + pad + s_idx * (card_h + pad)
        
        for m_idx, char in enumerate(CHARACTERS):
            cid = char["id"]
            col_x = pad + m_idx * (card_w + pad)
            
            card = Image.new("RGBA", (card_w, card_h), (0, 0, 0, 255))
            cdraw = ImageDraw.Draw(card)
            
            theme = char["theme"]
            
            # Draw style-specific background
            if style == "editorial":
                card.paste((246, 244, 237, 255), [0, 0, card_w, card_h])
                cdraw.rectangle([10, 10, card_w - 10, card_h - 10], outline=(221, 213, 196, 255), width=1)
                # Arch
                arch_w = 120
                arch_h = 160
                arch_x = card_w - arch_w - 18
                arch_y = 45
                cdraw.rounded_rectangle([arch_x, arch_y, arch_x + arch_w, arch_y + arch_h], radius=50, fill=(237, 232, 220, 255), outline=(186, 112, 66, 120), width=1)
                # Contact shadow
                cdraw.ellipse([arch_x + 15, arch_y + arch_h - 14, arch_x + arch_w - 15, arch_y + arch_h + 4], fill=(0, 0, 0, 45))
                # Mascot
                masc_thumb = normalized_fulls[cid].resize((130, 130), Image.Resampling.LANCZOS)
                card.alpha_composite(masc_thumb, (arch_x - 5, arch_y + 18))
                
                # Text
                cdraw.text((18, 20), "NEXWIN/HACK 26", fill=(74, 67, 55, 255))
                cdraw.text((18, 55), "Alex Rivera", fill=(30, 26, 22, 255))
                cdraw.text((18, 75), "Autonomous Agent Mesh", fill=(138, 59, 20, 255))
                cdraw.text((18, 110), f"MASCOT: {char['name']}", fill=(90, 80, 70, 255))
                cdraw.text((18, card_h - 30), "AI & Machine Learning", fill=(74, 67, 55, 255))
                
            elif style == "night":
                card.paste((8, 11, 18, 255), [0, 0, card_w, card_h])
                cdraw.rounded_rectangle([8, 8, card_w - 8, card_h - 8], radius=12, outline=tuple(int(theme["shell"].lstrip("#")[k:k+2], 16) for k in (0, 2, 4)) + (160,), width=1)
                # Glow behind mascot
                mx = card_w - 135
                my = 55
                glow_rgb = tuple(int(theme["glow"].lstrip("#")[k:k+2], 16) for k in (0, 2, 4)) + (65,)
                cdraw.ellipse([mx - 15, my - 15, mx + 130, my + 130], fill=glow_rgb)
                # Contact shadow
                cdraw.ellipse([mx + 10, my + 120, mx + 110, my + 138], fill=(0, 0, 0, 120))
                # Mascot
                masc_thumb = normalized_fulls[cid].resize((120, 120), Image.Resampling.LANCZOS)
                card.alpha_composite(masc_thumb, (mx, my + 10))
                
                # Text
                glow_txt = tuple(int(theme["glow"].lstrip("#")[k:k+2], 16) for k in (0, 2, 4)) + (255,)
                cdraw.text((18, 20), "NEXWIN/HACK 26", fill=glow_txt)
                cdraw.text((18, 55), "Alex Rivera", fill=(255, 255, 255, 255))
                cdraw.text((18, 75), "Autonomous Agent Mesh", fill=(56, 189, 248, 255))
                cdraw.text((18, 110), f"CORE: {char['name']}", fill=(148, 163, 184, 255))
                cdraw.text((18, card_h - 30), "AI & Machine Learning", fill=(148, 163, 184, 255))
                
            elif style == "pop":
                # Derived Pop background from theme
                pop_rgb = tuple(int(theme["popBg"].lstrip("#")[k:k+2], 16) for k in (0, 2, 4)) + (255,)
                card.paste(pop_rgb, [0, 0, card_w, card_h])
                cdraw.rectangle([6, 6, card_w - 6, card_h - 6], outline=(0, 0, 0, 255), width=3)
                # White badge circle
                cx = card_w - 75
                cy = 115
                cr = 60
                cdraw.ellipse([cx - cr + 4, cy - cr + 4, cx + cr + 4, cy + cr + 4], fill=(0, 0, 0, 255))
                cdraw.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=(255, 255, 255, 255), outline=(0, 0, 0, 255), width=3)
                # Mascot breaking out of circle
                masc_thumb = normalized_fulls[cid].resize((130, 130), Image.Resampling.LANCZOS)
                card.alpha_composite(masc_thumb, (cx - 65, cy - 75))
                
                # Text
                cdraw.rectangle([14, 16, 130, 34], fill=(0, 0, 0, 255))
                cdraw.text((20, 18), "NEXWIN/HACK 26", fill=(255, 255, 255, 255))
                cdraw.text((16, 50), "ALEX RIVERA", fill=(255, 255, 255, 255) if theme["popBg"] != "#FFDE00" else (0, 0, 0, 255))
                cdraw.rectangle([14, 76, 140, 96], fill=(255, 255, 255, 255), outline=(0, 0, 0, 255), width=2)
                cdraw.text((18, 78), "AGENT MESH", fill=(0, 0, 0, 255))
                cdraw.text((16, card_h - 30), "AI & MACHINE LEARNING", fill=(255, 255, 255, 255) if theme["popBg"] != "#FFDE00" else (0, 0, 0, 255))
                
            else: # collector
                card.paste((11, 14, 23, 255), [0, 0, card_w, card_h])
                cdraw.rounded_rectangle([8, 8, card_w - 8, card_h - 8], radius=10, outline=(251, 191, 36, 180), width=1)
                
                # Top panel
                panel_rgb = tuple(int(theme["collectorPanel"][0].lstrip("#")[k:k+2], 16) for k in (0, 2, 4)) + (255,)
                cdraw.rounded_rectangle([14, 40, card_w - 14, 170], radius=8, fill=panel_rgb, outline=(255, 255, 255, 60), width=1)
                # Rim glow
                glow_rgb = tuple(int(theme["glow"].lstrip("#")[k:k+2], 16) for k in (0, 2, 4)) + (60,)
                cdraw.ellipse([(card_w // 2) - 50, 50, (card_w // 2) + 50, 150], fill=glow_rgb)
                # Mascot inside top panel
                masc_thumb = normalized_fulls[cid].resize((130, 130), Image.Resampling.LANCZOS)
                card.alpha_composite(masc_thumb, ((card_w - 130) // 2, 38))
                
                # Tagline badge
                cdraw.rounded_rectangle([20, 46, 150, 64], radius=9, fill=(0, 0, 0, 160))
                cdraw.text((26, 48), char["tagline"].upper(), fill=(251, 191, 36, 255))
                
                # Participant facts below
                cdraw.text((18, 185), "Alex Rivera", fill=(255, 255, 255, 255))
                cdraw.text((18, 205), f"Tagline: {char['tagline']}", fill=(203, 213, 225, 255))
                cdraw.text((18, card_h - 30), "AI & Machine Learning", fill=(148, 163, 184, 255))
                
            # Add style badge label
            cdraw.text((card_w - 80, card_h - 22), style.upper(), fill=(148, 163, 184, 180))
            matrix.paste(card, (col_x, row_y))
            
    matrix.save(output_path)

def main():
    print("=== Builder Pass Studio: Mascot Pipeline (Phase 6) ===")
    os.makedirs(CUTOUTS_DIR, exist_ok=True)
    os.makedirs(PUBLIC_MASCOTS_DIR, exist_ok=True)
    os.makedirs(REVIEW_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(MANIFEST_JSON_PATH), exist_ok=True)
    
    cutouts = {}
    raw_anchors = {}
    normalized_fulls = {}
    bust_crops = {}
    manifest_entries = []
    
    print("\n1. Generating cutouts & measuring anchors...")
    for char in CHARACTERS:
        cid = char["id"]
        fname = char["file"]
        src_path = os.path.join(CHAR_DIR, fname)
        if not os.path.exists(src_path):
            print(f"Error: missing source image {src_path}")
            sys.exit(1)
            
        print(f"  -> Processing {cid} ({fname})...")
        cutout = make_cutout(src_path, cid)
        cutouts[cid] = cutout
        
        # Save master cutout in docs/character/cutouts/
        cutout_path = os.path.join(CUTOUTS_DIR, f"{cid}.png")
        cutout.save(cutout_path)
        
        anchors = measure_anchors(cutout)
        raw_anchors[cid] = anchors
        print(f"     Anchors: baseline={anchors['baseline']}, head_cx={anchors['head_cx']}, head_width={anchors['head_width']}")
        
    print("\n2. Normalising cast & generating crops & resolutions...")
    for char in CHARACTERS:
        cid = char["id"]
        cutout = cutouts[cid]
        anchors = raw_anchors[cid]
        
        # Normalize: target head width = 580px, baseline = 960px on 1024x1024
        norm_full = normalize_character(cutout, anchors, target_size=1024, target_head_w=580, target_baseline=960)
        normalized_fulls[cid] = norm_full
        
        # Full Large: 1024x1024
        full_large_path = os.path.join(PUBLIC_MASCOTS_DIR, f"{cid}-full-large.png")
        norm_full.save(full_large_path, optimize=True)
        
        # Full Small: 320x320
        norm_small = norm_full.resize((320, 320), Image.Resampling.LANCZOS)
        full_small_path = os.path.join(PUBLIC_MASCOTS_DIR, f"{cid}-full-small.png")
        norm_small.save(full_small_path, optimize=True)
        
        # Bust Crop Large: 640x640
        bust_large = make_bust_crop(norm_full, target_size=640)
        bust_crops[cid] = bust_large
        bust_large_path = os.path.join(PUBLIC_MASCOTS_DIR, f"{cid}-bust-large.png")
        bust_large.save(bust_large_path, optimize=True)
        
        # Bust Crop Small: 160x160
        bust_small = bust_large.resize((160, 160), Image.Resampling.LANCZOS)
        bust_small_path = os.path.join(PUBLIC_MASCOTS_DIR, f"{cid}-bust-small.png")
        bust_small.save(bust_small_path, optimize=True)
        
        fl_size = os.path.getsize(full_large_path) / 1024.0
        fs_size = os.path.getsize(full_small_path) / 1024.0
        bl_size = os.path.getsize(bust_large_path) / 1024.0
        bs_size = os.path.getsize(bust_small_path) / 1024.0
        print(f"  -> {cid:7s}: Full Large: {fl_size:.1f}KB, Full Small: {fs_size:.1f}KB, Bust Large: {bl_size:.1f}KB, Bust Small: {bs_size:.1f}KB")
        
        manifest_entries.append({
            "id": cid,
            "name": char["name"],
            "tagline": char["tagline"],
            "description": char["description"],
            "images": {
                "fullLarge": f"/mascots/{cid}-full-large.png",
                "fullSmall": f"/mascots/{cid}-full-small.png",
                "bustLarge": f"/mascots/{cid}-bust-large.png",
                "bustSmall": f"/mascots/{cid}-bust-small.png"
            },
            "anchors": {
                "headCenter": [anchors["head_cx"], anchors["head_cy"]],
                "headWidth": anchors["head_width"],
                "baseline": anchors["baseline"]
            },
            "theme": char["theme"]
        })
        
    print("\n3. Generating review sheets...")
    contact_sheet_path = os.path.join(REVIEW_DIR, "contact-sheet.png")
    generate_review_contact_sheet(cutouts, normalized_fulls, contact_sheet_path)
    print(f"  -> Saved {contact_sheet_path}")
    
    anchors_sheet_path = os.path.join(REVIEW_DIR, "anchors.png")
    generate_anchor_overlay_sheet(cutouts, raw_anchors, anchors_sheet_path)
    print(f"  -> Saved {anchors_sheet_path}")
    
    matrix_path = os.path.join(REVIEW_DIR, "matrix.png")
    generate_review_matrix(normalized_fulls, matrix_path)
    print(f"  -> Saved {matrix_path}")
    
    print("\n4. Generating mascot manifest...")
    manifest_data = {
        "version": "1.0.0",
        "defaultMascotId": "forge",
        "mascots": manifest_entries
    }
    with open(MANIFEST_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)
    print(f"  -> Saved JSON {MANIFEST_JSON_PATH}")
    
    # Generate TypeScript module
    ts_content = f"""/**
 * Generated Mascot Manifest for Builder Pass Studio.
 * Auto-generated by tools/mascots/pipeline.py - DO NOT EDIT DIRECTLY.
 */

export interface MascotTheme {{
  shell: string;
  deeper: string;
  tint: string;
  glow: string;
  accent: string;
  gradient: [string, string];
  popBg: string;
  collectorPanel: [string, string];
}}

export interface MascotImages {{
  fullLarge: string;
  fullSmall: string;
  bustLarge: string;
  bustSmall: string;
}}

export interface MascotAnchors {{
  headCenter: [number, number];
  headWidth: number;
  baseline: number;
}}

export interface MascotManifestEntry {{
  id: string;
  name: string;
  tagline: string;
  description: string;
  images: MascotImages;
  anchors: MascotAnchors;
  theme: MascotTheme;
}}

export const MASCOT_MANIFEST: MascotManifestEntry[] = {json.dumps(manifest_entries, indent=2)};

export const DEFAULT_MASCOT_ID = "forge";

export function getMascotManifestEntry(id: string): MascotManifestEntry {{
  const found = MASCOT_MANIFEST.find((m) => m.id === id);
  return found ?? MASCOT_MANIFEST[3]; // Forge fallback
}}
"""
    with open(MANIFEST_TS_PATH, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"  -> Saved TypeScript {MANIFEST_TS_PATH}")
    
    print("\n=== Pipeline completed successfully! ===")

if __name__ == "__main__":
    main()
