// utils/dateFormat.ts (optional helper file if you reuse it elsewhere)
export const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
};
