// Utility to normalize account objects from API/database
export function normalizeAccount(raw: any) {
  return {
    ...raw,
    account_id: raw.account_id || raw.user_id?.toString(),
    user_id: raw.user_id || parseInt(raw.account_id),
  };
}

export function normalizeAccounts(arr: any[]) {
  return arr.map(normalizeAccount);
}
