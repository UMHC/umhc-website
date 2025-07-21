'use client';

import { useMemo } from 'react';

interface DoughnutChartProps {
  percentage: number;
  isOverBudget: boolean;
  size?: number;
  strokeWidth?: number;
}

export default function DoughnutChart({ 
  percentage, 
  isOverBudget, 
  size = 40, 
  strokeWidth = 4 
}: DoughnutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  const color = useMemo(() => {
    if (isOverBudget) return '#ef4444'; // red
    if (percentage >= 80) return '#f59e0b'; // yellow
    if (percentage >= 60) return '#3b82f6'; // blue
    return '#10b981'; // green
  }, [percentage, isOverBudget]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-700">
          {percentage > 999 ? '999+' : Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}
