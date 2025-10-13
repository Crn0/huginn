import { cva } from "class-variance-authority";

export const linkVariants = cva(
  "text-sm font-medium whitespace-nowrap text-blue-500 transition-colors hover:opacity-75 focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:outline-none",
  {
    variants: {
      variant: {
        link: "text-blue-500 hover:opacity-75",
        button:
          "inline-flex items-center justify-center rounded-md bg-indigo-400 p-5 text-center text-sm font-medium whitespace-nowrap text-white no-underline transition-colors hover:opacity-75",
      },
      size: {
        auto: "h-auto w-auto",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "link",
      size: "auto",
    },
  }
);
