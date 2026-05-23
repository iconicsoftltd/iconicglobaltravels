export const formatWithDrCr = (amount: number | undefined, defaultType?: "Dr" | "Cr") => {
    if (amount === undefined) return `0.00 ${defaultType || ""}`;

    const absValue = Math.abs(amount).toLocaleString(undefined, {
        // minimumFractionDigits: 2,
        // maximumFractionDigits: 2,
    });

    // If a defaultType is provided (like for withdrawals), use it. 
    // Otherwise, calculate based on sign (Equity: Positive = Cr, Negative = Dr)
    const type = defaultType ? defaultType : (amount >= 0 ? "Cr" : "Dr");

    return `${absValue} ${type}`;
};