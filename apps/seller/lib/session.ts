export function clearSellerSession() {
  if (typeof window === 'undefined') return;
  ['sellerToken', 'authToken', 'token', 'accessToken', 'sellerUser', 'sellerUserId', 'userName', 'sellerVerified', 'merchantSettings'].forEach((key) => localStorage.removeItem(key));
}

export function centralLoginUrl() {
  return process.env.NEXT_PUBLIC_CENTRAL_LOGIN_URL || (process.env.NODE_ENV === 'production' ? 'https://bandhan-user.vercel.app/login' : 'http://localhost:3000/login');
}
