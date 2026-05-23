import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/components/store/store";
import { setCurrentCurrency } from "@/components/store/currency/currencySlice";

export default function CurrencySelect() {
  const dispatch = useDispatch();
  const { list, currentCurrency } = useSelector(
    (state: RootState) => state.currencies
  );

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (currencyName: string) => {
    const selectedCurrency = list.find((c) => c.name === currencyName);
    if (selectedCurrency) {
      dispatch(setCurrentCurrency(selectedCurrency));
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        className="flex h-[42px] bg-transparent  items-center justify-between gap-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-none transition-border disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <img
            src={currentCurrency.flag}
            alt={currentCurrency.name}
            className="w-6 h-4"
          />
          <span className="line-clamp-1">{currentCurrency.name}</span>
        </div>
        <svg
          className={`h-4 w-4 opacity-50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill=""
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute p-1 z-50 mt-1 space-y-1 max-h-60 rounded-md min-w-max border bg-popover text-popover-foreground shadow-md">
          {list.map((currency) => (
            <button
              key={currency.name}
              type="button"
              onClick={() => handleChange(currency.name)}
              className={`relative flex w-full items-center gap-2 rounded-sm py-1.5 px-2 text-sm transition-colors ${
                currency.name === currentCurrency.name
                  ? "bg-primary text-white"
                  : "bg-primary-50 hover:bg-primary hover:text-white"
              }`}
            >
              <img
                src={currency.flag}
                alt={currency.name}
                className="w-6 h-4 object-cover"
              />
              <span>{currency.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
