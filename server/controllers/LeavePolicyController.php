<?php
// server/controllers/LeavePolicyController.php

require_once __DIR__ . '/../models/LeavePolicy.php';
require_once __DIR__ . '/../models/Employee.php';
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
        $actor = getActorFromToken();
        if (!$actor) {
            return null;
        }

        if ($actor['type'] === 'company') {
            return $actor['id'];
        }

        if ($actor['type'] === 'employee') {
            // Fetch employee to get companyId
            $employeeModel = new Employee();
            $employee = $employeeModel->find($actor['id']);
            return $employee ? (int)$employee['companyId'] : null;
        }

        return null;
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
