/* Ganti bahasa ID / EN.
   Teks Indonesia ditulis langsung di HTML (default, terbaca Google).
   Versi Inggris ditaruh di atribut elemen yang sama:
     data-en="..."          -> isi elemen (boleh berisi tag, tulis atribut tanpa tanda kutip: <span class=muted>)
     data-en-alt="..."      -> atribut alt
     data-en-aria-label=".."-> atribut aria-label
     data-en-content="..."  -> atribut content (meta)
     data-en-title="..."    -> atribut title
   Pilihan bahasa disimpan di localStorage, jadi tetap sama saat pindah halaman. */
(() => {
  const KEY = 'lang';
  const root = document.documentElement;
  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const save = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };

  // Simpan teks asli (Indonesia) sekali, sebelum ada yang diganti
  const items = [];
  document.querySelectorAll('*').forEach(el => {
    const attrs = [...el.attributes].filter(a => a.name === 'data-en' || a.name.startsWith('data-en-'));
    if (!attrs.length) return;
    const item = { el, html: null, attrs: [] };
    attrs.forEach(a => {
      if (a.name === 'data-en') item.html = { id: el.innerHTML, en: a.value };
      else {
        const name = a.name.slice(8);
        item.attrs.push({ name, id: el.getAttribute(name), en: a.value });
      }
    });
    items.push(item);
  });

  const buttons = [...document.querySelectorAll('[data-lang]')];

  const apply = lang => {
    items.forEach(({ el, html, attrs }) => {
      if (html) el.innerHTML = html[lang];
      attrs.forEach(a => { if (a[lang] !== null) el.setAttribute(a.name, a[lang]); });
    });
    root.lang = lang;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  };

  buttons.forEach(b => b.addEventListener('click', () => {
    const lang = b.dataset.lang;
    if (root.lang === lang) return;
    save(lang);
    apply(lang);
  }));

  apply(read() === 'en' ? 'en' : 'id');
})();
