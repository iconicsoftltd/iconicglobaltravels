import { useLocaleContext } from "./useLocaleContext";

export const useFontShifter = () => {
  const { locale } = useLocaleContext();
  return locale?.toLowerCase() === "bn" ? "font-anek" : "font-open_sans";
};
