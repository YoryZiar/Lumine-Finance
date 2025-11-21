import React, { useMemo, useState } from 'react';
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { Transaction, DashboardStats, BudgetMap } from '../types';
import { generateFinancialInsight } from '../services/geminiService';
import { Sparkles, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  stats: DashboardStats;
  budgets: BudgetMap;
}

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#3b82f6'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, stats, budgets }) => {
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // --- Data Processing for Charts ---

  // 1. Daily Trend (Area Chart)
  const dailyData = useMemo(() => {
    const map = new Map<string, { date: string; income: number; expense: number }>();
    // Initialize last 30 days
    for(let i=29; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        map.set(dateStr, { date: dateStr, income: 0, expense: 0 });
    }

    transactions.forEach(t => {
      if (map.has(t.date)) {
        const entry = map.get(t.date)!;
        if (t.type === 'income') entry.income += t.amount;
        else entry.expense += t.amount;
      }
    });
    return Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date));
  }, [transactions]);

  // 2. Expense by Category (Pie)
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // 3. Income by Category (Donut)
  const incomeByCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === 'income').forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // 4. Budget Calculations (Current Month)
  const budgetStatus = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const expenses = new Map<string, number>();
    
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        expenses.set(t.category, (expenses.get(t.category) || 0) + t.amount);
      }
    });

    const status = Object.entries(budgets).map(([category, limit]) => {
      const spent = expenses.get(category) || 0;
      const percent = Math.min((spent / limit) * 100, 100);
      return { category, limit, spent, percent };
    });
    
    // Sort by highest percentage usage
    return status.sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit));
  }, [transactions, budgets]);

  const handleGenerateInsight = async () => {
    setIsLoadingAi(true);
    const insight = await generateFinancialInsight(transactions);
    setAiInsight(insight);
    setIsLoadingAi(false);
  };

  // Helper for currency formatting
  const fmt = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Balance" 
          value={fmt(stats.balance)} 
          icon={<Wallet className="w-6 h-6 text-indigo-500" />} 
          trend="+5.2%" 
          trendUp={true}
        />
        <StatCard 
          title="Total Income (60d)" 
          value={fmt(stats.totalIncome)} 
          icon={<TrendingUp className="w-6 h-6 text-emerald-500" />} 
          trend="+12%" 
          trendUp={true}
        />
        <StatCard 
          title="Total Expense (60d)" 
          value={fmt(stats.totalExpense)} 
          icon={<TrendingDown className="w-6 h-6 text-pink-500" />} 
          trend="-2.4%" 
          trendUp={false} // meaning expenses went down (good)
        />
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="text-sm font-medium opacity-90">AI Financial Advisor</h3>
             <p className="text-xs opacity-75 mt-1">Powered by Gemini 2.5 Flash</p>
             <button 
               onClick={handleGenerateInsight}
               disabled={isLoadingAi}
               className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
             >
               <Sparkles className="w-4 h-4" />
               {isLoadingAi ? 'Thinking...' : 'Get Insights'}
             </button>
           </div>
           <div className="absolute -bottom-4 -right-4 opacity-20">
             <Sparkles className="w-32 h-32" />
           </div>
        </div>
      </div>

      {/* AI Insights Section (Conditional) */}
      {aiInsight && (
        <div className="bg-white dark:bg-carddark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg">Smart Insights</h3>
          </div>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {aiInsight}
          </div>
        </div>
      )}

      {/* Charts Grid - 3x3 Layout Concept (Adjusted to cols for responsiveness) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Income vs Expense Trend (Line/Area) - Spans 2 cols */}
        <div className="lg:col-span-2 bg-white dark:bg-carddark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-6">Cash Flow Trend (Last 30 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.1} />
                <XAxis dataKey="date" tickFormatter={(str) => str.slice(5)} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Budget Status (Replacing Net Daily Balance or adding to grid) - Let's Replace Net Daily for now as it's similar to Trend */}
        <div className="bg-white dark:bg-carddark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-4">
             <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
             <h3 className="text-lg font-semibold">Monthly Budgets</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {budgetStatus.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 text-sm">
                   <p>No budgets set.</p>
                   <p>Configure them in Settings.</p>
                </div>
            ) : (
                budgetStatus.map((item) => {
                    let barColor = 'bg-emerald-500';
                    const usage = item.spent / item.limit;
                    if (usage > 1.0) barColor = 'bg-rose-500';
                    else if (usage > 0.8) barColor = 'bg-amber-500';
                    
                    return (
                        <div key={item.category}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                                <span className="text-gray-500 dark:text-gray-400">
                                    ${Math.round(item.spent)} / ${item.limit}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${barColor} transition-all duration-500`} 
                                    style={{ width: `${Math.min(usage * 100, 100)}%` }}
                                />
                            </div>
                            {usage > 1 && (
                                <p className="text-xs text-rose-500 mt-1 font-medium">Over budget by ${Math.round(item.spent - item.limit)}</p>
                            )}
                        </div>
                    );
                })
            )}
          </div>
        </div>

        {/* Chart 3: Expense Breakdown (Pie) */}
        <div className="bg-white dark:bg-carddark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Expense Breakdown</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="text-center">
                 <span className="block text-2xl font-bold text-gray-800 dark:text-white">{expenseByCategory.length}</span>
                 <span className="text-xs text-gray-500">Categories</span>
               </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
             {expenseByCategory.slice(0,4).map((entry, index) => (
               <div key={entry.name} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                 <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                 {entry.name}
               </div>
             ))}
          </div>
        </div>

        {/* Chart 4: Income Sources (Donut/Radial) */}
        <div className="bg-white dark:bg-carddark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Income Sources</h3>
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Activity Heatmap Style (Scatter or Line) - Simplified as a smoothed Line */}
        <div className="bg-white dark:bg-carddark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-6">Daily Volatility</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.1} />
                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                 <Line type="natural" dataKey="expense" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Component for Stat Cards
const StatCard = ({ title, value, icon, trend, trendUp }: { title: string, value: string, icon: React.ReactNode, trend: string, trendUp: boolean }) => (
  <div className="bg-white dark:bg-carddark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:scale-[1.02]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{value}</h3>
      </div>
      <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
        trendUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      }`}>
        {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend}
      </span>
      <span className="text-xs text-gray-400">vs last month</span>
    </div>
  </div>
);

export default Dashboard;