<?php
// server/models/AttendancePolicy.php

require_once __DIR__ . '/Model.php';

class AttendancePolicy extends Model
{
    protected $table = 'attendance_policies';

    public function __construct()
    {
        parent::__construct();
    }

    public function findByCompanyId($companyId)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE company_id = ?");
        $stmt->execute([$companyId]);
        $policy = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($policy && isset($policy['weekly_holidays'])) {
            $policy['weekly_holidays'] = json_decode($policy['weekly_holidays'], true);
        }
        
        return $policy;
    }

    public function save($data)
    {
        $existing = $this->findByCompanyId($data['company_id']);
        
        if (isset($data['weekly_holidays']) && is_array($data['weekly_holidays'])) {
            $data['weekly_holidays'] = json_encode($data['weekly_holidays']);
        }

        if ($existing) {
            return $this->update($existing['id'], $data);
        } else {
            return $this->create($data);
        }
    }

    public function validate($data)
    {
        $errors = [];
        
        if (empty($data['company_id'])) {
            $errors['company_id'] = 'Company ID is required';
        }

        if (isset($data['office_start_time']) && !preg_match('/^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/', $data['office_start_time'])) {
            $errors['office_start_time'] = 'Invalid office start time format';
        }

        if (isset($data['office_end_time']) && !preg_match('/^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/', $data['office_end_time'])) {
            $errors['office_end_time'] = 'Invalid office end time format';
        }

        return $errors;
    }
}
