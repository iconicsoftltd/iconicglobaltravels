import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Currency {
  name: string;
  symbol: string;
  flag: string;
}

interface CurrencyState {
  list: Currency[];
  loaded: boolean;
  currentCurrency: Currency;
}

const savedCurrency = localStorage.getItem("currentCurrency");

const initialState: CurrencyState = {
  list: [
    { name: "BDT", symbol: "৳", flag: "/flags/bd.png" },
    { name: "INR", symbol: "₹", flag: "/flags/in.png" },
    { name: "USD", symbol: "$", flag: "/flags/usa.png" },
  ],
  loaded: true,
  currentCurrency: savedCurrency
    ? JSON.parse(savedCurrency)
    : { name: "BDT", symbol: "৳", flag: "/flags/bd.png" },
};

const currencySlice = createSlice({
  name: "currencies",
  initialState,
  reducers: {
    setCurrencies(state, action: PayloadAction<Currency[]>) {
      state.list = action.payload;
      state.loaded = true;
    },
    clearCurrencies(state) {
      state.list = [];
      state.loaded = false;
    },
    setCurrentCurrency(state, action: PayloadAction<Currency>) {
      state.currentCurrency = action.payload;
      localStorage.setItem("currentCurrency", JSON.stringify(action.payload));
    },
  },
});

export const { setCurrencies, clearCurrencies, setCurrentCurrency } =
  currencySlice.actions;
export default currencySlice.reducer;
