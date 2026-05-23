import moment from "moment";
import { fallback } from "../common/fallback";

type FormatType =
  | "amount"
  | "date"
  | "name"
  | "time"
  | "date&time"
  | "sentences"
  | "words";

interface FormatOptions {
  type: FormatType;
  amount?: number | string;
  dateTime?: string | Date;
  firstName?: string;
  lastName?: string;
  sentences?: string;
  words?: string;
}

const formatter = ({
  type,
  amount,
  dateTime,
  firstName,
  lastName,
  sentences,
  words,
}: FormatOptions): string => {
  switch (type) {
    case "amount": {
      if (amount == null) return fallback.amount + "৳";
      const value = +amount;
      return !isNaN(value) ? value.toFixed(2) + "৳" : fallback.amount + "৳";
    }
    case "date": {
      return dateTime
        ? moment(dateTime).format("DD MMMM, YYYY")
        : fallback.notFound.en;
    }
    case "name": {
      const fullName = lastName ? `${firstName} ${lastName}` : firstName;
      return fullName ? capitalizeEveryWord(fullName) : fallback.notFound.en;
    }
    case "time": {
      return dateTime
        ? new Date(dateTime)?.toLocaleTimeString()
        : fallback.notFound.en;
    }
    case "date&time": {
      return dateTime
        ? moment(dateTime).format("DD MMMM, YYYY, hh:mm A")
        : fallback.notFound.en;
    }
    case "sentences": {
      return sentences
        ? capitalizeEverySentences(sentences)
        : fallback.notFound.en;
    }
    case "words": {
      return words ? capitalizeEveryWord(words) : fallback.notFound.en;
    }

    default: {
      return "Invalid format type";
    }
  }
};

const capitalizeEverySentences = (text: string): string => {
  const sentences = text?.toLowerCase()?.split(/([.?!]\s+)/) || [];
  return sentences
    .map((sentence, index) => {
      if (index % 2 === 0) {
        return sentence?.charAt(0)?.toUpperCase() + sentence?.slice(1);
      }
      return sentence;
    })
    .join("");
};

const capitalizeEveryWord = (sentence: string) => {
  // SPLIT THE SENTENCE INTO WORDS

  const words = (sentence && sentence?.toLowerCase()?.split(" ")) || [];

  // CAPITALIZE THE FIRST LETTER OF EACH WORD
  const capitalizedWords = words?.map(
    (word: string) => word?.charAt(0)?.toUpperCase() + word?.slice(1)
  );

  // JOIN THE CAPITALIZED WORDS BACK INTO A SENTENCE
  return capitalizedWords?.join(" ");
};

export default formatter;
