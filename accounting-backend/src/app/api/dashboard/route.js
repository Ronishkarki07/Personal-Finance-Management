import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';

// GET - Dashboard statistics
export async function GET() {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get current month income and expenses
    const [incomeResult] = await db.execute(
      'SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE MONTH(date) = ? AND YEAR(date) = ?',
      [currentMonth, currentYear]
    );

    const [expenseResult] = await db.execute(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE MONTH(date) = ? AND YEAR(date) = ?',
      [currentMonth, currentYear]
    );

    // Get recent transactions
    const [recentIncome] = await db.execute(
      'SELECT "income" as type, date, category, description, amount FROM income ORDER BY date DESC LIMIT 5'
    );

    const [recentExpenses] = await db.execute(
      'SELECT "expense" as type, date, category, description, amount FROM expenses ORDER BY date DESC LIMIT 5'
    );

    // Combine and sort recent transactions
    const recentTransactions = [...recentIncome, ...recentExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Get expense categories for current month
    const [expenseCategories] = await db.execute(
      'SELECT category, SUM(amount) as total FROM expenses WHERE MONTH(date) = ? AND YEAR(date) = ? GROUP BY category ORDER BY total DESC',
      [currentMonth, currentYear]
    );

    // Get income categories for current month
    const [incomeCategories] = await db.execute(
      'SELECT category, SUM(amount) as total FROM income WHERE MONTH(date) = ? AND YEAR(date) = ? GROUP BY category ORDER BY total DESC',
      [currentMonth, currentYear]
    );

    return NextResponse.json({
      currentMonth: {
        income: Number(incomeResult[0].total),
        expenses: Number(expenseResult[0].total),
        balance: Number(incomeResult[0].total) - Number(expenseResult[0].total)
      },
      recentTransactions,
      expenseCategories: expenseCategories.map(cat => ({
        category: cat.category,
        total: Number(cat.total)
      })),
      incomeCategories: incomeCategories.map(cat => ({
        category: cat.category,
        total: Number(cat.total)
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}