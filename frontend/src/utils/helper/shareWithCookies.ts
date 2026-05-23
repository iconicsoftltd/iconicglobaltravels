import Cookies from "js-cookie";
// FUNCTION FOR MANAGE COOKIE
export const shareWithCookies = (
  option: "set" | "get" | "remove",
  key: string,
  expireByMin: number = 0,
  value?: unknown
) => {
  if (option === "set") {
    return (document.cookie = `${key}=${value}; path=/; expires=${new Date(
      Date.now() + expireByMin * 60 * 1000
    ).toUTCString()}`);
  }
  if (option === "get") {
    return Cookies.get(key) || undefined;
  }
  if (option === "remove") {
    return (document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`);
  }
};



