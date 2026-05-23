// FUNCTION FOR MANAGE LOCAL STORAGE
export const shareWithLocal = (
  option: "set" | "get" | "remove",
  key: string,
  value?: unknown
) => {
  if (option === "set") {
    return localStorage.setItem(key, JSON.stringify(value));
  }
  if (option === "get") {
    const storeValue =
      typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    return storeValue ? JSON.parse(storeValue) : null;
  }
  if (option === "remove") {
    return localStorage.removeItem(key);
  }
};
