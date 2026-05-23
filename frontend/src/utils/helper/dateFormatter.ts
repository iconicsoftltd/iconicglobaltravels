import { format } from "date-fns";

// A function to format a date string or Date object
export const dateFormatter = (dateTime: string | Date): string => {
  const date = new Date(dateTime);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return format(date, "dd MMMM, yyyy");
};
