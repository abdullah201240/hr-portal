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