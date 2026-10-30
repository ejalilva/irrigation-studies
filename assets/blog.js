/* Blog: each post's picture (button.bl-zoom) opens larger in a dialog, with its caption. Escape, the × button or a
   click outside the picture closes it, and focus goes back to the picture. Without this script the pictures simply
   show in the list. */
(() => {
  'use strict';
  const buttons = document.querySelectorAll('.bl-zoom');
  if (!buttons.length || typeof HTMLDialogElement !== 'function') return;
  const dlg = document.createElement('dialog');
  dlg.className = 'bl-viewer';
  dlg.setAttribute('aria-label', 'Picture');
  dlg.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure><button type="button" class="bl-close" aria-label="Close">×</button>';
  document.body.append(dlg);
  const img = dlg.querySelector('img'), cap = dlg.querySelector('figcaption');
  let from = null;
  buttons.forEach(b => b.addEventListener('click', () => {
    const thumb = b.querySelector('img');
    from = b;
    img.src = b.dataset.full || thumb.currentSrc || thumb.src;
    img.alt = thumb.alt;
    cap.textContent = b.dataset.caption || '';
    cap.hidden = !cap.textContent;
    dlg.showModal();
  }));
  dlg.querySelector('.bl-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { img.removeAttribute('src'); from?.focus({ preventScroll: true }); });
})();
