
import { fallback } from "@/utils/common/fallback";
import { useLocaleContext } from "./useLocaleContext";

export const useCustomTranslator = () => {
  const { locale } = useLocaleContext();

  const translate = (bn: string, en: string): string => {
    if (locale === "bn") {
      return bn || fallback.notFound.bn;
    } else {
      return en || fallback.notFound.en;
    }
  };

  const digitConverter = (number: number | string | null): string => {
    if (number === null) {
      return locale === "bn" ? "০" : "0";
    }

    if (locale !== "bn") {
      return number.toString();
    }

    const englishDigits: string[] = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ];
    const banglaDigits: string[] = [
      "০",
      "১",
      "২",
      "৩",
      "৪",
      "৫",
      "৬",
      "৭",
      "৮",
      "৯",
    ];

    const result: string[] = [];
    for (const digit of number.toString()) {
      if (englishDigits.includes(digit)) {
        const index: number = englishDigits.indexOf(digit);
        result.push(banglaDigits[index]);
      } else {
        result.push(digit);
      }
    }

    return result.join("");
  };

  return { translate, digitConverter, locale };
};
