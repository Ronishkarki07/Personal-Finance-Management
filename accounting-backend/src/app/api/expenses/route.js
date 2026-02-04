import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';

// GET - List all expenses
export async function GET() {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM expenses ORDER BY date DESC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST - Create new expense
export async function POST(request) {
  try {
    const data = await request.json();
    const { date, category, description, paymentMethod, amount, billPhoto } = data;

    // Validate required fields
    if (!date || !category || !description || !paymentMethod || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      'INSERT INTO expenses (date, category, description, payment_method, amount, bill_photo) VALUES (?, ?, ?, ?, ?, ?)',
      [date, category, description, paymentMethod, amount, billPhoto || null]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Expense created successfully'
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

// PUT - Update expense
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, date, category, description, paymentMethod, amount, billPhoto } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      'UPDATE expenses SET date = ?, category = ?, description = ?, payment_method = ?, amount = ?, bill_photo = ? WHERE id = ?',
      [date, category, description, paymentMethod, amount, billPhoto || null, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE - Delete expense
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      'DELETE FROM expenses WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}