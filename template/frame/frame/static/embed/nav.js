// <baobab-nav> — the frame's bar, mounted on the frame's pages and on any frond
// that sets NAV_SRC to this file (CONTRACT.md section 6).
//
//   <script src="https://frame.example/static/embed/nav.js" defer></script>
//   <baobab-nav data-up="https://frame.example"></baobab-nav>
//
// Its places come from the frame (GET <data-up>/api/nav/), filtered there for the
// person looking. No hostname is built here. Signed out: the site name and
// "Sign in". Quiet failure: if the frame does not answer, the bar shows nothing.
// Vanilla JS, no shadow DOM, textContent-only writes. Restyle from the host page
// with `baobab-nav .bn-bar`, `baobab-nav a`, `baobab-nav a[aria-current="page"]`.

(function () {
  'use strict';
  if (window.customElements && customElements.get('baobab-nav')) return;

  function ensureStyles() {
    if (document.getElementById('baobab-nav-styles')) return;
    var s = document.createElement('style');
    s.id = 'baobab-nav-styles';
    s.textContent = [
      'baobab-nav { display: block; min-height: 40px; background: var(--bb-surface, #fffefb); border-bottom: 1px solid var(--bb-border, #e6e1d8); font: 13px/1 var(--bb-font-body, system-ui, sans-serif); }',
      'baobab-nav .bn-bar { display: flex; align-items: center; gap: 2px; height: 40px; padding: 0 12px; overflow-x: auto; scrollbar-width: none; }',
      'baobab-nav .bn-bar::-webkit-scrollbar { display: none; }',
      'baobab-nav a { color: var(--bb-ink-2, #5d574d); text-decoration: none; padding: 6px 10px; border-radius: 6px; white-space: nowrap; }',
      'baobab-nav a:hover { color: var(--bb-ink, #26221c); background: rgba(127,127,127,0.1); }',
      'baobab-nav a[aria-current="page"] { color: var(--bb-ink, #26221c); font-weight: 600; }',
      'baobab-nav .bn-site { font-weight: 650; color: var(--bb-ink, #26221c); padding-left: 0; }',
      'baobab-nav .bn-spacer { flex: 1; }',
      'baobab-nav .bn-me { color: var(--bb-muted, #8a8378); padding: 6px 4px; white-space: nowrap; }',
    ].join('\n');
    document.head.appendChild(s);
  }

  function link(href, text, cls) {
    var a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    if (cls) a.className = cls;
    return a;
  }

  function isHere(href) {
    try {
      var u = new URL(href, location.href);
      return u.origin === location.origin && location.pathname.indexOf(u.pathname) === 0 && u.pathname !== '/';
    } catch (e) { return false; }
  }

  class BaobabNav extends HTMLElement {
    connectedCallback() {
      if (this._started) return;
      this._started = true;
      ensureStyles();
      var up = (this.dataset.up || '').replace(/\/$/, '');
      var self = this;
      if (!up) return;
      fetch(up + '/api/nav/', { credentials: 'include' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (nav) { self.render(nav); })
        .catch(function () {});
    }

    render(nav) {
      var bar = document.createElement('nav');
      bar.className = 'bn-bar';
      bar.setAttribute('aria-label', nav.site.name);
      bar.appendChild(link(nav.site.url, nav.site.name, 'bn-site'));
      (nav.places || []).forEach(function (p) {
        var a = link(p.url, p.label);
        if (isHere(p.url)) a.setAttribute('aria-current', 'page');
        bar.appendChild(a);
      });
      var spacer = document.createElement('span');
      spacer.className = 'bn-spacer';
      bar.appendChild(spacer);
      if (nav.me) {
        var me = document.createElement('span');
        me.className = 'bn-me';
        me.textContent = nav.me.name;
        bar.appendChild(me);
      } else {
        bar.appendChild(link(nav.login_url + '?next=' + encodeURIComponent(location.href), 'Sign in'));
      }
      this.textContent = '';
      this.appendChild(bar);
    }
  }

  customElements.define('baobab-nav', BaobabNav);
})();
