'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Transaction } from '@/types/finance';
import { getMonthlyIncomeVsExpenses, formatCurrency } from '@/lib/financeService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyIncomeExpensesChartProps {
  transactions: Transaction[];
}

export default function MonthlyIncomeExpensesChart({ transactions }: MonthlyIncomeExpensesChartProps) {
  const chartData = getMonthlyIncomeVsExpenses(transactions);

  if (chartData.labels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center" role="img" aria-label="Monthly Income vs Expenses chart - no data available">
        <h3 className="text-lg sm:text-xl font-semibold text-deep-black mb-4 font-sans">Monthly Income vs Expenses</h3>
        <p className="text-gray-600 text-sm sm:text-base font-sans">No data available for monthly comparison</p>
      </div>
    );
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Income',
        data: chartData.incomeData,
        backgroundColor: '#1C5713',
        borderColor: '#1C5713',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: chartData.expenseData,
        backgroundColor: '#B15539',
        borderColor: '#B15539',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'var(--font-open-sans)',
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Monthly Income vs Expenses',
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
          label: function(context: TooltipItem<'bar'>) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y ?? 0)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            return formatCurrency(Number(value));
          },
          font: {
            family: 'var(--font-open-sans)',
            size: 11,
          },
        },
        grid: {
          color: '#E5E7EB',
        },
      },
      x: {
        ticks: {
          font: {
            family: 'var(--font-open-sans)',
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Generate screen reader description
  const totalIncome = chartData.incomeData.reduce((sum, value) => sum + value, 0);
  const totalExpenses = chartData.expenseData.reduce((sum, value) => sum + value, 0);
  const screenReaderDescription = `Bar chart showing monthly income versus expenses. Total income: ${formatCurrency(totalIncome)}, Total expenses: ${formatCurrency(totalExpenses)}. Data covers ${chartData.labels.length} months from ${chartData.labels[0]} to ${chartData.labels[chartData.labels.length - 1]}.`;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="h-64 sm:h-80 md:h-96 flex items-center justify-center">
        <div
          role="img"
          aria-label={screenReaderDescription}
          tabIndex={0}
          className="focus:outline-none w-full h-full"
        >
          <Bar data={data} options={options} />
        </div>
      </div>
      <div className="sr-only">
        <p>Detailed data:</p>
        <ul>
          {chartData.labels.map((label, index) => (
            <li key={label}>
              {label}: Income {formatCurrency(chartData.incomeData[index])}, 
              Expenses {formatCurrency(chartData.expenseData[index])}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}