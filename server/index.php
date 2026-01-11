<?php
// server/index.php

require_once __DIR__ . '/helpers/functions.php';
require_once __DIR__ . '/controllers/CompanyController.php';
require_once __DIR__ . '/controllers/AdminController.php';
require_once __DIR__ . '/controllers/DepartmentController.php';
require_once __DIR__ . '/controllers/DesignationController.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Parse the URI to extract path and potential ID
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'];

// Define routes
$routes = [
    '@/api/companies/login/?$@' => ['POST' => 'login'],
    '@/api/companies/me/?$@' => ['GET' => 'getCurrentProfile'],
    '@/api/companies/logout/?$@' => ['POST' => 'logout'],
    '@/api/companies/upload-logo/?$@' => ['POST' => 'uploadLogo'],
    '@/api/uploads/logos/(?P<filename>[^/]+)/?$@' => ['GET' => 'serveImage'],
    '@/api/companies/?$@' => ['GET' => 'index', 'POST' => 'store'],
    '@/api/companies/(\d+)/?$@' => ['GET' => 'show', 'PUT' => 'update', 'DELETE' => 'destroy'],
    '@/api/admins/login/?$@' => ['POST' => 'login'],
    '@/api/admins/me/?$@' => ['GET' => 'getCurrentProfile'],
    '@/api/admins/logout/?$@' => ['POST' => 'logout'],
    '@/api/admins/?$@' => ['GET' => 'index', 'POST' => 'store'],
    '@/api/admins/(\d+)/?$@' => ['GET' => 'show', 'PUT' => 'update', 'DELETE' => 'destroy'],
    '@/api/departments/?$@' => ['GET' => 'index', 'POST' => 'store'],
    '@/api/departments/(\d+)/?$@' => ['GET' => 'show', 'PUT' => 'update', 'DELETE' => 'destroy'],
    '@/api/designations/?$@' => ['GET' => 'index', 'POST' => 'store'],
    '@/api/designations/(\d+)/?$@' => ['GET' => 'show', 'PUT' => 'update', 'DELETE' => 'destroy'],
    '@/api/dashboard/stats/?$@' => ['GET' => 'getDashboardStats']
];

$matched = false;

foreach ($routes as $pattern => $actions) {
    if (preg_match($pattern, $path, $matches)) {
        // Determine which controller to use based on the route
        if (strpos($path, '/api/admins') !== false || strpos($path, '/api/dashboard') !== false) {
            $controller = new AdminController();
        } elseif (strpos($path, '/api/departments') !== false) {
            $controller = new DepartmentController();
        } elseif (strpos($path, '/api/designations') !== false) {
            $controller = new DesignationController();
        } else {
            $controller = new CompanyController();
        }
        
        if (isset($actions[$method])) {
            $action = $actions[$method];
            $requestData = array_merge($_GET, (getRequestData() ?: []));
            
            if (in_array($action, ['index', 'store', 'login', 'logout', 'getCurrentProfile', 'getDashboardStats', 'uploadLogo'])) {
                $controller->$action($requestData);
            } else {
                // For show, update, delete - we need the ID from the route
                $id = $matches[1] ?? null;
                // For serveImage, we need the filename from the route
                if ($action === 'serveImage') {
                    $filename = $matches['filename'] ?? $matches[1] ?? null;
                    $controller->$action($filename);
                } else {
                    $controller->$action($id, $requestData);
                }
            }
        } else {
            jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        }
        
        $matched = true;
        break;
    }
}

if (!$matched) {
    jsonResponse(['success' => false, 'message' => 'Route not found'], 404);
}