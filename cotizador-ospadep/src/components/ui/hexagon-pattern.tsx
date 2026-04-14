import { useId } from "react";

import { cn } from "@/lib/utils";

interface HexagonPatternProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  [key: string]: unknown;
}

export function HexagonPattern({
  className,
  size = 42,
  strokeWidth = 1,
  ...props
}: HexagonPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      {...props}
    >
      <defs>
        <pattern id={id} width={size} height={size * 0.86} patternUnits="userSpaceOnUse">
          <path
            d={`M ${size * 0.25} 0 L ${size * 0.75} 0 L ${size} ${size * 0.43} L ${size * 0.75} ${size * 0.86} L ${size * 0.25} ${size * 0.86} L 0 ${size * 0.43} Z`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
