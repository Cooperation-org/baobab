// <lt-claims> — recent LinkedTrust claims, filtered, refreshed on a timer.
//
//   <script src="https://demos.linkedtrust.us/baobab/components/lt-claims.js" defer></script>
//   <lt-claims data-up="https://live.linkedtrust.us" data-query="levelup" data-limit="5"></lt-claims>
//
// Attributes (all optional except data-up):
//   data-up       the LinkedTrust server
//   data-query    text to match in subject, statement, object, source, aspect
//   data-filter   ratings | credentials
//   data-subject  claims about exactly this URI           } any of these three switches
//   data-claim    claim type, e.g. ENDORSES, rated         } to the exact-match endpoint
//   data-issuer   issuer id, e.g. https://example.org      }
//   data-limit    how many (default 10)
//   data-refresh  seconds between checks (default 60; 0 = never)
//
// Reads GET /api/feed, or GET /api/claim for exact matches. Both are public. New claims
// appear on the next check (LinkedTrust does not push). Nothing to show: hidden.
// Vanilla JS, no shadow DOM, textContent only (baobab CONTRACT.md section 2).

(function () {
  'use strict';
  if (customElements.get('lt-claims')) return;

  function ensureStyles() {
    if (document.getElementById('lt-claims-styles')) return;
    var s = document.createElement('style');
    s.id = 'lt-claims-styles';
    s.textContent = [
      'lt-claims { display: block; }',
      'lt-claims ul { list-style: none; margin: 0; padding: 0; }',
      'lt-claims li { padding: 8px 0; border-top: 1px solid var(--theme-border, #e6e1d8); }',
      'lt-claims li:first-child { border-top: 0; }',
      'lt-claims .lt-head { display: flex; gap: 8px; align-items: baseline; }',
      'lt-claims .lt-subject { font-weight: 600; color: var(--theme-ink, #26221c); text-decoration: none; }',
      'lt-claims .lt-verb { color: var(--theme-muted, #8a8378); font-size: 12px; }',
      'lt-claims .lt-date { margin-left: auto; color: var(--theme-muted, #8a8378); font-size: 12px; white-space: nowrap; text-decoration: none; }',
      'lt-claims .lt-statement { margin: 2px 0 0; color: var(--theme-ink-2, #5d574d); overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }',
    ].join('\n');
    document.head.appendChild(s);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function safeUrl(u) {
    return typeof u === 'string' && /^https?:\/\//i.test(u) ? u : null;
  }

  // Both endpoints, one shape: {id, subjectUri, subjectName, claim, statement, date}.
  function fromFeed(e) {
    var s = e.subject || {};
    return { id: e.id, subjectUri: s.uri, subjectName: s.name || s.uri, claim: e.claim,
             statement: e.statement, date: e.effectiveDate };
  }
  function fromClaim(c) {
    return { id: c.claim_id || c.claimId, subjectUri: c.subject, subjectName: c.subject, claim: c.claim,
             statement: c.statement, date: c.effective_date || c.created_at };
  }

  class LtClaims extends HTMLElement {
    connectedCallback() {
      if (this._timer !== undefined) return;
      ensureStyles();
      this.up = (this.dataset.up || '').replace(/\/+$/, '');
      if (!this.up) { this.hidden = true; return; }
      this.load();
      var every = parseInt(this.dataset.refresh || '60', 10);
      var self = this;
      this._timer = every > 0 ? setInterval(function () { if (!document.hidden) self.load(); }, every * 1000) : null;
    }

    disconnectedCallback() {
      if (this._timer) clearInterval(this._timer);
      this._timer = undefined;
    }

    url() {
      var d = this.dataset, q = new URLSearchParams();
      q.set('limit', d.limit || '10');
      if (d.subject || d.claim || d.issuer) {
        if (d.subject) q.set('subject', d.subject);
        if (d.claim) q.set('claim', d.claim);
        if (d.issuer) q.set('issuer_id', d.issuer);
        return { href: this.up + '/api/claim?' + q, pick: function (j) { return (j.claims || []).map(fromClaim); } };
      }
      if (d.query) q.set('query', d.query);
      if (d.filter) q.set('filter', d.filter);
      return { href: this.up + '/api/feed?' + q, pick: function (j) { return (j.entries || []).map(fromFeed); } };
    }

    load() {
      var self = this, src = this.url();
      fetch(src.href)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) { self.render(src.pick(j)); })
        .catch(function () { if (!self.querySelector('li')) self.hidden = true; });
    }

    render(rows) {
      if (!rows.length) { this.hidden = true; return; }
      var up = this.up;
      var list = el('ul');
      rows.forEach(function (r) {
        var li = el('li');
        var head = el('div', 'lt-head');
        var subjectHref = safeUrl(r.subjectUri);
        var subject = el(subjectHref ? 'a' : 'span', 'lt-subject', r.subjectName || '');
        if (subjectHref) { subject.href = subjectHref; subject.rel = 'noopener'; }
        head.appendChild(subject);
        if (r.claim) head.appendChild(el('span', 'lt-verb', String(r.claim).toLowerCase().replace(/_/g, ' ')));
        if (r.date) {
          var when = el('a', 'lt-date', new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
          when.href = up + '/report/' + encodeURIComponent(r.id);
          when.rel = 'noopener';
          head.appendChild(when);
        }
        li.appendChild(head);
        if (r.statement) li.appendChild(el('p', 'lt-statement', r.statement));
        list.appendChild(li);
      });
      this.replaceChildren(list);
      this.hidden = false;
    }
  }

  customElements.define('lt-claims', LtClaims);
})();
