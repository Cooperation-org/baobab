// <atproto-feed> — the latest posts from one Bluesky account, refreshed on a timer.
//
//   <script src="https://demos.linkedtrust.us/baobab/components/atproto-feed.js" defer></script>
//   <atproto-feed data-up="https://public.api.bsky.app" data-actor="linkedtrust.us"></atproto-feed>
//
// Attributes:
//   data-up       an AT Proto app view (Bluesky's public one works; no sign-in needed)
//   data-actor    handle or DID
//   data-limit    how many (default 5)
//   data-replies  include the account's replies: "yes" (default: posts only)
//   data-refresh  seconds between checks (default 120; 0 = never)
//
// Each post links to itself on Bluesky. Nothing to show: hidden.
// Vanilla JS, no shadow DOM, textContent only.

(function () {
  'use strict';
  if (customElements.get('atproto-feed')) return;

  function ensureStyles() {
    if (document.getElementById('atproto-feed-styles')) return;
    var s = document.createElement('style');
    s.id = 'atproto-feed-styles';
    s.textContent = [
      'atproto-feed { display: block; }',
      'atproto-feed ul { list-style: none; margin: 0; padding: 0; }',
      'atproto-feed li { padding: 8px 0; border-top: 1px solid var(--bb-border, #e6e1d8); }',
      'atproto-feed li:first-child { border-top: 0; }',
      'atproto-feed .af-text { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--bb-ink, #26221c); }',
      'atproto-feed .af-date { font-size: 12px; color: var(--bb-muted, #8a8378); text-decoration: none; }',
    ].join('\n');
    document.head.appendChild(s);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  class AtprotoFeed extends HTMLElement {
    connectedCallback() {
      if (this._timer !== undefined) return;
      ensureStyles();
      this.up = (this.dataset.up || '').replace(/\/+$/, '');
      if (!this.up || !this.dataset.actor) { this.hidden = true; return; }
      this.load();
      var every = parseInt(this.dataset.refresh || '120', 10), self = this;
      this._timer = every > 0 ? setInterval(function () { if (!document.hidden) self.load(); }, every * 1000) : null;
    }

    disconnectedCallback() {
      if (this._timer) clearInterval(this._timer);
      this._timer = undefined;
    }

    load() {
      var self = this;
      var q = new URLSearchParams({
        actor: this.dataset.actor,
        limit: this.dataset.limit || '5',
        filter: this.dataset.replies === 'yes' ? 'posts_with_replies' : 'posts_no_replies',
      });
      fetch(this.up + '/xrpc/app.bsky.feed.getAuthorFeed?' + q)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) { self.render(j.feed || []); })
        .catch(function () { if (!self.querySelector('li')) self.hidden = true; });
    }

    render(feed) {
      var posts = feed.map(function (f) { return f.post; }).filter(function (p) { return p && p.record; });
      if (!posts.length) { this.hidden = true; return; }
      var ul = el('ul');
      posts.forEach(function (p) {
        var li = el('li');
        li.appendChild(el('p', 'af-text', p.record.text || ''));
        var m = /^at:\/\/([^/]+)\/app\.bsky\.feed\.post\/([^/]+)$/.exec(p.uri);
        if (m) {
          var when = el('a', 'af-date', new Date(p.record.createdAt || p.indexedAt)
            .toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
          when.href = 'https://bsky.app/profile/' + encodeURIComponent((p.author && p.author.handle) || m[1]) + '/post/' + m[2];
          when.target = '_blank';
          when.rel = 'noopener';
          li.appendChild(when);
        }
        ul.appendChild(li);
      });
      this.replaceChildren(ul);
      this.hidden = false;
    }
  }

  customElements.define('atproto-feed', AtprotoFeed);
})();
