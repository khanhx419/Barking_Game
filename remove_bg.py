"""
Background removal script for Barking Battle dog PNGs.
Uses rembg (U2-Net) for semantic segmentation, then tight-crops the result.
Processes all PNGs in both images/ and client/public/images/.
"""

import os
import sys
from pathlib import Path
from PIL import Image
from rembg import remove

def process_image(input_path, output_path):
    """Remove background, refine alpha, and tight-crop a single image."""
    print(f"  Processing: {input_path}")
    
    with open(input_path, "rb") as f:
        input_data = f.read()
    
    # rembg remove: returns RGBA PNG bytes with background removed
    # alpha_matting=True enables refined edge matting (no white halo)
    output_data = remove(
        input_data,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )
    
    # Open the result
    img = Image.open(__import__("io").BytesIO(output_data)).convert("RGBA")
    
    # Tight crop: find the bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        # Add a tiny 4px padding
        left, top, right, bottom = bbox
        pad = 4
        left = max(0, left - pad)
        top = max(0, top - pad)
        right = min(img.width, right + pad)
        bottom = min(img.height, bottom + pad)
        img = img.crop((left, top, right, bottom))
    
    # Save
    img.save(output_path, "PNG", optimize=True)
    print(f"    -> Saved: {output_path} ({img.width}x{img.height})")

def main():
    base_dir = Path(__file__).parent
    
    # Source images directory
    source_dir = base_dir / "images"
    # Destination (Vite public)
    dest_dir = base_dir / "client" / "public" / "images"
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    # File mapping: source filename -> lowercase destination filename
    file_map = {
        "Shiba_left.png":    "shiba_left.png",
        "Shiba_right.png":   "shiba_right.png",
        "Bulldog_left.png":  "bulldog_left.png",
        "Bulldog_right.png": "bulldog_right.png",
        "Husky_left.png":    "husky_left.png",
        "Husky_right.png":   "husky_right.png",
        "Corghi left.png":   "corgi_left.png",
        "Corgi_right.png":   "corgi_right.png",
        "Poodle_left.png":   "poodle_left.png",
        "Poodle_right.png":  "poodle_right.png",
    }
    
    print(f"\n{'='*60}")
    print("Barking Battle — Dog Background Removal")
    print(f"{'='*60}")
    print(f"Source: {source_dir}")
    print(f"Output: {dest_dir}")
    print(f"Files:  {len(file_map)}\n")
    
    processed = 0
    for src_name, dst_name in file_map.items():
        src_path = source_dir / src_name
        dst_path = dest_dir / dst_name
        
        if not src_path.exists():
            print(f"  SKIP (not found): {src_name}")
            continue
        
        try:
            process_image(str(src_path), str(dst_path))
            processed += 1
        except Exception as e:
            print(f"  ERROR processing {src_name}: {e}")
    
    print(f"\n{'='*60}")
    print(f"Done! Processed {processed}/{len(file_map)} images.")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
