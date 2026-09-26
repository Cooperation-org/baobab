// <atproto-thread> — the replies to one Bluesky post, as comments on your page.
//
//   <script src="https://demos.linkedtrust.us/baobab/components/atproto-thread.js" defer></script>
//   <atproto-thread data-up="https://public.api.bsky.app"
//                   data-post="https://bsky.app/profile/linkedtrust.us/post/3kxyz"></atproto-thread>
//
// Attributes:
//   data-up       an AT Proto app view (Bluesky's public one works; no sign-in needed to read)
//   data-post     the post: a bsky.app link, or an at:// URI
//   data-depth    reply levels shown (default 3)
//   data-refresh  seconds between checks (default 60; 0 = never)
//   data-reply    "yes" shows "Reply on Bluesky". Set it only for a viewer who can reply:
//                 one signed in with Bluesky (LinkedTrust sign-in can be a Bluesky login).
//                 The host page knows who is looking; this card does not. Default: read only.
//
// Replies appear here on the next check. Nothing is stored anywhere but Bluesky, so no
// backend. No replies and no reply link, or the post cannot be found: hidden.
// Vanilla JS, no shadow DOM, textContent only.

(function () {
  'use strict';
  if (customElements.get('atproto-thread')) return;

  function ensureStyles() {
    if (document.getElementById('atproto-thread-styles')) return;
    var s = document.createElement('style');
    s.id = 'atproto-thread-styles';
    s.textContent = [
      'atproto-thread { display: block; }',
      'atproto-thread ol { list-style: none; margin: 0; padding: 0; }',
      'atproto-thread ol ol { margin-left: 18px; padding-left: 12px; border-left: 1px solid var(--bb-border, #e6e1d8); }',
      'atproto-thread li { padding: 8px 0; }',
      'atproto-thread .at-who { display: flex; align-items: center; gap: 8px; text-decoration: none; color: var(--bb-ink, #26221c); font-weight: 600; }',
      'atproto-thread .at-who img { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }',
      'atproto-thread .at-handle { color: var(--bb-muted, #8a8378); font-weight: 400; font-size: 12px; }',
      'atproto-thread .at-text { margin: 4px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--bb-ink-2, #5d574d); }',
      'atproto-thread .at-reply { display: inline-block; margin-top: 8px; font-size: 13px; }',
    ].join('\n');
    document.head.appendChild(s);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function webUrl(uri, handle) {
    var m = /^at:\/\/([^/]+)\/app\.bsky\.feed\.post\/([^/]+)$/.exec(uri || '');
    return m ? 'https://bsky.app/profile/' + encodeURIComponent(handle || m[1]) + '/post/' + m[2] : null;
  }

  class AtprotoThread extends HTMLElement {
    connectedCallback() {
      if (this._timer !== undefined) return;
      ensureStyles();
      this.up = (this.dataset.up || '').replace(/\/+$/, '');
      if (!this.up || !this.dataset.post) { this.hidden = true; return; }
      var self = this;
      this.resolve(this.dataset.post)
        .then(function (uri) { self.uri = uri; return self.load(); })
        .catch(function () { self.hidden = true; });
      var every = parseInt(this.dataset.refresh || '60', 10);
      this._timer = every > 0 ? setInterval(function () { if (self.uri && !document.hidden) self.load(); }, every * 1000) : null;
    }

    disconnectedCallback() {
      if (this._timer) clearInterval(this._timer);
      this._timer = undefined;
    }

    xrpc(method, params) {
      return fetch(this.up + '/xrpc/' + method + '?' + new URLSearchParams(params))
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    }

    // A bsky.app link names the author by handle; the thread API wants at://<did>/...
    resolve(post) {
      if (post.indexOf('at://') === 0) return Promise.resolve(post);
      var m = /bsky\.app\/profile\/([^/]+)\/post\/([^/?#]+)/.exec(post);
      if (!m) return Promise.reject(new Error('not a post'));
      var actor = decodeURIComponent(m[1]);
      var did = actor.indexOf('did:') === 0 ? Promise.resolve(actor)
        : this.xrpc('com.atproto.identity.resolveHandle', { handle: actor }).then(function (j) { return j.did; });
      return did.then(function (d) { return 'at://' + d + '/app.bsky.feed.post/' + m[2]; });
    }

    load() {
      var self = this;
      return this.xrpc('app.bsky.feed.getPostThread', { uri: this.uri, depth: this.dataset.depth || '3', parentHeight: '0' })
        .then(function (j) { self.render(j.thread); })
        .catch(function () { if (!self.querySelector('li, .at-reply')) self.hidden = true; });
    }

    render(thread) {
      if (!thread || !thread.post) { this.hidden = true; return; }
      var list = this.replies(thread.replies || []);
      var href = this.dataset.reply === 'yes'
        && webUrl(thread.post.uri, thread.post.author && thread.post.author.handle);
      this.replaceChildren();
      if (list) this.appendChild(list);
      if (href) {
        var reply = el('a', 'at-reply', 'Reply on Bluesky');
        reply.href = href;
        reply.target = '_blank';
        reply.rel = 'noopener';
        this.appendChild(reply);
      }
      this.hidden = !list && !href;
    }

    replies(items) {
      var shown = items.filter(function (t) { return t && t.post && t.post.record; });
      if (!shown.length) return null;
      shown.sort(function (a, b) { return String(a.post.indexedAt).localeCompare(String(b.post.indexedAt)); });
      var ol = el('ol'), self = this;
      shown.forEach(function (t) {
        var p = t.post, a = p.author || {};
        var li = el('li');
        var who = el('a', 'at-who');
        who.href = 'https://bsky.app/profile/' + encodeURIComponent(a.handle || a.did || '');
        who.target = '_blank';
        who.rel = 'noopener';
        if (a.avatar && /^https:\/\//.test(a.avatar)) {
          var img = el('img');
          img.src = a.avatar;
          img.alt = '';
          img.loading = 'lazy';
          who.appendChild(img);
        }
        who.appendChild(el('span', null, a.displayName || a.handle || ''));
        if (a.handle) who.appendChild(el('span', 'at-handle', '@' + a.handle));
        li.appendChild(who);
        li.appendChild(el('p', 'at-text', p.record.text || ''));
        var sub = self.replies(t.replies || []);
        if (sub) li.appendChild(sub);
        ol.appendChild(li);
      });
      return ol;
    }
  }

  customElements.define('atproto-thread', AtprotoThread);
})();
