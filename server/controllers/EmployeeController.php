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
    
    private function getCompanyIdFromToken()
    {
        $authHeader = null;
        
        // Method 1: Standard getallheaders() function
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            // Check for both Authorization and authorization (case-insensitive)
            foreach ($headers as $name => $value) {
                if (strtolower($name) === 'authorization') {
                    $authHeader = $value;
                    break;
                }
            }
        }
        
        // Method 2: Check for Authorization header in $_SERVER
        if (!$authHeader) {
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            }
        }
        
        if (!$authHeader || !preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
            return null;
        }
        
        $token = trim($matches[1]);
        
        // Validate the token and extract company ID
        // In our simple token system: company_{id}_{timestamp}
        if (!preg_match('/^company_(\d+)/', $token, $tokenMatches)) {
            return null;
        }
        
        return (int)$tokenMatches[1];
    }

    public function index($request = null)
    {
        $request = $request ?? $_GET;
        // Extract company ID from the authorization token
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
        }
        
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
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId || $employee['companyId'] != $companyId) {
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
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $request ?? [];
        }

        // Add company_id to the input
        $input['companyId'] = $companyId;

        $validationErrors = $this->employee->validate($input);
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
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error creating employee: ' . $e->getMessage()]);
        }
    }

    public function update($id, $request = null)
    {
        $request = $request ?? array_merge($_GET, getRequestData() ?: []);
        // Extract company ID from the authorization token
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $request;
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

        $validationErrors = $this->employee->validate($input);
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
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
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
}