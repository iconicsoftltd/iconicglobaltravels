import { getFirstLetterOfAllWords } from "../common/getFirstLetterOfAllWords";

export function generateVoucherNo(prefix = "RV", branchName = "WEL") {
  // Generate a random 10-digit number (from 1 to 9999999999)
  const randomNum = Math.floor(Math.random() * 9999999999) + 1;

  return `${prefix}-${getFirstLetterOfAllWords(branchName)}${randomNum}`;
}


