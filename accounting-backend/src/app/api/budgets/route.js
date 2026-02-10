import { NextResponse } from 'next/server';
import db from '../../../lib/db';

// GET - Fetch budgets
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  try {
    let query = `
      SELECT 
        b.id,
        b.category,
        b.amount as budget_amount,
        b.month,
        b.year,
        b.created_at,
        COALESCE(SUM(e.amount), 0) as spent_amount,
        (b.amount - COALESCE(SUM(e.amount), 0)) as remaining_amount,
        CASE 
          WHEN COALESCE(SUM(e.amount), 0) = 0 THEN 0
          ELSE ROUND((COALESCE(SUM(e.amount), 0) / b.amount) * 100, 2)
        END as spent_percentage
      FROM budgets b
      LEFT JOIN expenses e ON b.category = e.category 
        AND MONTH(e.date) = b.month 
        AND YEAR(e.date) = b.year
    `;

    const params = [];
    const conditions = [];

    if (month) {
      conditions.push('b.month = ?');
      params.push(parseInt(month));
    }

    if (year) {
      conditions.push('b.year = ?');
      params.push(parseInt(year));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY b.id, b.category, b.amount, b.month, b.year, b.created_at ORDER BY b.category';

    const [rows] = await db.execute(query, params);

    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

// POST - Create budget
export async function POST(request) {
  try {
    const body = await request.json();
    const { category, amount, month, year } = body;

    if (!category || !amount || !month || !year) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO budgets (category, amount, month, year) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE amount = VALUES(amount)
    `;

    const [result] = await db.execute(query, [category, parseFloat(amount), parseInt(month), parseInt(year)]);

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertId,
        category,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year)
      }
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}

// PUT - Update budget
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, category, amount, month, year } = body;

    if (!id || !category || !amount || !month || !year) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE budgets 
      SET category = ?, amount = ?, month = ?, year = ?
      WHERE id = ?
    `;

    const [result] = await db.execute(query, [category, parseFloat(amount), parseInt(month), parseInt(year), parseInt(id)]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: parseInt(id),
        category,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year)
      }
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

// DELETE - Delete budget
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Budget ID is required' },
      { status: 400 }
    );
  }

  try {
    const query = 'DELETE FROM budgets WHERE id = ?';
    const [result] = await db.execute(query, [parseInt(id)]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}