<?php

require_once __DIR__ . '/../models/Department.php';

class DepartmentController
{
    private $department;

    public function __construct()
    {
        $this->department = new Department();
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

    public function index($request)
    {
        // Extract company ID from the authorization token
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
        }
        
        $page = isset($request['page']) ? max(1, intval($request['page'])) : 1;
        $limit = isset($request['limit']) ? min(100, max(1, intval($request['limit']))) : 10;
        $search = isset($request['search']) ? trim($request['search']) : '';
        $orderBy = isset($request['orderBy']) ? $request['orderBy'] : 'created_at';
        $orderDir = isset($request['orderDir']) ? strtoupper($request['orderDir']) : 'DESC';

        $offset = ($page - 1) * $limit;
        $departments = $this->department->findByCompanyId($companyId, $limit, $offset, $search, $orderBy, $orderDir);
        $totalCount = $this->department->countByCompanyId($companyId, $search);

        $response = [
            'success' => true,
            'data' => $departments,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $totalCount,
                'pages' => ceil($totalCount / $limit)
            ]
        ];

        header('Content-Type: application/json');
        echo json_encode($response);
    }

    public function show($request, $id)
    {
        $department = $this->department->findById($id);

        if (!$department) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Department not found']);
            return;
        }

        $response = [
            'success' => true,
            'data' => $department
        ];

        header('Content-Type: application/json');
        echo json_encode($response);
    }

    public function store($request)
    {
        // Extract company ID from the authorization token
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Add company_id to the input
        $input['company_id'] = $companyId;

        $validationErrors = $this->department->validate($input);
        if (!empty($validationErrors)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'errors' => $validationErrors]);
            return;
        }

        try {
            $departmentId = $this->department->create($input);
            if ($departmentId) {
                $department = $this->department->findById($departmentId);
                $response = [
                    'success' => true,
                    'message' => 'Department created successfully',
                    'data' => $department
                ];
                header('Content-Type: application/json');
                echo json_encode($response);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create department']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error creating department: ' . $e->getMessage()]);
        }
    }

    public function update($request, $id)
    {
        // Extract company ID from the authorization token
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);

        // Check if department exists
        $existingDepartment = $this->department->findById($id);
        if (!$existingDepartment) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Department not found']);
            return;
        }
        
        // Check if the department belongs to the authenticated company
        if ($existingDepartment['company_id'] != $companyId) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden - You can only update your own departments']);
            return;
        }

        $validationErrors = $this->department->validate($input);
        if (!empty($validationErrors)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'errors' => $validationErrors]);
            return;
        }

        try {
            $result = $this->department->update($id, $input);
            if ($result) {
                $updatedDepartment = $this->department->findById($id);
                $response = [
                    'success' => true,
                    'message' => 'Department updated successfully',
                    'data' => $updatedDepartment
                ];
                header('Content-Type: application/json');
                echo json_encode($response);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update department']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error updating department: ' . $e->getMessage()]);
        }
    }

    public function destroy($request, $id)
    {
        // Extract company ID from the authorization token
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized - Invalid or missing token']);
            return;
        }
        
        // Check if department exists
        $existingDepartment = $this->department->findById($id);
        if (!$existingDepartment) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Department not found']);
            return;
        }
        
        // Check if the department belongs to the authenticated company
        if ($existingDepartment['company_id'] != $companyId) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden - You can only delete your own departments']);
            return;
        }

        try {
            $result = $this->department->delete($id);
            if ($result) {
                $response = [
                    'success' => true,
                    'message' => 'Department deleted successfully'
                ];
                header('Content-Type: application/json');
                echo json_encode($response);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete department']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error deleting department: ' . $e->getMessage()]);
        }
    }
}