/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ExpenseItem, 
  IncomeItem, 
  Transaction, 
  MonthlySummary, 
  CategorySummary 
} from './types';
import { 
  loadStoredTransactions, 
  saveStoredTransactions, 
  formatCurrency, 
  formatDate,
  CATEGORY_COLORS 
} from './utils/storage';
import { FinancialCharts } from './components/FinancialCharts';
import { 
  ExpenseModal, 
  IncomeModal, 
  DeleteConfirmModal 
} from './components/TransactionModals';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  Trash2,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [income, setIncome] = useState<IncomeItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXPENSES' | 'INCOME'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load initial data
  useEffect(() => {
    const data = loadStoredTransactions();
    setExpenses(data.expenses);
    setIncome(data.income);
  }, []);

  // Save changes to localStorage
  const handleUpdateExpenses = (newExpenses: ExpenseItem[]) => {
    setExpenses(newExpenses);
    saveStoredTransactions(newExpenses, income);
  };

  const handleUpdateIncome = (newIncome: IncomeItem[]) => {
    setIncome(newIncome);
    saveStoredTransactions(expenses, newIncome);
  };

  // CRUD Operations: Expenses
  const handleSaveExpense = (itemData: Omit<ExpenseItem, 'id' | 'type' | 'createdAt'>) => {
    if (editingExpense) {
      const updated = expenses.map(exp => 
        exp.id === editingExpense.id 
          ? { ...exp, ...itemData }
          : exp
      );
      handleUpdateExpenses(updated);
      showToast('Expense updated successfully!');
      setEditingExpense(null);
    } else {
      const newExp: ExpenseItem = {
        ...itemData,
        id: `exp-${Date.now()}`,
        type: 'expense',
        createdAt: new Date().toISOString()
      };
      handleUpdateExpenses([newExp, ...expenses]);
      showToast('New expense recorded!');
    }
  };

  // CRUD Operations: Income
  const handleSaveIncome = (itemData: Omit<IncomeItem, 'id' | 'type' | 'createdAt'>) => {
    if (editingIncome) {
      const updated = income.map(inc => 
        inc.id === editingIncome.id 
          ? { ...inc, ...itemData }
          : inc
      );
      handleUpdateIncome(updated);
      showToast('Income entry updated successfully!');
      setEditingIncome(null);
    } else {
      const newInc: IncomeItem = {
        ...itemData,
        id: `inc-${Date.now()}`,
        type: 'income',
        createdAt: new Date().toISOString()
      };
      handleUpdateIncome([newInc, ...income]);
      showToast('New income recorded!');
    }
  };

  // Delete Action
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'expense') {
      const filtered = expenses.filter(e => e.id !== deleteTarget.id);
      handleUpdateExpenses(filtered);
      showToast('Expense entry deleted.');
    } else {
      const filtered = income.filter(i => i.id !== deleteTarget.id);
      handleUpdateIncome(filtered);
      showToast('Income entry deleted.');
    }
    setDeleteTarget(null);
  };

  // Aggregate Calculations
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const totalIncome = useMemo(() => {
    return income.reduce((sum, item) => sum + item.amount, 0);
  }, [income]);

  const currentBalance = totalIncome - totalExpenses;

  // Current month tracker
  const currentMonthPrefix = '2026-10';
  const thisMonthExpenses = useMemo(() => {
    return expenses
      .filter(e => e.date.startsWith(currentMonthPrefix))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const lastMonthExpenses = useMemo(() => {
    return expenses
      .filter(e => e.date.startsWith('2026-09'))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const monthTrendPercentage = lastMonthExpenses > 0 
    ? Math.round(((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100) 
    : 0;

  // Prepare monthly data for chart (Last 4 Months)
  const monthlyData: MonthlySummary[] = useMemo(() => {
    const months = ['2026-07', '2026-08', '2026-09', '2026-10'];
    const monthNames: Record<string, string> = {
      '2026-07': 'Jul',
      '2026-08': 'Aug',
      '2026-09': 'Sep',
      '2026-10': 'Oct'
    };

    return months.map(m => {
      const inc = income.filter(i => i.date.startsWith(m)).reduce((s, i) => s + i.amount, 0);
      const exp = expenses.filter(e => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0);
      return {
        month: monthNames[m] || m,
        income: inc,
        expense: exp,
        balance: inc - exp
      };
    });
  }, [expenses, income]);

  // Prepare category data for donut chart
  const categoryData: CategorySummary[] = useMemo(() => {
    const catMap: Record<string, { amount: number; count: number }> = {};

    expenses.forEach(exp => {
      if (!catMap[exp.category]) {
        catMap[exp.category] = { amount: 0, count: 0 };
      }
      catMap[exp.category].amount += exp.amount;
      catMap[exp.category].count += 1;
    });

    const total = totalExpenses || 1;
    return Object.entries(catMap)
      .map(([cat, data]) => ({
        category: cat,
        amount: data.amount,
        count: data.count,
        percentage: Math.round((data.amount / total) * 100),
        color: CATEGORY_COLORS[cat] || '#8b5cf6'
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, totalExpenses]);

  // Filtered & Sorted Transactions List
  const displayTransactions: Transaction[] = useMemo(() => {
    let list: Transaction[] = [];

    if (activeTab === 'ALL') {
      list = [...expenses, ...income];
    } else if (activeTab === 'EXPENSES') {
      list = [...expenses];
    } else {
      list = [...income];
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => {
        const descMatch = item.description.toLowerCase().includes(q);
        const catMatch = item.type === 'expense' && item.category.toLowerCase().includes(q);
        const sourceMatch = item.type === 'income' && item.source.toLowerCase().includes(q);
        const payMatch = item.type === 'expense' && item.paymentMethod.toLowerCase().includes(q);
        return descMatch || catMatch || sourceMatch || payMatch;
      });
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      list = list.filter(item => {
        if (item.type === 'expense') return item.category === categoryFilter;
        if (item.type === 'income') return item.source === categoryFilter;
        return true;
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });

    return list;
  }, [expenses, income, activeTab, searchQuery, categoryFilter, sortBy]);

  // Unique categories for the dropdown filter
  const availableCategories = useMemo(() => {
    if (activeTab === 'EXPENSES') {
      return Array.from(new Set(expenses.map(e => e.category)));
    }
    if (activeTab === 'INCOME') {
      return Array.from(new Set(income.map(i => i.source)));
    }
    return Array.from(new Set([
      ...expenses.map(e => e.category),
      ...income.map(i => i.source)
    ]));
  }, [expenses, income, activeTab]);

  return (
    <div className="min-h-screen bg-[#0b0c16] text-slate-100 font-sans selection:bg-violet-600 selection:text-white">
      
      {/* Toast Notification Popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#17192a] border border-[#3b3e64] shadow-2xl text-xs font-medium text-white">
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* App Main Header Bar */}
      <header className="bg-[#0f101c]/90 backdrop-blur-md border-b border-[#24263e] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-900/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                ExpenseFlow
              </span>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Personal Expense Tracker
              </span>
            </div>
          </div>

          {/* Quick Action Buttons & User Profile */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setEditingIncome(null);
                setIsIncomeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Income</span>
            </button>

            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/40 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* 1. Stat Summary Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Total Balance Card */}
          <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Balance
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-2xl font-bold tracking-tight mb-1 ${currentBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(currentBalance)}
            </div>
            <div className="text-[11px] text-slate-400">
              <span>Net: Total Inflow - Outflow</span>
            </div>
          </div>

          {/* Total Income Card */}
          <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Income
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-400 mb-1">
              {formatCurrency(totalIncome)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>All-time recorded inflow</span>
              <button 
                onClick={() => {
                  setEditingIncome(null);
                  setIsIncomeModalOpen(true);
                }}
                className="text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Total Expenses Card */}
          <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Expenses
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-rose-400 mb-1">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-[11px] text-slate-400">
              <span>Across {expenses.length} expense items</span>
            </div>
          </div>

          {/* This Month's Summary Card */}
          <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                This Month (Oct 2026)
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-amber-300 mb-1">
              {formatCurrency(thisMonthExpenses)}
            </div>
            <div className="text-[11px] text-slate-400">
              {monthTrendPercentage !== 0 ? (
                <span className={monthTrendPercentage < 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {monthTrendPercentage > 0 ? `+${monthTrendPercentage}%` : `${monthTrendPercentage}%`} vs previous month
                </span>
              ) : (
                <span>Current active billing cycle</span>
              )}
            </div>
          </div>

        </section>

        {/* 2. Interactive Financial Charts */}
        <FinancialCharts monthlyData={monthlyData} categoryData={categoryData} />

        {/* 3. Navigation View Switcher Tabs */}
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-[#17192a] border border-[#2d2f4a] rounded-xl">
            <button
              onClick={() => {
                setActiveTab('ALL');
                setCategoryFilter('ALL');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Transactions ({expenses.length + income.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('EXPENSES');
                setCategoryFilter('ALL');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'EXPENSES'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expenses Only ({expenses.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('INCOME');
                setCategoryFilter('ALL');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income Only ({income.length})
            </button>
          </div>
        </div>

        {/* 4. Filter Toolbar & Search Bar */}
        <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl p-4 mb-6 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, category, payment method..."
              className="w-full bg-[#0f101c] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-violet-500 placeholder-slate-500"
            />
          </div>

          {/* Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0f101c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="ALL">All Categories / Sources</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0f101c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>

            {(searchQuery || categoryFilter !== 'ALL' || sortBy !== 'newest') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                  setSortBy('newest');
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* 5. Transactions Table (Desktop) & Cards (Mobile) */}
        <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl shadow-xl overflow-hidden">
          
          <div className="px-6 py-4 border-b border-[#24263e] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Transactions Record
              </h3>
              <span className="text-xs text-slate-400">
                Showing {displayTransactions.length} items
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                + New Expense
              </button>
            </div>
          </div>

          {displayTransactions.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">No transactions found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                No records match your active search or filters.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setEditingExpense(null);
                    setIsExpenseModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Add Expense
                </button>
                <button
                  onClick={() => {
                    setEditingIncome(null);
                    setIsIncomeModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Add Income
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f101c] text-slate-400 font-semibold uppercase tracking-wider border-b border-[#24263e]">
                    <tr>
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-6">Type</th>
                      <th className="py-3 px-6">Description</th>
                      <th className="py-3 px-6">Category / Source</th>
                      <th className="py-3 px-6">Method</th>
                      <th className="py-3 px-6 text-right">Amount</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202236]">
                    {displayTransactions.map((tx) => {
                      const isExpense = tx.type === 'expense';

                      return (
                        <tr key={tx.id} className="hover:bg-[#121324] transition-colors">
                          <td className="py-3.5 px-6 text-slate-300 font-mono">
                            {formatDate(tx.date)}
                          </td>
                          
                          <td className="py-3.5 px-6">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              isExpense 
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' 
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                            }`}>
                              {isExpense ? 'Expense' : 'Income'}
                            </span>
                          </td>

                          <td className="py-3.5 px-6 font-medium text-white max-w-xs truncate">
                            {tx.description}
                          </td>

                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-1.5">
                              {isExpense ? (
                                <>
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#8b5cf6' }}
                                  ></span>
                                  <span className="text-slate-200">{tx.category}</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                  <span className="text-emerald-300">{tx.source}</span>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-6 text-slate-400">
                            {isExpense ? tx.paymentMethod : 'Direct Deposit'}
                          </td>

                          <td className={`py-3.5 px-6 text-right font-bold font-mono text-sm ${
                            isExpense ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {isExpense ? `-${formatCurrency(tx.amount)}` : `+${formatCurrency(tx.amount)}`}
                          </td>

                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  if (isExpense) {
                                    setEditingExpense(tx as ExpenseItem);
                                    setIsExpenseModalOpen(true);
                                  } else {
                                    setEditingIncome(tx as IncomeItem);
                                    setIsIncomeModalOpen(true);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setDeleteTarget(tx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-[#202236]">
                {displayTransactions.map((tx) => {
                  const isExpense = tx.type === 'expense';

                  return (
                    <div key={tx.id} className="p-4 hover:bg-[#121324] transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isExpense 
                                ? 'bg-rose-500/15 text-rose-300' 
                                : 'bg-emerald-500/15 text-emerald-300'
                            }`}>
                              {isExpense ? tx.category : tx.source}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {formatDate(tx.date)}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white">
                            {tx.description}
                          </h4>
                        </div>

                        <div className={`text-base font-bold font-mono ${
                          isExpense ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {isExpense ? `-${formatCurrency(tx.amount)}` : `+${formatCurrency(tx.amount)}`}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <span>
                          {isExpense ? tx.paymentMethod : 'Direct Deposit'}
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (isExpense) {
                                setEditingExpense(tx as ExpenseItem);
                                setIsExpenseModalOpen(true);
                              } else {
                                setEditingIncome(tx as IncomeItem);
                                setIsIncomeModalOpen(true);
                              }
                            }}
                            className="text-violet-400 hover:underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(tx)}
                            className="text-rose-400 hover:underline font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#24263e] py-6 mt-12 bg-[#0c0d18] text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">ExpenseFlow</span>
            <span>&middot;</span>
            <span>Personal Financial Management</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            <span>All data secured & stored</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />

      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => {
          setIsIncomeModalOpen(false);
          setEditingIncome(null);
        }}
        onSave={handleSaveIncome}
        initialData={editingIncome}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.type === 'expense' ? 'Expense' : 'Income'}?`}
        itemDescription={deleteTarget?.description || ''}
      />

    </div>
  );
}
