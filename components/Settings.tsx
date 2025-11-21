import React, { useState } from 'react';
import { Moon, Sun, Bell, Shield, User, Plus, Trash2, Edit2, Check, X, Folder, Target } from 'lucide-react';
import { BudgetMap } from '../types';

interface SettingsProps {
  isDark: boolean;
  toggleTheme: () => void;
  categories: { income: string[]; expense: string[] };
  onAddCategory: (type: 'income' | 'expense', name: string) => void;
  onUpdateCategory: (type: 'income' | 'expense', oldName: string, newName: string) => void;
  onDeleteCategory: (type: 'income' | 'expense', name: string) => void;
  budgets: BudgetMap;
  onUpdateBudget: (category: string, limit: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  isDark, 
  toggleTheme,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  budgets,
  onUpdateBudget
}) => {
  const [activeCatTab, setActiveCatTab] = useState<'income' | 'expense'>('expense');
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (newCategory.trim()) {
      onAddCategory(activeCatTab, newCategory.trim());
      setNewCategory('');
    }
  };

  const startEditing = (cat: string) => {
    setEditingCategory(cat);
    setEditValue(cat);
  };

  const saveEdit = (oldName: string) => {
    if (editValue.trim() && editValue !== oldName) {
      onUpdateCategory(activeCatTab, oldName, editValue.trim());
    }
    setEditingCategory(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

      <div className="space-y-6">
        
        {/* Budget Configuration Section */}
        <div className="bg-white dark:bg-carddark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
           <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                    <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                 </div>
                 <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-lg">Budget Configuration</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Set monthly spending limits for your categories</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {categories.expense.map(cat => (
                    <div key={cat} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50">
                       <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat}</label>
                       <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">$</span>
                          <input 
                             type="number" 
                             value={budgets[cat] || ''}
                             onChange={(e) => onUpdateBudget(cat, parseFloat(e.target.value))}
                             placeholder="No Limit"
                             className="w-24 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-right text-sm outline-none focus:border-indigo-500"
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Category Management Section */}
        <div className="bg-white dark:bg-carddark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                <Folder className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-lg">Transaction Categories</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your income and expense categories</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg w-fit mb-6">
               <button 
                 onClick={() => setActiveCatTab('expense')}
                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                   activeCatTab === 'expense' 
                   ? 'bg-white dark:bg-slate-600 text-pink-600 dark:text-pink-400 shadow-sm' 
                   : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                 }`}
               >
                 Expenses
               </button>
               <button 
                 onClick={() => setActiveCatTab('income')}
                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                   activeCatTab === 'income' 
                   ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                   : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                 }`}
               >
                 Income
               </button>
            </div>

            {/* Add New */}
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={`Add new ${activeCatTab} category...`}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                onClick={handleAdd}
                disabled={!newCategory.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {categories[activeCatTab].map(cat => (
                 <div key={cat} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50 group">
                    {editingCategory === cat ? (
                       <div className="flex items-center gap-2 flex-1">
                         <input 
                           type="text" 
                           value={editValue}
                           onChange={(e) => setEditValue(e.target.value)}
                           className="flex-1 px-2 py-1 rounded border border-indigo-300 dark:border-indigo-500 bg-white dark:bg-slate-900 text-sm outline-none"
                           autoFocus
                         />
                         <button onClick={() => saveEdit(cat)} className="text-emerald-500 hover:text-emerald-600"><Check size={16} /></button>
                         <button onClick={() => setEditingCategory(null)} className="text-red-500 hover:text-red-600"><X size={16} /></button>
                       </div>
                    ) : (
                       <>
                         <span className="text-gray-700 dark:text-gray-300 font-medium">{cat}</span>
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditing(cat)} className="p-1 text-gray-400 hover:text-indigo-500 transition-colors">
                               <Edit2 size={16} />
                            </button>
                            <button onClick={() => onDeleteCategory(activeCatTab, cat)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                               <Trash2 size={16} />
                            </button>
                         </div>
                       </>
                    )}
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-carddark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {/* Appearance Section */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-slate-700 rounded-full">
                {isDark ? <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> : <Sun className="w-6 h-6 text-orange-500" />}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Appearance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize your dashboard theme</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                isDark ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Notifications (Mock) */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-50 dark:bg-slate-700 rounded-full">
                <Bell className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts for budget limits</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">On</div>
          </div>

          {/* Security (Mock) */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-slate-700 rounded-full">
                <Shield className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Security</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Two-factor authentication</p>
              </div>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Configure</button>
          </div>

          {/* Profile (Mock) */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-slate-700 rounded-full">
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Account</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your personal details</p>
              </div>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Edit</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;