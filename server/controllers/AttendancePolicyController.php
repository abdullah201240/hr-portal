<?php
// server/controllers/AttendancePolicyController.php

require_once __DIR__ . '/../models/AttendancePolicy.php';
require_once __DIR__ . '/../helpers/functions.php';

class AttendancePolicyController
{
    private $policy;

    public function __construct()
    {
        $this->policy = new AttendancePolicy();
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

    public function show()
    {
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $policy = $this->policy->findByCompanyId($companyId);
            
            if (!$policy) {
                // Return default values if no policy exists yet
                $policy = [
                    'office_start_time' => '09:00:00',
                    'office_end_time' => '18:00:00',
                    'late_allow_minutes' => 15,
                    'grace_minutes' => 30,
                    'weekly_holidays' => ['Friday']
                ];
            }
            
            jsonResponse(['success' => true, 'data' => $policy]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $data = getRequestData();
            $data['company_id'] = $companyId;

            $errors = $this->policy->validate($data);
            if (!empty($errors)) {
                jsonResponse(['success' => false, 'errors' => $errors], 422);
            }

            $this->policy->save($data);
            $updatedPolicy = $this->policy->findByCompanyId($companyId);
            
            jsonResponse([
                'success' => true, 
                'message' => 'Attendance policy saved successfully',
                'data' => $updatedPolicy
            ]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
