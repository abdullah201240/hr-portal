<?php

require_once __DIR__ . '/../models/Designation.php';
require_once __DIR__ . '/../helpers/functions.php';

class DesignationController
{
    private $designation;

    public function __construct()
    {
        $this->designation = new Designation();
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
            $designations = $this->designation->findByCompanyId($companyId, $limit, $offset, $search, $orderBy, $orderDir);
            $totalCount = $this->designation->countByCompanyId($companyId, $search);

            $response = [
                'success' => true,
                'data' => $designations,
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
            echo json_encode(['success' => false, 'message' => 'Error fetching designations: ' . $e->getMessage()]);
        }
    }

    public function show($id, $request = null)
    {
        $designation = $this->designation->findById($id);

        if (!$designation) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Designation not found']);
            return;
        }

        $response = [
            'success' => true,
            'data' => $designation
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
        $input['company_id'] = $companyId;

        $validationErrors = $this->designation->validate($input);
        if (!empty($validationErrors)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'errors' => $validationErrors]);
            return;
        }

        try {
            $designationId = $this->designation->create($input);
            if ($designationId) {
                $designation = $this->designation->findById($designationId);
                $response = [
                    'success' => true,
                    'message' => 'Designation created successfully',
                    'data' => $designation
                ];
                header('Content-Type: application/json');
                echo json_encode($response);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create designation']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error creating designation: ' . $e->getMessage()]);
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

        // Check if designation exists
        $existingDesignation = $this->designation->findById($id);
        if (!$existingDesignation) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Designation not found']);
            return;
        }
        
        // Check if the designation belongs to the authenticated company
        if ($existingDesignation['company_id'] != $companyId) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden - You can only update your own designations']);
            return;
        }

        $validationErrors = $this->designation->validate($input);
        if (!empty($validationErrors)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'errors' => $validationErrors]);
            return;
        }

        try {
            $result = $this->designation->update($id, $input);
            if ($result) {
                $updatedDesignation = $this->designation->findById($id);
                $response = [
                    'success' => true,
                    'message' => 'Designation updated successfully',
                    'data' => $updatedDesignation
                ];
                header('Content-Type: application/json');
                echo json_encode($response);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update designation']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error updating designation: ' . $e->getMessage()]);
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
        
        // Check if designation exists
        $existingDesignation = $this->designation->findById($id);
        if (!$existingDesignation) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Designation not found']);
            return;
        }
        
        // Check if the designation belongs to the authenticated company
        if ($existingDesignation['company_id'] != $companyId) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden - You can only delete your own designations']);
            return;
        }

        try {
            $result = $this->designation->delete($id);
            if ($result) {
                $response = [
                    'success' => true,
                    'message' => 'Designation deleted successfully'
                ];
                header('Content-Type: application/json');
                echo json_encode($response);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete designation']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error deleting designation: ' . $e->getMessage()]);
        }
    }

    public function getDepartments($request = null)
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
            $departments = $this->designation->getAllDepartments($companyId);
            $response = [
                'success' => true,
                'data' => $departments
            ];
            header('Content-Type: application/json');
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error fetching departments: ' . $e->getMessage()]);
        }
    }
}