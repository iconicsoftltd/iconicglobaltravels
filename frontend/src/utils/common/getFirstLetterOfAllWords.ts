export const getFirstLetterOfAllWords = (str) =>
  str
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
