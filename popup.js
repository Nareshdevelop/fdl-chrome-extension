// fivedaylaunch popup — fetches /api/audit?url={current_tab_domain}
// and renders the score + bars + top findings.

const API = 'https://fivedaylaunch.com/api/audit';
const SITE_BASE = 'https://fivedaylaunch.com/sites';

function normalizeDomain(rawUrl) {
  try {
    const u = new URL(rawUrl);
    let h = u.hostname.toLowerCase();
    if (h.startsWith('www.')) h = h.slice(4);
    return h;
  } catch (e) {
    return null;
  }
}

function gradeFor(score) {
  if (score == null) return { letter: '—', cls: '' };
  if (score >= 90) return { letter: 'A', cls: 'A' };
  if (score >= 80) return { letter: 'B', cls: 'B' };
  if (score >= 70) return { letter: 'C', cls: 'C' };
  if (score >= 60) return { letter: 'D', cls: 'D' };
  return { letter: 'F', cls: 'F' };
}

function fillColor(got, max) {
  const pct = got / max;
  if (pct >= 0.8) return '#10b981';
  if (pct >= 0.5) return '#eab308';
  return '#ef4444';
}

function escape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderError(domain, msg, opts) {
  opts = opts || {};
  const content = document.getElementById('content');
  content.innerHTML = `<div class="error">
    <div class="title">${escape(opts.title || 'Could not score this site')}</div>
    <div>${escape(msg)}</div>
    ${domain ? `<a class="secondary" href="${SITE_BASE}/${encodeURIComponent(domain)}" target="_blank">View full audit page →</a>` : ''}
  </div>`;
}

function renderAudit(domain, data) {
  const score = data.score;
  const grade = gradeFor(score);
  const findings = (data.findings || []).slice(0, 4);
  const breakdown = data.breakdown || {};

  const bars = [
    ['Performance', breakdown.performance?.score ?? 0, 25],
    ['SEO',         breakdown.seo?.score         ?? 0, 25],
    ['Mobile',      breakdown.mobile?.score      ?? 0, 20],
    ['Security',    breakdown.security?.score    ?? 0, 15],
    ['AEO',         breakdown.aeo?.score         ?? 0, 15],
  ].map(([label, got, max]) => `
    <div class="bar">
      <div>${label}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${(got/max*100).toFixed(0)}%;background:${fillColor(got, max)}"></div></div>
      <div style="text-align:right">${got}</div>
    </div>`).join('');

  const findingsHtml = findings.length === 0
    ? '<div style="font-size:12px;color:#10b981;padding:6px 0">No major issues — solid foundation.</div>'
    : `<h3>Top findings</h3><ul>${findings.map(f => `<li>${escape(f)}</li>`).join('')}</ul>`;

  document.getElementById('content').innerHTML = `
    <div class="scorecard">
      <div class="score-num">${score ?? '?'}</div>
      <div class="score-of">of 100</div>
      <div class="grade ${grade.cls}">Grade ${grade.letter}</div>
      <div class="bars">${bars}</div>
      <div class="findings">${findingsHtml}</div>
    </div>
    <a class="cta" href="${SITE_BASE}/${encodeURIComponent(domain)}" target="_blank">View full audit on fivedaylaunch.com →</a>
    <a class="secondary" href="https://fivedaylaunch.com" target="_blank">Have your site rebuilt for $799 →</a>
  `;
}

async function run() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    renderError(null, 'No active tab.');
    return;
  }
  const domain = normalizeDomain(tab.url);
  if (!domain) {
    renderError(null, 'Open a website (http/https URL) to score it.');
    return;
  }
  if (/^(chrome|edge|about|file|chrome-extension)$/.test((new URL(tab.url)).protocol.replace(':',''))) {
    renderError(null, 'Cannot score browser-internal pages.');
    return;
  }

  document.getElementById('domain').textContent = domain;

  try {
    const resp = await fetch(`${API}?url=${encodeURIComponent(domain)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!resp.ok) {
      renderError(domain, `Audit API returned HTTP ${resp.status}.`);
      return;
    }
    const data = await resp.json();
    if (data.is_blocked) {
      renderError(domain, 'This site blocks automated audits (anti-bot protection).',
        { title: 'Cannot audit' });
      return;
    }
    renderAudit(domain, data);
  } catch (e) {
    renderError(domain, e.message || 'Network error.');
  }
}

run();
