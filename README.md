# Portofolio Jeremiah Reeno

Website portofolio statis (HTML + CSS + JS, tanpa build). Online di https://jeremiah10935.github.io

## Isi folder
- `index.html`: beranda (tentang, keahlian, riwayat, amplop proyek & sertifikat, kontak) + tag SEO
- `projects.html`, `certificates.html`: isi amplop
- `project-*.html`: halaman detail tiap proyek
- `style.css`: tampilan. Warna tema gelap/terang diatur di `:root` dan `:root[data-theme="light"]`
- `script.js`: animasi (GSAP, Lenis), menu HP, popup, tombol tema
- `i18n.js`: tombol bahasa ID / EN. Teks Inggris ditulis di atribut `data-en` tiap elemen
- `assets/`: foto, CV, screenshot proyek, `sertifikat/`, logo `tools/`, `og-image.jpg` (gambar pratinjau link)
- `robots.txt`, `sitemap.xml`: untuk Google
- `buat-folder-upload.py`: membuat folder `siap-upload/` berisi file situs saja (untuk upload manual)

## Menambah konten
- **Pengalaman**: di `#journey` pada `index.html`, salin satu `<li class="tl-item">`. Tambah class `now` kalau masih berjalan (titiknya berdenyut).
- **Proyek**: salin salah satu `project-*.html`, lalu tambah kartunya di `projects.html` dan di `sitemap.xml`.
- **Sertifikat**: taruh PDF + gambar `.jpg` di `assets/sertifikat/`, lalu salin satu kartu di `certificates.html`.
- Setiap teks baru: tulis versi Inggrisnya di atribut `data-en="..."`.

## Jalankan di laptop
Lewat Laragon: http://localhost/Portofolio

## Update situs online
Situs di-hosting GitHub Pages dari repo `jeremiah10935.github.io` (branch `main`, folder root).
Cukup `git add .`, `git commit -m "pesan"`, `git push`. GitHub meng-update situs dalam 1-2 menit.
