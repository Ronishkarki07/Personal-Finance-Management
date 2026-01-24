<?php
// expenses.php - Handle expense CRUD
header('Content-Type: application/json');
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST': // Add expense
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('INSERT INTO expenses (date, category, description, payment_method, amount, bill_photo, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())');
        $stmt->execute([
            $data['date'],
            $data['category'],
            $data['description'],
            $data['paymentMethod'],
            $data['amount'],
            $data['billPhoto'] ?? null
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        break;
    case 'GET': // List expenses
        $stmt = $pdo->query('SELECT * FROM expenses ORDER BY date DESC');
        echo json_encode($stmt->fetchAll());
        break;
    // Add PUT, DELETE as needed
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
