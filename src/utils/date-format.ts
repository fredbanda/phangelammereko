export function formatDate (dateString?: string)  {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
};

export function formatDateMonthYear(
  dateInput?: string | Date | number | null,
  fullMonth: boolean = false
) {
  if (!dateInput) return "";

  const date =
    dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: fullMonth ? "long" : "short", // "Jan" vs "January"
    year: "numeric",
  }).format(date);
}
