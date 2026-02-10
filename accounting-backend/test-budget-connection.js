import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'accounting_system',
};

console.log('Testing budget API with config:', {
    ...dbConfig,
    password: dbConfig.password ? '***' : '(empty)'
});

async function testBudgetQuery() {
    let connection;
    try {
        console.log('\n1. Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected successfully!');

        const month = 2;
        const year = 2026;

        console.log(`\n2. Testing budget query for month=${month}, year=${year}...`);

        const query = `
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
      WHERE b.month = ? AND b.year = ?
      GROUP BY b.id, b.category, b.amount, b.month, b.year, b.created_at 
      ORDER BY b.category
    `;

        const [rows] = await connection.execute(query, [month, year]);
        console.log('✅ Query executed successfully!');
        console.log(`Found ${rows.length} budget(s)`);
        console.log('Results:', JSON.stringify(rows, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n3. Connection closed.');
        }
    }
}

testBudgetQuery();
