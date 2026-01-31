import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

export function Logo({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-6 h-6", className)}
    >
      <path
        d="M26 12C26 8.68629 23.3137 6 20 6H13C11.8954 6 11 6.89543 11 8V11H8C6.34315 11 5 12.3431 5 14V17C5 18.1046 5.89543 19 7 19H8V24H12V26H21V22.25C23.8348 20.9168 26 18.4239 26 15V12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="11" r="1.5" fill="currentColor" />
    </svg>
  );
}
