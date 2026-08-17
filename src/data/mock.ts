/* ============================================================
   بيانات تجريبية (Mock Data) — تحاكي حالة النظام الحقيقية
   ============================================================ */

export const WALLET = {
  address: 'TLa5xQ7mKq2AbCdEfGhIjKlMnOpQrSt',
  short: 'TLa5...7mKq',
  trx: 1250,
  tronUsd: 150,
};

export const TOKEN_BALANCE = 9_915_000;
export const TOTAL_SUPPLY = 1_010_000_000;
export const DAILY_LIMIT = 5_000_000;
export const USED_TODAY = 125_000;

export type NetworkId = 'TRON' | 'BSC' | 'ETH' | 'POLYGON' | 'SOLANA' | 'ARBITRUM';

export interface NetworkInfo {
  id: NetworkId;
  name: string;
  standard: string;
  color: string;
  speed: string;
  cost: string;
  status: 'ok' | 'slow' | 'down';
  statusLabel: string;
  block: string;
  blockTime: string;
  tps: string;
  congestion: number; // 0-100
  symbol: string;
}

export const NETWORKS: NetworkInfo[] = [
  { id: 'TRON', name: 'TRON', standard: 'TRC-20', color: '#ef4444', speed: '~3 ثوانٍ', cost: '~$0.50', status: 'ok', statusLabel: 'متصلة', block: '#58,235,441', blockTime: '3 ثوانٍ', tps: '1,847', congestion: 18, symbol: 'TRX' },
  { id: 'BSC', name: 'BSC', standard: 'BEP-20', color: '#f59e0b', speed: '~3 ثوانٍ', cost: '~$0.05', status: 'ok', statusLabel: 'متصلة', block: '#38,924,100', blockTime: '3 ثوانٍ', tps: '312', congestion: 30, symbol: 'BNB' },
  { id: 'ETH', name: 'Ethereum', standard: 'ERC-20', color: '#627eea', speed: '~15 ثانية', cost: '~$5–50', status: 'slow', statusLabel: 'بطيئة', block: '#19,847,221', blockTime: '12 ثانية', tps: '28', congestion: 78, symbol: 'ETH' },
  { id: 'POLYGON', name: 'Polygon', standard: 'ERC-20', color: '#8247e5', speed: '~2 ثانية', cost: '~$0.01', status: 'ok', statusLabel: 'متصلة', block: '#52,118,444', blockTime: '2 ثانية', tps: '640', congestion: 22, symbol: 'MATIC' },
  { id: 'SOLANA', name: 'Solana', standard: 'SPL', color: '#14f195', speed: '~0.4 ثانية', cost: '~$0.001', status: 'ok', statusLabel: 'متصلة', block: '#271,445,892', blockTime: '0.4 ثانية', tps: '3,200', congestion: 40, symbol: 'SOL' },
  { id: 'ARBITRUM', name: 'Arbitrum', standard: 'ERC-20', color: '#28a0f0', speed: '~1 ثانية', cost: '~$0.10', status: 'ok', statusLabel: 'متصلة', block: '#211,305,118', blockTime: '1 ثانية', tps: '480', congestion: 25, symbol: 'ETH' },
];

export const TESTNETS = [
  { id: 'NILE', name: 'TRON Nile Testnet', status: 'ok' as const, statusLabel: 'متاحة' },
  { id: 'BSC_TEST', name: 'BSC Testnet', status: 'ok' as const, statusLabel: 'متاحة' },
  { id: 'SEPOLIA', name: 'Ethereum Sepolia', status: 'down' as const, statusLabel: 'غير متاحة' },
];

export type TxType = 'mint' | 'send' | 'burn';
export type TxStatus = 'success' | 'pending' | 'failed';

export interface Tx {
  id: string;
  time: string;
  date: string;
  type: TxType;
  amount: number;
  from: string;
  to: string;
  network: string;
  netBadge: string;
  txHash: string;
  status: TxStatus;
  gas: string;
  fee: string;
  block: string;
  confirmations: number;
  contract: string;
  failReason?: string;
}

