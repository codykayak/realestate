/**
 * Minimal markdown → HTML for developer docs (no external dep).
 * Escapes HTML first, then applies safe transforms.
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderMarkdown(md) {
  let html = escapeHtml(md);

  // fenced code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) => `<pre><code>${code.trim()}</code></pre>`);

  // inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // tables (simple)
  const lines = html.split('\n');
  const out = [];
  let inTable = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('|') && line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true;
        out.push('<table>');
      }
      if (/^\|[\s\-:|]+\|$/.test(line.trim())) continue;
      const cells = line.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      const tag = inTable && out[out.length - 1] === '<table>' ? 'th' : 'td';
      if (out[out.length - 1] === '<table>') {
        out.push('<tr>' + cells.map((c) => `<th>${c.trim()}</th>`).join('') + '</tr>');
      } else {
        out.push('<tr>' + cells.map((c) => `<td>${c.trim()}</td>`).join('') + '</tr>');
      }
    } else {
      if (inTable) {
        out.push('</table>');
        inTable = false;
      }
      if (line.trim() === '---') out.push('<hr />');
      else if (line.trim()) out.push(`<p>${line}</p>`);
    }
  }
  if (inTable) out.push('</table>');
  html = out.join('\n');

  // lists (basic)
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]+?<\/li>)/g, (m) => {
    if (m.includes('<ul>')) return m;
    return `<ul>${m}</ul>`;
  });

  return html;
}
