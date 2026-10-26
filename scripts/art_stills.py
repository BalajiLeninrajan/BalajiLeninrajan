# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=11", "playwright>=1.50"]
# ///
"""Renders the project card stills in img/sites/ from the scenes in art/.

Each card shows img/sites/<name>.webp, which this script draws from
art/<name>.html: the first frame of the scene's hover animation, which
scene.js holds once the fonts are in, at 960x600.

    uv run scripts/art_stills.py            # all scenes
    uv run scripts/art_stills.py salt       # just one

It uses the system Chromium; point CHROMIUM at another binary if needed.
"""

import io
import os
import shutil
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SCENES = ROOT / "art"
OUT = ROOT / "img" / "sites"


def browser_path():
    return os.environ.get("CHROMIUM") or shutil.which("chromium-browser") or shutil.which("chromium")


def render(browser, name):
    page = browser.new_page(viewport={"width": 320, "height": 200}, device_scale_factor=3)
    page.goto((SCENES / f"{name}.html").as_uri(), wait_until="networkidle")
    page.wait_for_function("window.sceneReady")
    Image.open(io.BytesIO(page.screenshot())).save(OUT / f"{name}.webp", quality=90, method=6)
    page.close()
    print(name)


if __name__ == "__main__":
    names = sys.argv[1:] or sorted(p.stem for p in SCENES.glob("*.html"))
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=browser_path())
        for name in names:
            render(browser, name)
        browser.close()
