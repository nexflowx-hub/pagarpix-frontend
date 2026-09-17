export const CORE_API_URL =
  process.env.XPAYMENTS_API_URL ?? "https://api.xpayments.digital/api/v1";

export const SESSION_COOKIE = "pagarpix_session";

export const ALLOWED_CORE_PATHS = [
  /^wallets$/,
  /^wallets\/(movements|payouts|deposits)$/,
  /^wallets\/operations$/,
  /^wallets\/operations\/[0-9a-f-]{36}$/i,
  /^merchant\/(profile|stores)$/,
  /^transactions$/,
  /^transactions\/stats$/,
  /^transactions\/[0-9a-f-]{36}$/i,
  /^analytics\/overview$/,
  /^finance\/(overview|stores|releases)$/,
  /^treasury\/overview$/,
  /^payout-statements$/,
  /^routing\/(connections|policies|decisions)$/
];

export function isAllowedCorePath(path: string) {
  return ALLOWED_CORE_PATHS.some((pattern) => pattern.test(path));
}
