import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-slate-500 hover:text-neon-cyan transition-colors ml-1.5 focus:outline-none"
        aria-label="More Information"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>

      {isVisible && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2.5 bg-slate-900/95 border border-cyan-500/40 rounded-xl text-[11px] text-slate-200 shadow-neon-cyan z-50 backdrop-blur-md pointer-events-none font-sans leading-relaxed">
          <div className="text-neon-cyan font-bold mb-0.5 font-mono">JUDGE GUIDE</div>
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95" />
        </div>
      )}
    </div>
  );
};
