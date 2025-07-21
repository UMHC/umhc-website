'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Transaction } from '@/types/finance';
import { getExpensesByCategory, formatCurrency } from '@/lib/financeService';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpensesCategoryChartProps {
  transactions: Transaction[];
}

export default function ExpensesCategoryChart({ transactions }: ExpensesCategoryChartProps) {
  const chartData = getExpensesByCategory(transactions);

  if (chartData.labels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center" role="img" aria-label="Expenses by Category chart - no data available">
        <h3 className="text-lg sm:text-xl font-semibold text-deep-black mb-4 font-sans">Expenses by Category</h3>
        <p className="text-gray-600 text-sm sm:text-base font-sans">No expense data available</p>
      </div>
    );
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.data,
        backgroundColor: chartData.colors,
        borderColor: chartData.colors.map(color => color),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#FFFFFF',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            family: 'var(--font-open-sans)',
            size: 11,
          },
          padding: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12,
        },
      },
      title: {
        display: true,
        text: 'Expenses by Category',
        font: {
          family: 'var(--font-open-sans)',
          size: 36,
          weight: 'normal' as const,
        },
        color: '#000000',
        padding: {
          top: 0,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'doughnut'>) {
            const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '50%',
  };

  // Generate screen reader description
  const totalExpenses = chartData.data.reduce((sum, value) => sum + value, 0);
  const screenReaderDescription = `Doughnut chart showing expenses breakdown by category. Total expenses: ${formatCurrency(totalExpenses)} across ${chartData.labels.length} categories.`;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="h-64 sm:h-80 md:h-96 flex items-center justify-center">
        <div
          role="img"
          aria-label={screenReaderDescription}
          tabIndex={0}
          className="focus:outline-none w-full h-full"
        >
          <Doughnut data={data} options={options} />
        </div>
      </div>
      <div className="sr-only">
        <p>Detailed breakdown:</p>
        <ul>
          {chartData.labels.map((label, index) => {
            const percentage = ((chartData.data[index] / totalExpenses) * 100).toFixed(1);
            return (
              <li key={label}>
                {label}: {formatCurrency(chartData.data[index])} ({percentage}%)
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}