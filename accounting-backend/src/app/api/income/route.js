import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';

// GET - List all income
export async function GET() {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM income ORDER BY date DESC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income' },
      { status: 500 }
    );
  }
}

// POST - Create new income
export async function POST(request) {
  try {
    const data = await request.json();
    const { date, category, description, amount } = data;

    // Validate required fields
    if (!date || !category || !description || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      'INSERT INTO income (date, category, description, amount) VALUES (?, ?, ?, ?)',
      [date, category, description, amount]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Income created successfully'
    });
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json(
      { error: 'Failed to create income' },
      { status: 500 }
    );
  }
}

// PUT - Update income
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, date, category, description, amount } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Income ID is required' },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      'UPDATE income SET date = ?, category = ?, description = ?, amount = ? WHERE id = ?',
      [date, category, description, amount, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Income not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Income updated successfully'
    });
  } catch (error) {
    console.error('Error updating income:', error);
    return NextResponse.json(
      { error: 'Failed to update income' },
      { status: 500 }
    );
  }
}

// DELETE - Delete income
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Income ID is required' },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      'DELETE FROM income WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Income not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Income deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    return NextResponse.json(
      { error: 'Failed to delete income' },
      { status: 500 }
    );
  }
}