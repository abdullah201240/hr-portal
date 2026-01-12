<?php
// server/controllers/CompanyController.php

require_once __DIR__ . '/../models/Company.php';
require_once __DIR__ . '/../helpers/functions.php';

class CompanyController
{
    private $company;

    public function __construct()
    {
        $this->company = new Company();
    }

    public function index()
    {
        try {
            $companies = $this->company->all();
            // Don't return password in the response
            foreach ($companies as &$company) {
                unset($company['password']);
            }
            jsonResponse(['success' => true, 'data' => $companies]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $company = $this->company->find($id);
            
            if (!$company) {
                jsonResponse(['success' => false, 'message' => 'Company not found'], 404);
            }
            
            // Don't return password in the response
            unset($company['password']);
            jsonResponse(['success' => true, 'data' => $company]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        try {
            $data = getRequestData();
            
            // Validate input
            $errors = $this->company->validate($data, false); // false indicates this is a create operation
            if (!empty($errors)) {
                jsonResponse(['success' => false, 'errors' => $errors], 422);
            }
            
            // Set default status to inactive for new companies
            if (!isset($data['status'])) {
                $data['status'] = 'inactive';
            }
            
            $companyId = $this->company->create($data);
            $createdCompany = $this->company->find($companyId);
            
            // Don't return password in the response
            unset($createdCompany['password']);
            
            jsonResponse(['success' => true, 'message' => 'Company created successfully', 'data' => $createdCompany], 201);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update($id)
    {
        try {
            $data = getRequestData();
            
            // Validate input for update (with email uniqueness check excluding current record)
            $errors = $this->company->validateForUpdate($data, $id);
            if (!empty($errors)) {
                jsonResponse(['success' => false, 'errors' => $errors], 422);
            }
            
            $result = $this->company->update($id, $data);
            
            if (!$result) {
                jsonResponse(['success' => false, 'message' => 'Company not found'], 404);
            }
            
            $updatedCompany = $this->company->find($id);
            
            // Don't return password in the response
            unset($updatedCompany['password']);
            
            jsonResponse(['success' => true, 'message' => 'Company updated successfully', 'data' => $updatedCompany]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $result = $this->company->delete($id);
            
            if (!$result) {
                jsonResponse(['success' => false, 'message' => 'Company not found'], 404);
            }
            
            jsonResponse(['success' => true, 'message' => 'Company deleted successfully']);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getCurrentProfile()
    {
        try {
            // Extract token from Authorization header
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
            
            error_log("Company Auth Header found: " . ($authHeader ? "Yes" : "No"));

            if (!$authHeader || !preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
                error_log("Authorization token missing or invalid format: " . $authHeader);
                jsonResponse(['success' => false, 'message' => 'Authorization token required'], 401);
            }
            
            $token = trim($matches[1]);
            error_log("Processing company token: " . $token);
            
            // Validate the token and extract company ID
            // In our simple token system: company_{id}_{timestamp}
            if (!preg_match('/^company_(\d+)/', $token, $tokenMatches)) {
                error_log("Company token format invalid: " . $token);
                jsonResponse(['success' => false, 'message' => 'Invalid token format'], 401);
            }
            
            $companyId = (int)$tokenMatches[1];
            error_log("Extracted company ID: " . $companyId);
            
            // Fetch company by ID
            $company = $this->company->find($companyId);
            
            if (!$company) {
                error_log("Company not found for ID: " . $companyId);
                jsonResponse(['success' => false, 'message' => 'Company not found'], 404);
            }
            
            // Don't return password in the response
            unset($company['password']);
            
            jsonResponse([
                'success' => true, 
                'data' => $company
            ]);
        } catch (Exception $e) {
            error_log("Error in getCurrentProfile: " . $e->getMessage());
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function logout()
    {
        // In a real implementation, you would invalidate the token here
        // For now, we'll just return a success response
        // In a production system, you'd implement token blacklisting
        
        jsonResponse([
            'success' => true, 
            'message' => 'Logout successful'
        ]);
    }

    public function login()
    {
        try {
            $data = getRequestData();
            
            if (empty($data['email']) || empty($data['password'])) {
                jsonResponse(['success' => false, 'message' => 'Email and password are required'], 400);
            }
            
            $result = $this->company->authenticate($data['email'], $data['password']);
            
            if ($result === false) {
                jsonResponse(['success' => false, 'message' => 'Invalid credentials'], 401);
            }
            
            if (isset($result['error'])) {
                jsonResponse(['success' => false, 'message' => $result['error']], 401);
            }
            
            // Don't return password in the response
            unset($result['password']);
            
            // Generate a simple token (in production, use JWT or similar)
            $token = 'company_' . $result['id'] . '_' . time();
            
            jsonResponse([
                'success' => true, 
                'message' => 'Login successful', 
                'data' => $result,
                'token' => $token
            ]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function uploadLogo()
    {
        try {
            // Extract token from Authorization header
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
                jsonResponse(['success' => false, 'message' => 'Authorization token required'], 401);
            }
            
            $token = trim($matches[1]);
            
            // Validate the token and extract company ID
            // In our simple token system: company_{id}_{timestamp}
            if (!preg_match('/^company_(\d+)/', $token, $tokenMatches)) {
                jsonResponse(['success' => false, 'message' => 'Invalid token format'], 401);
            }
            
            $companyId = (int)$tokenMatches[1];
            
            // Check if file was uploaded
            if (!isset($_FILES['logo'])) {
                jsonResponse(['success' => false, 'message' => 'Logo file is required'], 400);
            }
            
            $file = $_FILES['logo'];
            
            try {
                // Upload the file
                $logoPath = uploadFile($file, 'uploads/logos/');
                
                // Update company record with logo path
                $data = ['logo' => $logoPath];
                $result = $this->company->update($companyId, $data);
                
                if (!$result) {
                    jsonResponse(['success' => false, 'message' => 'Company not found'], 404);
                }
                
                $updatedCompany = $this->company->find($companyId);
                unset($updatedCompany['password']);
                
                jsonResponse([
                    'success' => true,
                    'message' => 'Logo uploaded successfully',
                    'data' => $updatedCompany
                ], 200);
            } catch (Exception $e) {
                jsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
            }
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function serveImage($filename)
    {
        $filepath = 'uploads/logos/' . $filename;
        
        if (!file_exists($filepath)) {
            http_response_code(404);
            echo 'File not found';
            exit;
        }
        
        $mimeType = mime_content_type($filepath);

        // Set appropriate headers
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filepath));
        
        // Output the file
        readfile($filepath);
        exit;
    }
}