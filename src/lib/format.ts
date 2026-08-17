/* أدوات تنسيق الأرقام والعناوين والملفات */

export function fmt(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function fmtUsd(n: number): string {
  return '$' + fmt(n);
}

export function shortAddr(a: string, head = 5, tail = 4): string {
  if (a.length <= head + tail + 3) return a;
  return `${a.slice(0, head)}...${a.slice(-tail)}`;
}

export function parseAmount(raw: string): number {
  const n = Number(raw.replace(/[,\s]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** تحقق بسيط من صيغ العناوين حسب الشبكة */
export function validateAddress(addr: string, network: string): boolean {
  const a = addr.trim();
  if (!a) return false;
  if (network === 'TRON') return /^T[1-9A-HJ-NP-Za-km-z]{25,40}$/.test(a);
  if (network === 'Solana') return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a);
  // EVM: ETH / BSC / Polygon / Arbitrum
  return /^0x[a-fA-F0-9]{40}$/.test(a);
}

export function addressNetworkHint(addr: string): 'TRON' | 'EVM' | 'SOLANA' | null {
  const a = addr.trim();
  if (/^T[1-9A-HJ-NP-Za-km-z]{25,40}$/.test(a)) return 'TRON';
  if (/^0x[a-fA-F0-9]{40}$/.test(a)) return 'EVM';
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a)) return 'SOLANA';
  return null;
}

export function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  fallbackCopy(text);
  return Promise.resolve();
}

function fallbackCopy(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch {
    /* ignore */
  }
  ta.remove();
}

export function downloadFile(name: string, content: string, type = 'text/plain') {
  const blob = new Blob(['\uFEFF' + content], { type: type + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

export function randHex(len: number): string {
  const chars = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}
