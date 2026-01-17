<?php
// server/controllers/LeavePolicyController.php

require_once __DIR__ . '/../models/LeavePolicy.php';
require_once __DIR__ . '/../helpers/functions.php';

class LeavePolicyController
{
    private $leavePolicy;

    public function __construct()
    {
        $this->leavePolicy = new LeavePolicy();
    }

    private function getCompanyIdFromToken()
    {
        $authHeader = null;
        
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            foreach ($headers as $name => $value) {
                if (strtolower($name) === 'authorization') {
                    $authHeader = $value;
                    break;
                }
            }
        }
        
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
        
        if (!preg_match('/^company_(\d+)/', $token, $tokenMatches)) {
            return null;
        }
        
        return (int)$tokenMatches[1];
    }

    public function index()
    {
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $policies = $this->leavePolicy->findByCompanyId($companyId);
            jsonResponse(['success' => true, 'data' => $policies]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function sync()
    {
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $data = getRequestData();
            if (!is_array($data)) {
                jsonResponse(['success' => false, 'message' => 'Invalid data format'], 400);
            }

            $this->leavePolicy->sync($companyId, $data);
            $updatedPolicies = $this->leavePolicy->findByCompanyId($companyId);
            
            jsonResponse([
                'success' => true, 
                'message' => 'Leave policies synchronized successfully',
                'data' => $updatedPolicies
            ]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
