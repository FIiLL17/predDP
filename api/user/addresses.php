<?php
// /api/user/addresses.php - ПОЛНЫЙ ФУНКЦИОНАЛ

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

// Обрабатываем предварительный запрос OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Функция для получения токена
function getToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return trim($matches[1]);
        }
    }
    return null;
}

// Функция для возврата ошибки
function sendError($message, $code = 500) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit();
}

// Функция для возврата успеха
function sendSuccess($data = [], $message = 'Успешно') {
    echo json_encode(['success' => true, 'message' => $message] + $data);
    exit();
}

// Получаем токен
$token = getToken();
if (!$token) {
    sendError('Токен не предоставлен', 401);
}

// Подключаемся к БД
try {
    $host = '127.0.0.1:3306';
    $dbname = 'vinylneon_db';
    $username = 'root';
    $password = '';
    
    $conn = new mysqli($host, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        sendError('Ошибка подключения к БД: ' . $conn->connect_error);
    }
    
    // Ищем пользователя по токену
    $stmt = $conn->prepare("SELECT id FROM users WHERE token = ?");
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Пользователь не найден', 401);
    }
    
    $user = $result->fetch_assoc();
    $user_id = $user['id'];
    
    // Обрабатываем разные методы
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Если передан ID адреса - получаем один адрес
        if (isset($_GET['id'])) {
            $address_id = intval($_GET['id']);
            
            $addressStmt = $conn->prepare("
                SELECT * FROM user_delivery_addresses 
                WHERE id = ? AND user_id = ?
            ");
            $addressStmt->bind_param('ii', $address_id, $user_id);
            $addressStmt->execute();
            $addressResult = $addressStmt->get_result();
            
            if ($addressResult->num_rows === 0) {
                sendError('Адрес не найден', 404);
            }
            
            $address = $addressResult->fetch_assoc();
            sendSuccess(['address' => $address], 'Адрес загружен');
            
        } else {
            // Получаем все адреса пользователя
            $addressStmt = $conn->prepare("
                SELECT * FROM user_delivery_addresses 
                WHERE user_id = ? 
                ORDER BY is_default DESC, created_at DESC
            ");
            $addressStmt->bind_param('i', $user_id);
            $addressStmt->execute();
            $addressResult = $addressStmt->get_result();
            
            $addresses = [];
            while ($row = $addressResult->fetch_assoc()) {
                $addresses[] = $row;
            }
            
            sendSuccess([
                'addresses' => $addresses
            ], 'Адреса загружены');
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // СОЗДАНИЕ нового адреса
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data) {
            sendError('Некорректные данные', 400);
        }
        
        // Валидация обязательных полей
        $requiredFields = ['full_name', 'phone', 'city', 'street', 'house'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                sendError("Поле '$field' обязательно для заполнения", 400);
            }
        }
        
        // Если устанавливается адрес по умолчанию, сбрасываем предыдущий
        if (isset($data['is_default']) && $data['is_default']) {
            $resetStmt = $conn->prepare("
                UPDATE user_delivery_addresses 
                SET is_default = 0 
                WHERE user_id = ?
            ");
            $resetStmt->bind_param('i', $user_id);
            $resetStmt->execute();
            $resetStmt->close();
        }
        
        // Подготавливаем значения
        $title = $data['title'] ?? 'Дом';
        $full_name = $data['full_name'] ?? '';
        $phone = $data['phone'] ?? '';
        $city = $data['city'] ?? '';
        $street = $data['street'] ?? '';
        $house = $data['house'] ?? '';
        $building = $data['building'] ?? '';
        $entrance = $data['entrance'] ?? '';
        $floor = $data['floor'] ?? '';
        $apartment = $data['apartment'] ?? '';
        $notes = $data['notes'] ?? '';
        $is_office = isset($data['is_office']) ? ($data['is_office'] ? 1 : 0) : 0;
        $is_default = isset($data['is_default']) ? ($data['is_default'] ? 1 : 0) : 0;
        
        // Вставляем новый адрес
        $insertStmt = $conn->prepare("
            INSERT INTO user_delivery_addresses 
            (user_id, title, full_name, phone, city, street, house, building, 
             entrance, floor, apartment, is_office, is_default, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $insertStmt->bind_param(
            'issssssssssiis',
            $user_id,
            $title,
            $full_name,
            $phone,
            $city,
            $street,
            $house,
            $building,
            $entrance,
            $floor,
            $apartment,
            $is_office,
            $is_default,
            $notes
        );
        
        if ($insertStmt->execute()) {
            $address_id = $insertStmt->insert_id;
            
            // Получаем созданный адрес
            $selectStmt = $conn->prepare("
                SELECT * FROM user_delivery_addresses WHERE id = ?
            ");
            $selectStmt->bind_param('i', $address_id);
            $selectStmt->execute();
            $newAddress = $selectStmt->get_result()->fetch_assoc();
            $selectStmt->close();
            
            sendSuccess([
                'address_id' => $address_id,
                'address' => $newAddress
            ], 'Адрес успешно создан');
        } else {
            sendError('Ошибка создания адреса: ' . $insertStmt->error);
        }
        
        $insertStmt->close();
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // ОБНОВЛЕНИЕ существующего адреса
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data || !isset($data['id'])) {
            sendError('Некорректные данные или отсутствует ID адреса', 400);
        }
        
        $address_id = intval($data['id']);
        
        // Проверяем, принадлежит ли адрес пользователю
        $checkStmt = $conn->prepare("
            SELECT * FROM user_delivery_addresses 
            WHERE id = ? AND user_id = ?
        ");
        $checkStmt->bind_param('ii', $address_id, $user_id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendError('Адрес не найден или не принадлежит вам', 404);
        }
        
        $existingAddress = $checkResult->fetch_assoc();
        
        // Если устанавливается адрес по умолчанию, сбрасываем предыдущий
        if (isset($data['is_default']) && $data['is_default']) {
            $resetStmt = $conn->prepare("
                UPDATE user_delivery_addresses 
                SET is_default = 0 
                WHERE user_id = ? AND id != ?
            ");
            $resetStmt->bind_param('ii', $user_id, $address_id);
            $resetStmt->execute();
            $resetStmt->close();
        }
        
        // Подготавливаем значения: берем существующие, затем перезаписываем переданными
        $title = isset($data['title']) ? $data['title'] : $existingAddress['title'];
        $full_name = isset($data['full_name']) ? $data['full_name'] : $existingAddress['full_name'];
        $phone = isset($data['phone']) ? $data['phone'] : $existingAddress['phone'];
        $city = isset($data['city']) ? $data['city'] : $existingAddress['city'];
        $street = isset($data['street']) ? $data['street'] : $existingAddress['street'];
        $house = isset($data['house']) ? $data['house'] : $existingAddress['house'];
        $building = isset($data['building']) ? $data['building'] : $existingAddress['building'];
        $entrance = isset($data['entrance']) ? $data['entrance'] : $existingAddress['entrance'];
        $floor = isset($data['floor']) ? $data['floor'] : $existingAddress['floor'];
        $apartment = isset($data['apartment']) ? $data['apartment'] : $existingAddress['apartment'];
        $notes = isset($data['notes']) ? $data['notes'] : $existingAddress['notes'];
        $is_office = isset($data['is_office']) ? $data['is_office'] : $existingAddress['is_office'];
        $is_default = isset($data['is_default']) ? $data['is_default'] : $existingAddress['is_default'];
        
        // Обновляем адрес
        $updateStmt = $conn->prepare("
            UPDATE user_delivery_addresses 
            SET title = ?, full_name = ?, phone = ?, city = ?, street = ?, 
                house = ?, building = ?, entrance = ?, floor = ?, apartment = ?, 
                is_office = ?, is_default = ?, notes = ?
            WHERE id = ? AND user_id = ?
        ");
        
        $updateStmt->bind_param(
            'ssssssssssiiiii',
            $title,
            $full_name,
            $phone,
            $city,
            $street,
            $house,
            $building,
            $entrance,
            $floor,
            $apartment,
            $is_office,
            $is_default,
            $notes,
            $address_id,
            $user_id
        );
        
        if ($updateStmt->execute()) {
            // Получаем обновленный адрес
            $selectStmt = $conn->prepare("
                SELECT * FROM user_delivery_addresses WHERE id = ?
            ");
            $selectStmt->bind_param('i', $address_id);
            $selectStmt->execute();
            $updatedAddress = $selectStmt->get_result()->fetch_assoc();
            $selectStmt->close();
            
            sendSuccess([
                'address' => $updatedAddress
            ], 'Адрес успешно обновлен');
        } else {
            sendError('Ошибка обновления адреса: ' . $updateStmt->error);
        }
        
        $updateStmt->close();
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // УДАЛЕНИЕ адреса
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data || !isset($data['id'])) {
            sendError('Не указан ID адреса', 400);
        }
        
        $address_id = intval($data['id']);
        
        // Проверяем, принадлежит ли адрес пользователю
        $checkStmt = $conn->prepare("
            SELECT id, is_default FROM user_delivery_addresses 
            WHERE id = ? AND user_id = ?
        ");
        $checkStmt->bind_param('ii', $address_id, $user_id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendError('Адрес не найден или не принадлежит вам', 404);
        }
        
        $address = $checkResult->fetch_assoc();
        
        // Удаляем адрес
        $deleteStmt = $conn->prepare("
            DELETE FROM user_delivery_addresses 
            WHERE id = ? AND user_id = ?
        ");
        $deleteStmt->bind_param('ii', $address_id, $user_id);
        
        if ($deleteStmt->execute()) {
            // Если удалили адрес по умолчанию, устанавливаем новый
            if ($address['is_default']) {
                $findNewDefault = $conn->prepare("
                    SELECT id FROM user_delivery_addresses 
                    WHERE user_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT 1
                ");
                $findNewDefault->bind_param('i', $user_id);
                $findNewDefault->execute();
                $newDefaultResult = $findNewDefault->get_result();
                
                if ($newDefaultResult->num_rows > 0) {
                    $newDefault = $newDefaultResult->fetch_assoc();
                    $setDefaultStmt = $conn->prepare("
                        UPDATE user_delivery_addresses 
                        SET is_default = 1 
                        WHERE id = ? AND user_id = ?
                    ");
                    $setDefaultStmt->bind_param('ii', $newDefault['id'], $user_id);
                    $setDefaultStmt->execute();
                    $setDefaultStmt->close();
                }
                $findNewDefault->close();
            }
            
            sendSuccess([], 'Адрес успешно удален');
        } else {
            sendError('Ошибка удаления адреса: ' . $deleteStmt->error);
        }
        
        $deleteStmt->close();
    } else {
        sendError('Метод не поддерживается', 405);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Ошибка в addresses.php: " . $e->getMessage());
    sendError('Внутренняя ошибка сервера');
}
?>