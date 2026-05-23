import moment from "moment";

export const timeDateFormatter = (dateTime: string) => {
  return moment(dateTime).format("DD MMMM, YYYY, hh:mm A") || "Not Found";
};
