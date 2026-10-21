import os
from PIL import Image
import numpy as np

os.makedirs("public/brand", exist_ok=True)
os.makedirs("app", exist_ok=True)

source_path = "docs/hackathondata/NEXWIN_fav & logo.png"
if os.path.exists(source_path):
    img = Image.open(source_path).convert("RGB")

    # 1. Exact resize from original image (no redrawing)
    im_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    im_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
    im_48 = img.resize((48, 48), Image.Resampling.LANCZOS)
    im_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    im_16 = img.resize((16, 16), Image.Resampling.LANCZOS)

    # Save to public/brand/logo.png
    im_512.save("public/brand/logo.png", optimize=True)

    # Next.js app icons
    im_512.save("app/icon.png", optimize=True)
    im_180.save("app/apple-icon.png", optimize=True)

    # ICO format (Next.js Turbopack requires RGBA PNGs inside ICO)
    img_rgba = img.convert("RGBA")
    im_32_rgba = img_rgba.resize((32, 32), Image.Resampling.LANCZOS)
    im_32_rgba.save("app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    im_32_rgba.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

    # 2. Transparent glow mark for dark pass backgrounds
    arr = np.array(im_512, dtype=np.float32)
    alpha = np.max(arr, axis=2) / 255.0
    smooth_alpha = np.clip((alpha - 0.02) / (1.0 - 0.02), 0.0, 1.0)
    div_alpha = np.maximum(alpha, 1e-4)[:, :, np.newaxis]
    unmultiplied = np.clip(arr / div_alpha, 0.0, 255.0)

    rgba = np.zeros((512, 512, 4), dtype=np.uint8)
    rgba[:, :, :3] = unmultiplied.astype(np.uint8)
    rgba[:, :, 3] = (smooth_alpha * 255).astype(np.uint8)
    glow_im = Image.fromarray(rgba, "RGBA")
    glow_im.save("public/brand/logo-glow.png", optimize=True)

    # 3. Clean up any redrawn SVG files
    for f in [
        "app/icon.svg",
        "public/brand/logo-simple-green.svg",
        "public/brand/logo-simple-dark.svg",
        "public/brand/logo-simple-green.png",
        "public/brand/logo-simple-dark.png",
    ]:
        if os.path.exists(f):
            os.remove(f)

    print("Brand assets and favicons generated from exact source logo!")