export const TRANSACTIONS: Tx[] = [
  { id: 'tx1', time: '14:32', date: '2026-08-16', type: 'mint', amount: 10_000_000, from: 'TLa5x...7mKq', to: 'TLa5x...7mKq', network: 'TRON', netBadge: 'TRC20', txHash: 'a9c3f7d21b8e4d', status: 'success', gas: '12 TRX', fee: '12 TRX ($1.44)', block: '#58,234,920', confirmations: 847, contract: 'TNew7...AbCd' },
  { id: 'tx2', time: '14:35', date: '2026-08-16', type: 'send', amount: 10_000, from: 'TLa5x...7mKq', to: 'TQx7k...8kPm', network: 'TRON', netBadge: 'TRC20', txHash: 'a7f3c9d24b8d1e', status: 'success', gas: '7.8 TRX', fee: '7.8 TRX ($0.94)', block: '#58,234,955', confirmations: 812, contract: 'TNew7...AbCd' },
  { id: 'tx3', time: '15:10', date: '2026-08-16', type: 'mint', amount: 5_000_000, from: 'TLa5x...7mKq', to: 'TLa5x...7mKq', network: 'TRON', netBadge: 'TRC20', txHash: 'c4e8a2b97f1d3a', status: 'success', gas: '11 TRX', fee: '11 TRX ($1.32)', block: '#58,235,102', confirmations: 701, contract: 'TNew7...AbCd' },
  { id: 'tx4', time: '13:15', date: '2026-08-16', type: 'send', amount: 25_000, from: 'TLa5x...7mKq', to: '0xAbC...3fE2', network: 'ETH', netBadge: 'ERC20', txHash: 'b8d4e1a22c7f9e', status: 'pending', gas: '~0.002 ETH', fee: '0.002 ETH ($6.40)', block: '—', confirmations: 4, contract: '0x7Cd...1eB4' },
  { id: 'tx5', time: '11:48', date: '2026-08-16', type: 'send', amount: 50_000, from: 'TLa5x...7mKq', to: 'TVm3a...2nLp', network: 'TRON', netBadge: 'TRC20', txHash: 'b2d8f4c31a9e7b', status: 'success', gas: '8.2 TRX', fee: '8.2 TRX ($0.98)', block: '#58,233,410', confirmations: 1530, contract: 'TNew7...AbCd' },
  { id: 'tx6', time: '09:45', date: '2026-08-15', type: 'mint', amount: 100_000_000, from: '—', to: '—', network: '—', netBadge: '—', txHash: '—', status: 'failed', gas: '—', fee: '—', block: '—', confirmations: 0, contract: 'TNew7...AbCd', failReason: 'تجاوز الحد اليومي' },
  { id: 'tx7', time: '16:22', date: '2026-08-15', type: 'send', amount: 75_000, from: 'TLa5x...7mKq', to: 'TRk9x...7wQs', network: 'TRON', netBadge: 'TRC20', txHash: 'e5f1a8b33d2c6f', status: 'success', gas: '8 TRX', fee: '8 TRX ($0.96)', block: '#58,190,774', confirmations: 4203, contract: 'TNew7...AbCd' },
  { id: 'tx8', time: '15:02', date: '2026-08-15', type: 'mint', amount: 2_000_000, from: 'TLa5x...7mKq', to: 'TLa5x...7mKq', network: 'TRON', netBadge: 'TRC20', txHash: 'd7c2b9f44a1e8d', status: 'success', gas: '12 TRX', fee: '12 TRX ($1.44)', block: '#58,188,201', confirmations: 4431, contract: 'TNew7...AbCd' },
  { id: 'tx9', time: '12:19', date: '2026-08-14', type: 'send', amount: 30_000, from: 'TLa5x...7mKq', to: '0x7Cd...1eB4', network: 'BSC', netBadge: 'BEP20', txHash: 'f1e8d3a55b7c2e', status: 'success', gas: '0.0004 BNB', fee: '0.0004 BNB ($0.24)', block: '#38,850,341', confirmations: 9120, contract: '0xBe3...9fA2' },
  { id: 'tx10', time: '10:05', date: '2026-08-14', type: 'burn', amount: 500_000, from: 'TLa5x...7mKq', to: '0x000...000', network: 'TRON', netBadge: 'TRC20', txHash: 'a2b9c4d66e8f1a', status: 'success', gas: '10 TRX', fee: '10 TRX ($1.20)', block: '#58,120,450', confirmations: 8302, contract: 'TNew7...AbCd' },
];

export const NOTIFICATIONS = [
  { id: 'n1', title: 'سك ناجح – 10,000,000 وحدة', time: 'قبل 5 دقائق', target: 'mint', read: false },
  { id: 'n2', title: 'تم التأكيد – 20/20', time: 'قبل 12 دقيقة', target: 'transactions', read: false },
  { id: 'n3', title: 'تحذير: ازدحام مرتفع على Ethereum', time: 'قبل ساعة', target: 'network', read: true },
];

export const CONTRACTS = [
  { name: 'USDT', addr: 'TNew7...AbCd', network: 'TRON', symbol: 'TRC20' },
  { name: 'USDT', addr: '0xBe3...9fA2', network: 'BSC', symbol: 'BEP20' },
  { name: 'USDC', addr: '0x7Cd...1eB4', network: 'ETH', symbol: 'ERC20' },
];

export const ADDRESS_BOOK = [
  { name: 'العميل_01', addr: 'TQx7kR8vPm2nLq4wXz9bCdEfGhIjKlMn', short: 'TQx7k...8kPm', net: 'TRC20' },
  { name: 'العميل_02', addr: '0xAbC3DeF1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7', short: '0xAbC...3DeF', net: 'ERC20' },
  { name: 'العميل_03', addr: '0x7Cd1eB4f9A8b7C6d5E4f3A2b1C0d9E8f7A6b5C4d', short: '0x7Cd...1eB4', net: 'BEP20' },
];

