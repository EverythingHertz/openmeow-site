#!/usr/bin/env bash
# Mirror all teaser media out of the third-party CloudFront bucket into ./media/.
#
# Why: every video and still on openmeow.io currently loads from a Higgsfield
# user-content bucket we do not control. If its retention policy changes, the
# homepage goes black. Run this from the repo root on a machine with open
# egress, review the total size, commit the media/ directory (or upload it to
# your own bucket), then set `cdnBase: 'media/'` in the OPENMEOW config block
# at the top of index.html.
#
# GitHub Pages serves files up to 100MB each; if the total is uncomfortably
# large for the repo, put media/ on Cloudflare R2 or Bunny and set cdnBase to
# that URL instead.

set -euo pipefail

CDN="https://d8j0ntlcm91z4.cloudfront.net/user_3DlCVdjo8RXELA5Sxeob2Uxh8GX"
OUT="media"
mkdir -p "$OUT"

FILES=(
  # IMGS
  hf_20260519_204356_76115971-1cc1-4a4e-b6a3-70a63bf058d9_min.webp
  hf_20260715_042856_3ef1ae40-fb2d-4046-ab4f-42f909180bfd_min.webp
  # VIDS (landscape)
  hf_20260715_060008_237283a7-2399-405f-9042-4684859f77db.mp4
  hf_20260715_060010_6fa2372c-ff19-406f-923a-afe400edf2f5.mp4
  hf_20260715_052639_f9ff5220-3aec-4459-be97-20792ed2e891.mp4
  hf_20260715_052642_30566d21-b19e-445e-b8e0-7859385e22c7.mp4
  hf_20260715_051809_b9be0f73-0c86-423b-9221-6271a645e796.mp4
  hf_20260715_051816_1fa564f5-8d78-45ca-afbe-a41d450f4c7d.mp4
  hf_20260715_051813_7ff1175e-e6ec-4bd1-9f88-66d7df9e48fe.mp4
  # VIDS_P (portrait)
  hf_20260715_163114_70ccdee8-c679-4eb9-a123-a7739b1105b4.mp4
  hf_20260715_155619_68cf50d0-a057-4f5f-a116-c25cedb3c90d.mp4
  hf_20260715_163308_65b22dc3-5de0-41a1-aa9f-02919eb6cd19.mp4
  hf_20260715_163325_d8396a90-6438-4415-811e-e9bc6fe0cce5.mp4
  hf_20260715_164927_e8a0adfc-d474-426a-9ecf-2d1c2e4bf087.mp4
  hf_20260715_165810_c3af5a21-fce5-422a-ac5c-0cd7cbab395c.mp4
  # ZOOMS
  hf_20260715_051800_8efda7ef-fea4-4b73-ab7f-8b7d05e5801f_min.webp
  hf_20260715_051805_de5a9386-1fe0-47d9-ab94-784f0ded5cfe_min.webp
  hf_20260715_043327_1a46b86a-442d-4d7f-b692-1a3e4502fd34_min.webp
  hf_20260715_043340_992b6a20-61fa-4828-887a-9a09c868d964_min.webp
  hf_20260715_043336_83283dde-d603-4f46-a70e-da62819c3675_min.webp
)

fail=0
for f in "${FILES[@]}"; do
  if [ -s "$OUT/$f" ]; then
    echo "skip (exists)  $f"
    continue
  fi
  echo "fetching       $f"
  if ! curl -fSL --retry 3 -o "$OUT/$f" "$CDN/$f"; then
    echo "FAILED         $f" >&2
    fail=1
  fi
done

echo
echo "Total mirrored size:"
du -sh "$OUT"
echo
if [ "$fail" -ne 0 ]; then
  echo "Some files failed to download. Re-run the script; already-fetched files are skipped." >&2
  exit 1
fi
echo "Done. Next: set cdnBase: 'media/' in the OPENMEOW config in index.html, commit, deploy."
