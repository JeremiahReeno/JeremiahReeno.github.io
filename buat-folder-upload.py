"""Tambah favicon, cek semua link lokal, lalu salin file yang dibutuhkan ke folder siap-upload (+ zip)."""
import os, re, shutil, glob, zipfile
SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(SRC, 'siap-upload')
os.chdir(SRC)

pages = sorted(glob.glob('*.html'))

# 1. Favicon di semua halaman
for p in pages:
    s = open(p, encoding='utf-8').read()
    if 'rel="icon"' not in s:
        s = s.replace('<meta name="theme-color"', '<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">\n<meta name="theme-color"', 1)
        open(p, 'w', encoding='utf-8').write(s)

# 2. Kumpulkan semua file lokal yang dirujuk (src/href/data-src/data-fallback), cek keberadaannya
used, missing = set(), []
for p in pages:
    s = open(p, encoding='utf-8').read()
    s_nocomment = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    for ref in re.findall(r'(?:src|href|data-fallback|download)="([^"]+)"', s_nocomment):
        if re.match(r'(https?:|mailto:|tel:|#|data:)', ref) or ref.startswith('CV-'):
            continue
        path = ref.split('#')[0].split('?')[0]
        if not path:
            continue
        if os.path.exists(path):
            used.add(os.path.normpath(path))
        else:
            missing.append((p, ref))
# File yang tidak dirujuk sebagai link lokal tapi tetap wajib ikut
for extra in ['robots.txt', 'sitemap.xml', 'assets/og-image.jpg']:
    if os.path.exists(extra):
        used.add(os.path.normpath(extra))
    else:
        missing.append(('wajib', extra))
print('Halaman:', len(pages))
print('File lokal dirujuk:', len(used))
print('RUSAK:', missing or 'tidak ada')

# 3. Salin ke siap-upload: halaman + semua file yang dirujuk
if os.path.exists(OUT):
    shutil.rmtree(OUT)
for f in pages + sorted(used):
    dst = os.path.join(OUT, f)
    os.makedirs(os.path.dirname(dst) or OUT, exist_ok=True)
    shutil.copy2(f, dst)

# 4. Zip (untuk hosting yang minta file .zip)
zp = os.path.join(SRC, 'portofolio-siap-upload.zip')
if os.path.exists(zp):
    os.remove(zp)
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(OUT):
        for fn in files:
            full = os.path.join(root, fn)
            z.write(full, os.path.relpath(full, OUT))

total = 0
for root, _, files in os.walk(OUT):
    for fn in files:
        full = os.path.join(root, fn)
        total += os.path.getsize(full)
        print(f'{os.path.getsize(full):>8}  {os.path.relpath(full, OUT)}')
print(f'TOTAL {total/1024/1024:.2f} MB, zip {os.path.getsize(zp)/1024/1024:.2f} MB')
skipped = [f for f in ['assets/bug.png', 'CV Jeremiah  IT.jpg', 'foto jeremiah.jpg.jpeg', 'README.md'] if os.path.exists(os.path.join(OUT, f))]
print('File tak perlu yang ikut:', skipped or 'tidak ada')