export const LAST_RECIPIENTS = [
  { addr: 'TQx7k...8kPm', full: 'TQx7kR8vPm2nLq4wXz9bCdEfGhIjKlMn', amount: 10_000 },
  { addr: 'TVm3a...2nLp', full: 'TVm3aK7rXw5pQn8yTz2cDeFgHiJkLmNo', amount: 50_000 },
  { addr: 'TRk9x...7wQs', full: 'TRk9xY4tZq6mVb3sWn1fGhIjKlMnOpQr', amount: 25_000 },
];

export const HOLDERS = [
  { label: 'المالك — TLa5x...7mKq', value: 1_000_000_000, color: '#00d09c' },
  { label: 'TQx7k...8kPm', value: 6_500_000, color: '#3b82f6' },
  { label: 'TVm3a...2nLp', value: 2_900_000, color: '#f59e0b' },
  { label: 'TRk9x...7wQs', value: 600_000, color: '#ef4444' },
];

export const TOKEN_TEMPLATES = [
  { id: 'USDT', name: 'Tether USD', symbol: 'USDT', decimals: 6, nets: 'TRC20 / ERC20 / BEP20', color: '#26a17b', icon: '₮' },
  { id: 'USDC', name: 'USD Coin', symbol: 'USDC', decimals: 6, nets: 'ERC20 / BEP20 / TRC20', color: '#2775ca', icon: '$' },
  { id: 'BUSD', name: 'Binance USD', symbol: 'BUSD', decimals: 18, nets: 'BEP20', color: '#f0b90b', icon: 'B' },
  { id: 'DAI', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18, nets: 'ERC20 / Polygon', color: '#f5ac37', icon: '◈' },
  { id: 'CUSTOM', name: 'توكن مخصص', symbol: 'حدد بياناتك', decimals: 0, nets: 'كل الشبكات', color: '#4b5563', icon: '+' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', decimals: 18, nets: 'ERC20', color: '#627eea', icon: 'Ξ' },
];

export const RPC_ENDPOINTS = [
  { url: 'api.trongrid.io', latency: 45, status: 'ok' as const },
  { url: 'api.tronstack.io', latency: 82, status: 'ok' as const },
  { url: 'tron-rpc.publicnode.com', latency: 120, status: 'slow' as const },
  { url: 'api.shasta.trongrid.io', latency: 0, status: 'down' as const },
];

export const OTHER_WALLETS = [
  { id: 'w2', addr: '0xAbC...3DeF', badges: ['ERC20', 'BSC'], balance: '0.45 BNB' },
  { id: 'w3', addr: '0x7Cd...1eB4', badges: ['ETH'], balance: '0.02 ETH' },
  { id: 'w4', addr: 'TRk9xY...7wQs', badges: ['TRC20'], balance: '450 TRX' },
];

/** بيانات الرسم البياني التحليلي */
export interface ChartDay {
  label: string;
  mint: number;
  send: number;
  failed: number;
}

export const CHART_DAILY: ChartDay[] = [
  { label: '10/08', mint: 4_500_000, send: 120_000, failed: 1 },
  { label: '11/08', mint: 2_000_000, send: 80_000, failed: 0 },
  { label: '12/08', mint: 8_000_000, send: 210_000, failed: 2 },
  { label: '13/08', mint: 1_500_000, send: 45_000, failed: 0 },
  { label: '14/08', mint: 6_000_000, send: 150_000, failed: 0 },
  { label: '15/08', mint: 3_200_000, send: 95_000, failed: 1 },
  { label: '16/08', mint: 15_000_000, send: 35_000, failed: 0 },
];

export const CHART_WEEKLY: ChartDay[] = [
  { label: 'أحد', mint: 12_000_000, send: 300_000, failed: 2 },
  { label: 'اثنين', mint: 8_500_000, send: 240_000, failed: 0 },
  { label: 'ثلاثاء', mint: 15_200_000, send: 410_000, failed: 3 },
  { label: 'أربعاء', mint: 9_800_000, send: 180_000, failed: 1 },
  { label: 'خميس', mint: 11_400_000, send: 350_000, failed: 0 },
  { label: 'جمعة', mint: 6_300_000, send: 120_000, failed: 0 },
  { label: 'سبت', mint: 4_100_000, send: 90_000, failed: 1 },
];

export const CHART_MONTHLY: ChartDay[] = [
  { label: 'أسبوع 1', mint: 85_000_000, send: 2_100_000, failed: 5 },
  { label: 'أسبوع 2', mint: 120_000_000, send: 3_400_000, failed: 8 },
  { label: 'أسبوع 3', mint: 97_000_000, send: 2_800_000, failed: 3 },
  { label: 'أسبوع 4', mint: 143_000_000, send: 4_200_000, failed: 6 },
];
