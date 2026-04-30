// Tiny CSV parser sufficient for the simulation (handles simple quoted fields).
export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const splitLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') { inQ = false; }
        else cur += ch;
      } else {
        if (ch === ',') { out.push(cur); cur = ''; }
        else if (ch === '"') { inQ = true; }
        else cur += ch;
      }
    }
    out.push(cur);
    return out.map(s => s.trim());
  };

  const headers = splitLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const cells = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    return row;
  });
  return { headers, rows };
}

export function extractDomain(value: string): string {
  if (!value) return '';
  let v = value.trim().toLowerCase();
  v = v.replace(/^https?:\/\//, '').replace(/^www\./, '');
  v = v.split('/')[0];
  return v;
}

export function downloadTemplate(filename: string, columns: string[]) {
  const blob = new Blob([columns.join(',') + '\n'], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
