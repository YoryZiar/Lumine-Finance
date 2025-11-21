import { Transaction, CATEGORIES } from "./types";

export const generateMockData = (): Transaction[] => {
  const data: Transaction[] = [];
  const now = new Date();

  // Generate data for past 60 days
  for (let i = 0; i < 60; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Random chance for transaction
    const numTransactions = Math.floor(Math.random() * 3) + 1; // 1 to 3 per day

    for (let j = 0; j < numTransactions; j++) {
      const isIncome = Math.random() > 0.7; // 30% chance of income
      const type = isIncome ? 'income' : 'expense';
      const categories = isIncome ? CATEGORIES.income : CATEGORIES.expense;
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Variable amounts based on type
      let amount = 0;
      if (isIncome) {
        amount = category === 'Salary' ? 2500 : Math.floor(Math.random() * 500) + 50;
      } else {
        amount = category === 'Rent' ? 1200 : Math.floor(Math.random() * 150) + 10;
      }

      // Only add rent/salary once a month approx
      if ((category === 'Salary' || category === 'Rent') && date.getDate() !== 1) {
         // Skip if not 1st of month for major recurring
         // But add small filler transactions
         if (Math.random() > 0.2) continue; 
         amount = Math.floor(Math.random() * 50) + 10; // Small adjustment
      }

      data.push({
        id: Math.random().toString(36).substr(2, 9),
        date: dateStr,
        amount: parseFloat(amount.toFixed(2)),
        type: type as 'income' | 'expense',
        category: category,
        description: `${type} - ${category}`,
      });
    }
  }
  
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};