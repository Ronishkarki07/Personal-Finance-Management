import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';

// GET - List all goals
export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT 
        id,
        title,
        description,
        target_amount,
        current_amount,
        target_date,
        created_at,
        updated_at,
        CASE 
          WHEN current_amount >= target_amount THEN 'completed'
          WHEN target_date < CURDATE() AND current_amount < target_amount THEN 'overdue'
          WHEN target_date IS NOT NULL AND DATEDIFF(target_date, CURDATE()) <= 30 THEN 'urgent'
          ELSE 'active'
        END as status,
        ROUND((current_amount / target_amount) * 100, 2) as progress_percentage
      FROM goals 
      ORDER BY created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST - Create new goal
export async function POST(request) {
  try {
    const data = await request.json();
    const { title, description, target_amount, current_amount, target_date } = data;

    // Validate required fields
    if (!title || !target_amount || target_amount <= 0) {
      return NextResponse.json(
        { error: 'Title and valid target amount are required' },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      'INSERT INTO goals (title, description, target_amount, current_amount, target_date) VALUES (?, ?, ?, ?, ?)',
      [
        title, 
        description || null, 
        target_amount, 
        current_amount || 0, 
        target_date || null
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Goal created successfully'
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}

// PUT - Update goal
export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, title, description, target_amount, current_amount, target_date } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (target_amount !== undefined) {
      updateFields.push('target_amount = ?');
      updateValues.push(target_amount);
    }
    if (current_amount !== undefined) {
      updateFields.push('current_amount = ?');
      updateValues.push(current_amount);
    }
    if (target_date !== undefined) {
      updateFields.push('target_date = ?');
      updateValues.push(target_date);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateValues.push(id);
    
    const [result] = await db.execute(
      `UPDATE goals SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Goal updated successfully'
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

// DELETE - Delete goal
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    const [result] = await db.execute('DELETE FROM goals WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}