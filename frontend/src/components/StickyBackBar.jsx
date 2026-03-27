import { Link } from "react-router-dom";

const barClass =
  "sticky top-0 z-30 shrink-0 w-full mx-auto px-4 pt-4 pb-2 flex justify-center sm:justify-start bg-[#e8f0fe]/95 dark:bg-gray-950/90 backdrop-blur-sm border-b border-blue-100/80 dark:border-gray-800";

const controlClass =
  "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600";

export default function StickyBackBar({ to, onBack, label, maxWidthClass = "max-w-4xl" }) {
  return (
    <div className={`${barClass} ${maxWidthClass}`}>
      {onBack ? (
        <button type="button" onClick={onBack} className={controlClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {label}
        </button>
      ) : (
        <Link to={to} className={controlClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {label}
        </Link>
      )}
    </div>
  );
}
