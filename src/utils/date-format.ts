// utils/dateFormat.ts
export const formatDate = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn("Invalid date string:", dateString);
    return ""; // or return dateString if you want to show raw input
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
};
