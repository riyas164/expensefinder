import React, { useState } from 'react';
import { MonthlySummary, CategorySummary } from '../types';
import { formatCurrency } from '../utils/storage';
import { BarChart3, PieChart, TrendingUp, ArrowUpRight } from 'lucide-react';

interface FinancialChartsProps {
  monthlyData: MonthlySummary[];
  categoryData: CategorySummary[];
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ monthlyData, categoryData }) => {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlySummary | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<CategorySummary | null>(null);

  // Maximum value for scaling the bar chart
  const maxBarValue = Math.max(
    ...monthlyData.map(m => Math.max(m.income, m.expense)),
    1000
  );

  // Calculate total expense for category percentage calculation
  const totalCategoryExpense = categoryData.reduce((sum, c) => sum + c.amount, 0);

  // Helper to compute SVG donut chart segments
  let cumulativeAngle = 0;
  const radius = 75;
  const strokeWidth = 24;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 1. Monthly Financial Trends: Income vs Expense Bar Chart */}
      <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Monthly Financial Trends</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Income vs Expenses Comparison</p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
              <span>Income</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              <span>Expenses</span>
            </span>
          </div>
        </div>

        {/* Hover info tooltip box */}
        <div className="h-9 mb-2 flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0f101c] border border-slate-800 text-xs text-slate-300">
          {hoveredMonth ? (
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold text-white">{hoveredMonth.month}:</span>
              <span className="text-emerald-400">Income: {formatCurrency(hoveredMonth.income)}</span>
              <span className="text-rose-400">Expense: {formatCurrency(hoveredMonth.expense)}</span>
              <span className={`font-semibold ${hoveredMonth.balance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                Net: {formatCurrency(hoveredMonth.balance)}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
              Hover over any monthly bar for exact figures
            </span>
          )}
        </div>

        {/* SVG/CSS Bar Chart Grid */}
        <div className="pt-4 pb-2">
          <div className="h-56 flex items-end justify-around gap-2 px-2 border-b border-slate-800">
            {monthlyData.map((item, idx) => {
              const incomeHeight = Math.max((item.income / maxBarValue) * 100, 4);
              const expenseHeight = Math.max((item.expense / maxBarValue) * 100, 4);

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                  onMouseEnter={() => setHoveredMonth(item)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Income Bar */}
                    <div
                      style={{ height: `${incomeHeight}%` }}
                      className="w-5 sm:w-7 rounded-t-md bg-emerald-500/80 group-hover:bg-emerald-400 transition-all duration-300 relative shadow-sm"
                    ></div>

                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expenseHeight}%` }}
                      className="w-5 sm:w-7 rounded-t-md bg-rose-500/80 group-hover:bg-rose-400 transition-all duration-300 relative shadow-sm"
                    ></div>
                  </div>

                  <span className="text-xs font-medium text-slate-400 group-hover:text-white transition">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Expense Category Breakdown: Donut Chart & Legend */}
      <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Category Breakdown</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Where your money goes</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Total Outflow</span>
            <div className="text-sm font-bold text-rose-400">
              {formatCurrency(totalCategoryExpense)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          {/* SVG Donut */}
          <div className="sm:col-span-5 flex items-center justify-center relative">
            <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#1e2138"
                strokeWidth={strokeWidth}
              />

              {/* Data segments */}
              {categoryData.map((cat, idx) => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativeAngle / 100) * circumference);
                cumulativeAngle += cat.percentage;

                const isHovered = hoveredCategory?.category === cat.category;

                return (
                  <circle
                    key={idx}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(cat)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              {hoveredCategory ? (
                <>
                  <span className="text-xs font-semibold text-slate-300 truncate max-w-[90px]">
                    {hoveredCategory.category}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {hoveredCategory.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatCurrency(hoveredCategory.amount)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs font-semibold text-slate-400">Categories</span>
                  <span className="text-lg font-bold text-white">
                    {categoryData.length}
                  </span>
                  <span className="text-[10px] text-slate-400">Items</span>
                </>
              )}
            </div>
          </div>

          {/* Category List Legend */}
          <div className="sm:col-span-7 space-y-2 max-h-56 overflow-y-auto pr-1">
            {categoryData.map((cat, idx) => {
              const isHovered = hoveredCategory?.category === cat.category;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCategory(cat)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition cursor-pointer ${
                    isHovered ? 'bg-[#0f101c] border border-slate-700' : 'hover:bg-[#121324]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className="font-medium text-slate-200">{cat.category}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-200">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-slate-400 w-9 text-right font-mono">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </section>
  );
};
