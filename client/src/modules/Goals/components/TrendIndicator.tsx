import React from "react";

interface TrendIndicatorProps {
  trend: "up" | "down" | "same";
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend }) => {
  if (trend === "up") {
    return (
      <span className="text-emerald-500 flex items-center text-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
        Subiu
      </span>
    );
  }
  
  if (trend === "down") {
    return (
      <span className="text-red-500 flex items-center text-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        Caiu
      </span>
    );
  }
  
  return (
    <span className="text-gray-500 flex items-center text-xs">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1"
      >
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Manteve
    </span>
  );
};