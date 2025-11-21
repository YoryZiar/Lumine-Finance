import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import Settings from './components/Settings';
import { Transaction, DashboardStats, View, CATEGORIES as DEFAULT_CATEGORIES, BudgetMap } from './types';
import { generateMockData } from './constants';
import { Plus, Menu, Search, Filter, Trash2, AlertTriangle, Calendar, Download } from 'lucide-react';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date Filter State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Theme State (persisted in localStorage ideally, but simplified here)
  const [isDark, setIsDark] = useState(true);

  // Category State
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // Budget State
  const [budgets, setBudgets] = useState<BudgetMap>({});

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    // Initial Data Load
    setTransactions(generateMockData());
    
    // Initialize some mock budgets
    setBudgets({
      'Food': 600,
      'Entertainment': 300,
      'Transport': 200,
      'Shopping': 400
    });
    
    // Apply theme on mount
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newVal = !prev;
      if (newVal) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newVal;
    });
  };

  // Calculate Stats
  const stats: DashboardStats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    return { totalIncome, totalExpense, balance, savingsRate };
  }, [transactions]);

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setTransactions(prev => prev.filter(t => t.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleAddCategory = (type: 'income' | 'expense', name: string) => {
    if (!name.trim() || categories[type].includes(name.trim())) return;
    setCategories(prev => ({
      ...prev,
      [type]: [...prev[type], name.trim()]
    }));
  };

  const handleUpdateCategory = (type: 'income' | 'expense', oldName: string, newName: string) => {
    if (!newName.trim() || categories[type].includes(newName.trim())) return;
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].map(c => c === oldName ? newName.trim() : c)
    }));
    
    // Update linked transactions
    setTransactions(prev => prev.map(t => 
      (t.type === type && t.category === oldName) ? { ...t, category: newName.trim() } : t
    ));

    // Update budgets if category name changes
    if (type === 'expense' && budgets[oldName]) {
      setBudgets(prev => {
        const newBudgets = { ...prev };
        newBudgets[newName.trim()] = newBudgets[oldName];
        delete newBudgets[oldName];
        return newBudgets;
      });
    }
  };

  const handleDeleteCategory = (type: 'income' | 'expense', name: string) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].filter(c => c !== name)
    }));
    // Remove budget if exists
    if (budgets[name]) {
      setBudgets(prev => {
        const newBudgets = { ...prev };
        delete newBudgets[name];
        return newBudgets;
      });
    }
  };

  const handleUpdateBudget = (category: string, limit: number) => {
    setBudgets(prev => {
      if (limit <= 0) {
        const { [category]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [category]: limit };
    });
  };

  const filteredTransactions = useMemo(() => {
      return transactions.filter(t => {
        const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStart = startDate ? t.date >= startDate : true;
        const matchesEnd = endDate ? t.date <= endDate : true;
        
        return matchesSearch && matchesStart && matchesEnd;
      });
  }, [transactions, searchTerm, startDate, endDate]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['Date', 'Category', 'Type', 'Description', 'Amount', 'ID'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => {
        const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;
        return [
          t.date,
          escape(t.category),
          t.type,
          escape(t.description),
          t.amount,
          t.id
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lumina_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-darkbg overflow-hidden">
      
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white/80 dark:bg-carddark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white capitalize">
              {currentView}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add New</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border-2 border-white dark:border-slate-800"></div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          
          {currentView === 'dashboard' && (
            <Dashboard 
              transactions={transactions} 
              stats={stats} 
              budgets={budgets}
            />
          )}

          {currentView === 'transactions' && (
            <div className="max-w-6xl mx-auto space-y-4 animate-fade-in">
                {/* Search Toolbar */}
               <div className="flex flex-col md:flex-row gap-4 mb-6">
                   <div className="relative flex-1">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input 
                         type="text" 
                         placeholder="Search transactions..." 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-carddark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                       />
                   </div>
                   <div className="flex gap-2 items-center flex-wrap">
                     <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-carddark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            placeholder="Start Date"
                        />
                     </div>
                     <span className="text-gray-400">-</span>
                     <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-carddark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            placeholder="End Date"
                        />
                     </div>
                     { (startDate || endDate) && (
                       <button 
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white underline"
                       >
                         Clear
                       </button>
                     )}
                     <button
                       onClick={handleExportCSV}
                       disabled={filteredTransactions.length === 0}
                       className="p-2 bg-white dark:bg-carddark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-2"
                       title="Export to CSV"
                     >
                        <Download size={20} />
                     </button>
                   </div>
               </div>

              <div className="bg-white dark:bg-carddark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{t.date}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                             t.type === 'income' 
                             ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                             : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                           }`}>
                             {t.category}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{t.description}</td>
                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                          {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                             onClick={() => setDeleteId(t.id)}
                             className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                             title="Delete Transaction"
                           >
                             <Trash2 size={18} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTransactions.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No transactions found matching your criteria.
                    </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'settings' && (
            <Settings 
              isDark={isDark} 
              toggleTheme={toggleTheme}
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              budgets={budgets}
              onUpdateBudget={handleUpdateBudget}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddForm && (
        <TransactionForm 
          onAdd={handleAddTransaction} 
          onClose={() => setShowAddForm(false)}
          categories={categories}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-carddark w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Transaction?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This action cannot be undone. Are you sure you want to remove this transaction?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;