/* The header menu and the Contact panel, shared by every page.

   Menu: MENU below is the one list of links. Each page's <nav aria-label="Main"> also has the same links written in
   its HTML (so the menu works without JavaScript), but this script rewrites it from MENU, so every page always shows
   the same items in the same order. To add, rename or reorder a menu item, change MENU (and, for the no-script
   copy, the pages' HTML and scripts/build_journey.py).

   Contact: the "Contact" link and the envelope icons (href="#contact") open a panel on the right with a message form.
   On wide screens the panel pushes the page left so both stay in view; on narrow screens it slides over the page.
   Visitors type their own email and a message; the form sends it through Web3Forms (web3forms.com), which emails it
   to the address the access key was made for, with the visitor's address as reply-to. The address itself never
   appears on the site. Any page + #contact opens the panel directly.
   Other scripts can open it prefilled: window.siteContact.open({ subject, message }). */
(() => {
  'use strict';

  // ---- Menu ----
  // [link, label, pages that belong under it (shown as the current section)]
  const MENU = [
    ['about.html', 'About'],
    ['index.html', 'Research', ['irrigation.html', 'human.html']],
    ['journey.html', 'My journey', ['journey-initial.html']],
    ['gallery.html', 'Gallery'],
    ['blog.html', 'Blog', [/^blog-.+\.html$/]],
    ['#contact', 'Contact']
  ];
  const page = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  const under = (rules = []) => rules.some(r => (r instanceof RegExp ? r.test(page) : r === page));
  document.querySelectorAll('nav[aria-label="Main"]').forEach(nav => {
    nav.innerHTML = MENU.map(([href, label, kids]) => {
      const cur = href === page ? ' aria-current="page"' : under(kids) ? ' data-section="current"' : '';
      return `<a href="${href}"${cur}>${label}</a>`;
    }).join('\n');
  });

  // ---- Contact panel ----
  // The Web3Forms access key for the form. It only identifies the form and is safe to publish; get one free at
  // web3forms.com (enter the email that should receive the messages, and the key arrives by email).
  const FORM_KEY = '';
  const ENDPOINT = 'https://api.web3forms.com/submit';
  const ICONS = 'assets/icons.svg?v=2626736ae0';
  const PROFILES = [
    ['Google Scholar', 'https://scholar.google.com/citations?user=RsLEzG0AAAAJ&hl=en', 'i-scholar'],
    ['ResearchGate', 'https://www.researchgate.net/profile/Ehsan-Jalilvand', 'i-researchgate'],
    ['GitHub', 'https://github.com/ejalilva', 'i-github'],
    ['LinkedIn', 'https://www.linkedin.com/in/ehsan-jalilvand-1699534a/', 'i-linkedin'],
    ['YouTube', 'https://www.youtube.com/channel/UC6SyjY2pXoI0UK1tfY7uxcw', 'i-youtube']
  ];
  const LINKEDIN = PROFILES[3][1];
  const isTrigger = a => !!a && !a.closest('.cp') && /(^|\.html)#contact$/.test(a.getAttribute('href') || '');

  const panel = document.createElement('aside');
  panel.className = 'cp';
  panel.id = 'contact-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'cp-title');
  panel.innerHTML = `
    <div class="cp-head">
      <img class="cp-ej" src="assets/ej-64.png?v=5f8a71e437" alt="" width="40" height="40">
      <div><h2 id="cp-title">Get in touch</h2></div>
      <button type="button" class="cp-close" aria-label="Close contact panel">×</button>
    </div>
    <p class="cp-lead">For collaborations, talks, or questions about my papers, data and code, send me a message here and I’ll reply by email.</p>
    <form class="cp-form" id="cp-form" novalidate>
      <label class="cp-field"><span>Your name</span><input name="name" type="text" autocomplete="name" maxlength="120"></label>
      <label class="cp-field"><span>Your email <em>(required, so I can reply)</em></span><input name="email" type="email" autocomplete="email" required maxlength="200"></label>
      <label class="cp-field"><span>Subject</span><input name="subject" type="text" maxlength="200"></label>
      <label class="cp-field"><span>Message <em>(required)</em></span><textarea name="message" rows="6" required maxlength="5000"></textarea></label>
      <label class="cp-trap" aria-hidden="true">Leave this empty<input name="website" type="text" tabindex="-1" autocomplete="off"></label>
      <div class="cp-send"><button type="submit" class="cp-btn cp-primary">Send message</button><p class="cp-status" role="status" aria-live="polite"></p></div>
      <p class="cp-privacy">Your email is used only to reply to you.</p>
    </form>
    <div class="cp-done" hidden><p class="cp-done-title">Thank you, your message is on its way.</p><p class="cp-done-copy"></p><button type="button" class="cp-btn cp-again">Write another message</button></div>
    <h3 class="cp-h">Elsewhere</h3>
    <ul class="cp-links">${PROFILES.map(([name, url, icon]) =>
      `<li><a href="${url}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="${ICONS}#${icon}"/></svg><span>${name}</span><span class="cp-out" aria-hidden="true">↗</span></a></li>`).join('')}</ul>`;
  const shade = document.createElement('div');
  shade.className = 'cp-shade';
  document.body.append(shade, panel);

  const form = panel.querySelector('.cp-form'), status = panel.querySelector('.cp-status'), send = form.querySelector('[type="submit"]');
  const done = panel.querySelector('.cp-done');
  const html = document.documentElement;
  const wide = matchMedia('(min-width: 1000px)');
  let opener = null, inerted = [];
  const isOpen = () => panel.classList.contains('open');
  const setInert = on => {
    inerted.forEach(el => { el.inert = false; });
    inerted = on ? [...document.body.children].filter(el => el !== panel && el !== shade && !el.inert) : [];
    inerted.forEach(el => { el.inert = true; });
  };
  const open = (from, fill) => {
    opener = from || document.activeElement;
    if (fill) {
      if (!done.hidden) reset();
      if (fill.subject) form.elements.subject.value = fill.subject;
      if (fill.message) form.elements.message.value = fill.message;
    }
    panel.classList.add('open');
    html.classList.add(wide.matches ? 'cp-push' : 'cp-over');
    if (!wide.matches) setInert(true);
    const first = done.hidden ? form.elements[fill ? 'email' : 'name'] : panel.querySelector('.cp-close');
    setTimeout(() => first.focus({ preventScroll: true }), 320);
  };
  const close = () => {
    if (!isOpen()) return;
    panel.classList.remove('open');
    html.classList.remove('cp-push', 'cp-over');
    setInert(false);
    if (location.hash === '#contact') history.replaceState(null, '', location.pathname + location.search);
    opener?.focus?.({ preventScroll: true });
  };
  const say = (text, kind) => { status.textContent = text; status.dataset.kind = kind || ''; };
  const reset = () => { form.reset(); say(''); done.hidden = true; form.hidden = false; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = form.elements;
    [f.email, f.message].forEach(el => el.removeAttribute('aria-invalid'));
    const email = f.email.value.trim(), message = f.message.value.trim();
    if (!email || !f.email.checkValidity()) { f.email.setAttribute('aria-invalid', 'true'); f.email.focus(); say('Please enter your email address, so I can reply.', 'error'); return; }
    if (!message) { f.message.setAttribute('aria-invalid', 'true'); f.message.focus(); say('Please write a message.', 'error'); return; }
    if (f.website.value) { form.hidden = true; done.hidden = false; return; } // filled only by spam bots
    if (!FORM_KEY) { say('Sorry, the form isn’t connected yet. Please message me on LinkedIn for now.', 'error'); return; }
    const name = f.name.value.trim(), subject = f.subject.value.trim();
    send.disabled = true; say('Sending…');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: FORM_KEY,
          subject: `Website message${subject ? ': ' + subject : ''}${name ? ' (from ' + name + ')' : ''}`,
          from_name: 'Website contact form',
          name: name || '(no name given)', email, message,
          page: location.href
        })
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || out.success === false) throw new Error(out.message || 'HTTP ' + res.status);
      panel.querySelector('.cp-done-copy').textContent = `I’ll reply to ${email}.`;
      form.hidden = true; done.hidden = false; say('');
      panel.querySelector('.cp-again').focus({ preventScroll: true });
      form.reset();
    } catch (err) {
      say('Sorry, the message couldn’t be sent. Please try again in a moment, or message me on LinkedIn.', 'error');
    } finally { send.disabled = false; }
  });
  panel.querySelector('.cp-again').addEventListener('click', () => { reset(); form.elements.name.focus(); });
  form.addEventListener('input', e => { e.target.removeAttribute?.('aria-invalid'); if (status.dataset.kind === 'error') say(''); });

  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (isTrigger(a) && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      isOpen() ? close() : open(a);
    }
  });
  panel.querySelector('.cp-close').addEventListener('click', close);
  shade.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) close(); });
  wide.addEventListener('change', () => { if (isOpen()) close(); });
  if (location.hash === '#contact') open();
  window.addEventListener('hashchange', () => { if (location.hash === '#contact') open(); });
  window.siteContact = { open: fill => open(document.activeElement, fill || {}), linkedin: LINKEDIN };
})();
