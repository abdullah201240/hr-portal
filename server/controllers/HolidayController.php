<?php
// server/controllers/HolidayController.php

require_once __DIR__ . '/../models/Holiday.php';
require_once __DIR__ . '/../helpers/functions.php';

class HolidayController
{
    private $holiday;

    public function __construct()
    {
        $this->holiday = new Holiday();
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

    public function index($request = null)
    {
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $year = $request['year'] ?? null;
            $holidays = $this->holiday->findByCompanyId($companyId, $year);
            
            // Map table column 'holiday_date' to 'date' for frontend consistency
            foreach ($holidays as &$h) {
                $h['date'] = $h['holiday_date'];
            }
            
            jsonResponse(['success' => true, 'data' => $holidays]);
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
            // Support both 'date' and 'holiday_date' from frontend
            if (isset($data['date']) && !isset($data['holiday_date'])) {
                $data['holiday_date'] = $data['date'];
            }

            $errors = $this->holiday->validate($data);
            if (!empty($errors)) {
                jsonResponse(['success' => false, 'errors' => $errors], 422);
            }

            $this->holiday->save($data);
            
            jsonResponse([
                'success' => true, 
                'message' => 'Holiday saved successfully'
            ]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $companyId = $this->getCompanyIdFromToken();
        if (!$companyId) {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $holiday = $this->holiday->find($id);
            if (!$holiday || $holiday['company_id'] != $companyId) {
                jsonResponse(['success' => false, 'message' => 'Holiday not found'], 404);
            }

            $this->holiday->delete($id);
            jsonResponse(['success' => true, 'message' => 'Holiday deleted successfully']);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
