<?php
// server/controllers/AdminController.php

require_once __DIR__ . '/../models/Admin.php';
require_once __DIR__ . '/../helpers/functions.php';

class AdminController
{
    private $admin;

    public function __construct()
    {
        $this->admin = new Admin();
    }

    public function index()
    {
        try {
            $admins = $this->admin->all();
            // Don't return password in the response
            foreach ($admins as &$admin) {
                unset($admin['password']);
            }
            jsonResponse(['success' => true, 'data' => $admins]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $admin = $this->admin->find($id);
            
            if (!$admin) {
                jsonResponse(['success' => false, 'message' => 'Admin not found'], 404);
            }
            
            // Don't return password in the response
            unset($admin['password']);
            jsonResponse(['success' => true, 'data' => $admin]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        try {
            $data = getRequestData();
            
            // Validate input
            $errors = $this->admin->validate($data);
            if (!empty($errors)) {
                jsonResponse(['success' => false, 'errors' => $errors], 422);
            }
            
            // Hash password before saving
            if (isset($data['password'])) {
                $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }
            
            $adminId = $this->admin->create($data);
            $createdAdmin = $this->admin->find($adminId);
            
            // Don't return password in the response
            unset($createdAdmin['password']);
            
            jsonResponse(['success' => true, 'message' => 'Admin created successfully', 'data' => $createdAdmin], 201);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update($id)
    {
        try {
            $data = getRequestData();
            
            // Validate input
            $errors = $this->admin->validate($data);
            if (!empty($errors)) {
                jsonResponse(['success' => false, 'errors' => $errors], 422);
            }
            
            // Hash password if provided
            if (isset($data['password'])) {
                $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }
            
            $result = $this->admin->update($id, $data);
            
            if (!$result) {
                jsonResponse(['success' => false, 'message' => 'Admin not found'], 404);
            }
            
            $updatedAdmin = $this->admin->find($id);
            
            // Don't return password in the response
            unset($updatedAdmin['password']);
            
            jsonResponse(['success' => true, 'message' => 'Admin updated successfully', 'data' => $updatedAdmin]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $result = $this->admin->delete($id);
            
            if (!$result) {
                jsonResponse(['success' => false, 'message' => 'Admin not found'], 404);
            }
            
            jsonResponse(['success' => true, 'message' => 'Admin deleted successfully']);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function login()
    {
        try {
            $data = getRequestData();
            
            if (empty($data['email']) || empty($data['password'])) {
                jsonResponse(['success' => false, 'message' => 'Email and password are required'], 400);
            }
            
            $result = $this->admin->authenticate($data['email'], $data['password']);
            
            if ($result === false) {
                jsonResponse(['success' => false, 'message' => 'Invalid credentials'], 401);
            }
            
            if (isset($result['error'])) {
                jsonResponse(['success' => false, 'message' => $result['error']], 401);
            }
            
            // Update last login time
            $this->admin->updateLastLogin($result['id']);
            
            // Don't return password in the response
            unset($result['password']);
            
            // Generate a simple token (in production, use JWT or similar)
            $token = 'admin_' . $result['id'] . '_' . time();
            
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
            
            error_log("Auth Header found: " . ($authHeader ? "Yes" : "No"));

            if (!$authHeader || !preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
                error_log("Authorization token missing or invalid format: " . $authHeader);
                jsonResponse(['success' => false, 'message' => 'Authorization token required'], 401);
            }
            
            $token = trim($matches[1]);
            error_log("Processing token: " . $token);
            
            // Validate the token and extract admin ID
            // In our simple token system: admin_{id}_{timestamp}
            if (!preg_match('/^admin_(\d+)/', $token, $tokenMatches)) {
                error_log("Token format invalid: " . $token);
                jsonResponse(['success' => false, 'message' => 'Invalid token format'], 401);
            }
            
            $adminId = (int)$tokenMatches[1];
            error_log("Extracted admin ID: " . $adminId);
            
            // Fetch admin by ID
            $admin = $this->admin->find($adminId);
            
            if (!$admin) {
                error_log("Admin not found for ID: " . $adminId);
                jsonResponse(['success' => false, 'message' => 'Admin not found'], 404);
            }
            
            // Don't return password in the response
            unset($admin['password']);
            
            jsonResponse([
                'success' => true, 
                'data' => $admin
            ]);
        } catch (Exception $e) {
            error_log("Error in getCurrentProfile: " . $e->getMessage());
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}