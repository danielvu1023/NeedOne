import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTimeAgo = (date: string | Date): string => {
  if (!date) {
    return "Invalid date";
  }

  // Ensure we are working with a Date object
  const pastDate = typeof date === "string" ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(pastDate.getTime())) {
    return "Invalid date";
  }

  const now = new Date();
  const secondsAgo = Math.round((now.getTime() - pastDate.getTime()) / 1000);

  if (secondsAgo < 5) {
    return "just now";
  }

  if (secondsAgo < 60) {
    return `${secondsAgo} sec ago`;
  }

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo} min ago`;
  }

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo} hr ago`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
};
