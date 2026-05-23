interface IFallbackPropertyProps {
  en: string;
  bn: string;
}
interface IFallbackProps {
  notFound: IFallbackPropertyProps;
  amount: string;
  nSlashA: string;
  quantity: string;
  error: IFallbackPropertyProps;
  querySize: number;
  sortOrder: "asc" | "dsc";
  photo: string;
}
export const fallback: IFallbackProps = {
  notFound: {
    en: "Not found",
    bn: "খুঁজে পাওয়া যায়নি",
  },
  amount: "0.00",
  nSlashA: "N/A",
  quantity: "0",
  error: {
    en: "Something went wrong! try again",
    bn: "একটি সমস্যা দেখা দিয়েছে! পুনরায় চেষ্টা করুন।",
  },
  querySize: 20,
  sortOrder: "asc",
  photo: "../../../../public/not_available.png",
};
