<?php

require_once __DIR__ . '/../models/Employee.php';
require_once __DIR__ . '/../helpers/functions.php';

class EmployeeController
{
    private $employee;

    public function __construct()
    {
        $this->employee = new Employee();
    }
    
    public function login($request = null)
    {
        $request = $request ?? json_decode(file_get_contents('php://input'), true);
        
        if (empty($request['email']) || empty($request['password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email and password are required']);
            return;
        }

        $employee = $this->employee->findByEmail($request['email']);

        if ($employee && password_verify($request['password'], $employee['password'])) {
            // Generate a simple token
            $token = "employee_" . $employee['id'] . "_" . time();
            
            // Remove sensitive data
            unset($employee['password']);
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'token' => $token,
                    'user' => $employee
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        }
    }

    public function getCurrentProfile($request = null)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'employee') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $employeeId = $actor['id'];
        $employee = $this->employee->findById($employeeId);
        if ($employee) {
            unset($employee['password']);
            echo json_encode([
                'success' => true,
                'data' => $employee
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
        }
    }

    private function handleImageUpload($file)
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return null; // or throw an exception
        }
        
        // Create upload directory if it doesn't exist
        $uploadDir = "uploads/employees/";
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        $fileType = mime_content_type($file['tmp_name']);
        
        if (!in_array($fileType, $allowedTypes)) {
            return null; // Invalid file type
        }
        
        // Check file size (max 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            return null; // File too large
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $destination = $uploadDir . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            return null; // Failed to move file
        }
        
        return $destination;
    }

    public function index($request = null)
    {
        $request = $request ?? $_GET;
        // Extract company ID from the authorization token
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
        }
        $companyId = $actor['id'];
        
        try {
            $page = isset($request['page']) ? max(1, intval($request['page'])) : 1;
            $limit = isset($request['limit']) ? min(1000, max(1, intval($request['limit']))) : 10;
            $search = isset($request['search']) ? trim($request['search']) : '';
            $orderBy = isset($request['orderBy']) ? $request['orderBy'] : 'created_at';
            $orderDir = isset($request['orderDir']) ? strtoupper($request['orderDir']) : 'DESC';

            $offset = ($page - 1) * $limit;
            $employees = $this->employee->findByCompanyId($companyId, $limit, $offset, $search, $orderBy, $orderDir);
            $totalCount = $this->employee->countByCompanyId($companyId, $search);

            $response = [
                'success' => true,
                'data' => $employees,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $totalCount,
                    'pages' => ceil($totalCount / $limit)
                ]
            ];

            header('Content-Type: application/json');
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error fetching employees: ' . $e->getMessage()]);
        }
    }

    public function show($id, $request = null)
    {
        $employee = $this->employee->findById($id);

        if (!$employee) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
            return;
        }
        
        // Check if employee belongs to the authenticated company
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company' || $employee['companyId'] != $actor['id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden - You can only access your own employees']);
            return;
        }

        $response = [
            'success' => true,
            'data' => $employee
        ];

        header('Content-Type: application/json');
        echo json_encode($response);
    }

    public function store($request = null)
    {
        // Extract company ID from the authorization token
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
        }
        $companyId = $actor['id'];
        
        // Handle both JSON and FormData requests
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (strpos($contentType, 'application/json') !== false) {
            // JSON request
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                $input = $request ?? [];
            }
        } else {
            // FormData request - use $_POST data
            $input = $_POST;
            
            // If image was uploaded, process it
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploadedImagePath = $this->handleImageUpload($_FILES['image']);
                if ($uploadedImagePath) {
                    $input['image'] = $uploadedImagePath;
                }
            }
        }

        // Add company_id to the input
        $input['companyId'] = $companyId;

        $validationErrors = $this->employee->validate($input, false); // false indicates this is a create operation
        if (!empty($validationErrors)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'errors' => $validationErrors]);
            return;
        }

        try {
            $employeeId = $this->employee->create($input);
            if ($employeeId) {
                $employee = $this->employee->findById($employeeId);
                $response = [
                    'success' => true,
                    'message' => 'Employee created successfully',
                    'data' => $employee
                ];
                header('Content-Type: application/json');
                echo json_encode($response);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create employee']);
            }
        } catch (Exception $e) {
            $errorMessage = $e->getMessage();
            // Check if this is a validation error (starts with '{')
            if (substr($errorMessage, 0, 1) === '{') {
                http_response_code(422);
                echo json_encode(['success' => false, 'errors' => json_decode($errorMessage, true)]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error creating employee: ' . $errorMessage]);
            }
        }
    }

    public function update($id, $request = null)
    {
        $request = $request ?? array_merge($_GET, getRequestData() ?: []);
        // Extract company ID from the authorization token
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
        }
        $companyId = $actor['id'];
        
        // Handle both JSON and FormData requests
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (strpos($contentType, 'application/json') !== false) {
            // JSON request
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                $input = $request;
            }
        } else {
            // FormData request - use $_POST data
            $input = $_POST;
            
            // If image was uploaded, process it
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploadedImagePath = $this->handleImageUpload($_FILES['image']);
                if ($uploadedImagePath) {
                    $input['image'] = $uploadedImagePath;
                }
            }
        }

        // Check if employee exists
        $existingEmployee = $this->employee->findById($id);
        if (!$existingEmployee) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
            return;
        }
        
        // Check if the employee belongs to the authenticated company
        if ($existingEmployee['companyId'] != $companyId) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden - You can only update your own employees']);
            return;
        }

        $validationErrors = $this->employee->validate($input, true); // true indicates this is an update operation
        if (!empty($validationErrors)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'errors' => $validationErrors]);
            return;
        }

        try {
            $result = $this->employee->update($id, $input);
            if ($result) {
                $updatedEmployee = $this->employee->findById($id);
                $response = [
                    'success' => true,
                    'message' => 'Employee updated successfully',
                    'data' => $updatedEmployee
                ];
                header('Content-Type: application/json');
                echo json_encode($response);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update employee']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error updating employee: ' . $e->getMessage()]);
        }
    }

    public function destroy($id, $request = null)
    {
        // Extract company ID from the authorization token
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
        }
        $companyId = $actor['id'];
        
        // Check if employee exists
        $existingEmployee = $this->employee->findById($id);
        if (!$existingEmployee) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
            return;
        }
        
        // Check if the employee belongs to the authenticated company
        if ($existingEmployee['companyId'] != $companyId) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden - You can only delete your own employees']);
            return;
        }

        try {
            $result = $this->employee->delete($id);
            if ($result) {
                $response = [
                    'success' => true,
                    'message' => 'Employee deleted successfully'
                ];
                header('Content-Type: application/json');
                echo json_encode($response);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete employee']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error deleting employee: ' . $e->getMessage()]);
        }
    }

    public function verifyPassword($request = null)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'employee') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $request = $request ?? json_decode(file_get_contents('php://input'), true);
        if (empty($request['password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Current password is required']);
            return;
        }

        $employeeId = $actor['id'];
        $employee = $this->employee->findById($employeeId);

        if ($employee && password_verify($request['password'], $employee['password'])) {
            echo json_encode(['success' => true, 'message' => 'Password verified']);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Incorrect current password']);
        }
    }

    public function changePassword($request = null)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'employee') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $request = $request ?? json_decode(file_get_contents('php://input'), true);
        if (empty($request['new_password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'New password is required']);
            return;
        }

        $employeeId = $actor['id'];
        $result = $this->employee->update($employeeId, ['password' => $request['new_password']]);

        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to change password']);
        }
    }
}