export const adminFetchOpts: RequestInit = {
  credentials: "include",
};

export function apiHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}
