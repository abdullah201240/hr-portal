<?php
// server/helpers/functions.php

function jsonResponse($data, $statusCode = 200)
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function getRequestData()
{
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

function sanitizeInput($data)
{
    return htmlspecialchars(strip_tags(trim($data)));
}

function uploadFile($file, $uploadDir = 'uploads/')
{
    // ... same as before ...
}

function getBearerToken()
{
    $authHeader = null;
    
    // Method 1: Standard getallheaders() function
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
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
    
    return trim($matches[1]);
}

function getActorFromToken()
{
    $token = getBearerToken();
    if (!$token) {
        return null;
    }

    if (preg_match('/^admin_(\d+)/', $token, $matches)) {
        return ['type' => 'admin', 'id' => (int)$matches[1]];
    }

    if (preg_match('/^company_(\d+)/', $token, $matches)) {
        return ['type' => 'company', 'id' => (int)$matches[1]];
    }

    if (preg_match('/^employee_(\d+)/', $token, $matches)) {
        return ['type' => 'employee', 'id' => (int)$matches[1]];
    }

    return null;
}