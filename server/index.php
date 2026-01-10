<?php
// server/index.php

require_once __DIR__ . '/helpers/functions.php';
require_once __DIR__ . '/controllers/CompanyController.php';
require_once __DIR__ . '/controllers/AdminController.php';

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
    '@/api/companies/?$@' => ['GET' => 'index', 'POST' => 'store'],
    '@/api/companies/(\d+)/?$@' => ['GET' => 'show', 'PUT' => 'update', 'DELETE' => 'destroy'],
    '@/api/admins/login/?$@' => ['POST' => 'login'],
    '@/api/admins/logout/?$@' => ['POST' => 'logout'],
    '@/api/admins/?$@' => ['GET' => 'index', 'POST' => 'store'],
    '@/api/admins/(\d+)/?$@' => ['GET' => 'show', 'PUT' => 'update', 'DELETE' => 'destroy']
];

$matched = false;

foreach ($routes as $pattern => $actions) {
    if (preg_match($pattern, $path, $matches)) {
        // Determine which controller to use based on the route
        if (strpos($path, '/api/admins') !== false) {
            $controller = new AdminController();
        } else {
            $controller = new CompanyController();
        }
        
        if (isset($actions[$method])) {
            $action = $actions[$method];
            
            if ($action === 'index' || $action === 'store' || $action === 'login') {
                $controller->$action();
            } else {
                // For show, update, delete - we need the ID from the route
                $id = $matches[1];
                $controller->$action($id);
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