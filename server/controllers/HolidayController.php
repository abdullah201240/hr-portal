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

    public function index($request = null)
    {
        $actor = getActorFromToken();
        $companyId = getCompanyIdForActor($actor);
        
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
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $companyId = $actor['id'];

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
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $companyId = $actor['id'];

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
