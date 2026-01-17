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

    public function show()
    {
        $actor = getActorFromToken();
        $companyId = getCompanyIdForActor($actor);
        
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
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $companyId = $actor['id'];

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
