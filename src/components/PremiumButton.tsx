import React from "react";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({ children, icon, className = "", ...props }) => {
  return (
    <button
      {...props}
      className={`flex justify-center gap-3 items-center mx-auto shadow-lg text-sm bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-md font-bold isolation-auto border-slate-200 dark:border-slate-800 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-emerald-500 hover:text-white before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-6 py-3 overflow-hidden border-2 rounded-full group transition-all active:scale-95 ${className}`}
    >
      {children}
      <div className="w-8 h-8 flex items-center justify-center group-hover:rotate-90 group-hover:bg-white dark:group-hover:bg-emerald-400 ease-linear duration-300 rounded-full border border-slate-300 dark:border-slate-700 group-hover:border-none rotate-45 transition-all">
        <svg
          className="w-4 h-4 fill-slate-800 group-hover:fill-sky-800 transition-colors"
          viewBox="0 0 16 19"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
          ></path>
        </svg>
      </div>
    </button>
  );
};
