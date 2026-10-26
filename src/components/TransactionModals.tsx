import React, { useState, useEffect } from 'react';
import { ExpenseItem, IncomeItem, Transaction } from '../types';
import { X, Trash2, Database, ShieldAlert, Check } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseItem, 'id' | 'type' | 'createdAt'>) => void;
  initialData?: ExpenseItem | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setDescription(initialData.description);
      setCategory(initialData.category);
      setPaymentMethod(initialData.paymentMethod);
      setDate(initialData.date);
    } else {
      setAmount('');
      setDescription('');
      setCategory('Food');
      setPaymentMethod('Credit Card');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!description.trim()) return;

    onSave({
      amount: parsedAmount,
      description: description.trim(),
      category,
      paymentMethod,
      date
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">
            {initialData ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Amount ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 45.00"
              className="w-full bg-[#0f101c] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-violet-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Weekly Grocery Run"
              className="w-full bg-[#0f101c] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0f101c] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="Food">Food & Groceries</option>
                <option value="Transport">Transport</option>
                <option value="Bills">Bills & Utilities</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Travel">Travel</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#0f101c] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / Digital Wallet</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Expense Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#0f101c] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-violet-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/30 transition cursor-pointer"
            >
              {initialData ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (income: Omit<IncomeItem, 'id' | 'type' | 'createdAt'>) => void;
  initialData?: IncomeItem | null;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Salary');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setSource(initialData.source);
      setDescription(initialData.description);
      setDate(initialData.date);
    } else {
      setAmount('');
      setSource('Salary');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave({
      amount: parsedAmount,
      source,
      description: description.trim() || `${source} Income`,
      date
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">
            {initialData ? 'Edit Income' : 'Add New Income'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Amount ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 3500.00"
              className="w-full bg-[#0f101c] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Income Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-[#0f101c] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Salary">Monthly Salary</option>
              <option value="Freelance">Freelance & Consulting</option>
              <option value="Business">Business Revenue</option>
              <option value="Investment">Dividends & Investment</option>
              <option value="Bonus">Bonus & Incentives</option>
              <option value="Gift">Gift & Allowance</option>
              <option value="Other">Other Source</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              maxLength={120}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Client Milestone Delivery"
              className="w-full bg-[#0f101c] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Income Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#0f101c] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition cursor-pointer"
            >
              {initialData ? 'Save Changes' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemDescription: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemDescription
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center text-slate-100">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-400 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-200">"{itemDescription}"</span>? This action cannot be undone.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-rose-950/40"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setUrl(localStorage.getItem('expenseflow_sb_url') || '');
    setKey(localStorage.getItem('expenseflow_sb_key') || '');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('expenseflow_sb_url', url.trim());
    localStorage.setItem('expenseflow_sb_key', key.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#17192a] border border-[#2d2f4a] rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Database & Supabase Config</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 my-3">
          ExpenseFlow supports both instant local browser storage and live Supabase PostgreSQL synchronization with Row Level Security.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full bg-[#0f101c] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Supabase Anon Key
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-[#0f101c] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setUrl('');
                setKey('');
                localStorage.removeItem('expenseflow_sb_url');
                localStorage.removeItem('expenseflow_sb_key');
              }}
              className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Clear & Use Local Storage
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Credentials</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
