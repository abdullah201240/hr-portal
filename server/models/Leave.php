<?php
// server/models/Leave.php

require_once __DIR__ . '/Model.php';

class Leave extends Model
{
    protected $table = 'leaves';

    public function __construct()
    {
        parent::__construct();
    }

    public function findByEmployeeId($employeeId)
    {
        $sql = "SELECT l.*, lp.name as leave_type 
                FROM {$this->table} l 
                LEFT JOIN leave_policies lp ON l.leave_policy_id = lp.id 
                WHERE l.employee_id = ? 
                ORDER BY l.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$employeeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByManagerId($managerId)
    {
        $sql = "SELECT l.*, lp.name as leave_type, e.name as employee_name, e.employeeId 
                FROM {$this->table} l 
                LEFT JOIN leave_policies lp ON l.leave_policy_id = lp.id 
                LEFT JOIN employees e ON l.employee_id = e.id 
                WHERE l.manager_id = ? 
                ORDER BY l.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$managerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByCompanyId($companyId)
    {
        $sql = "SELECT l.*, lp.name as leave_type, e.name as employee_name, e.employeeId 
                FROM {$this->table} l 
                LEFT JOIN leave_policies lp ON l.leave_policy_id = lp.id 
                LEFT JOIN employees e ON l.employee_id = e.id 
                WHERE l.company_id = ? 
                ORDER BY l.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$companyId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findOnDate($companyId, $date)
    {
        $sql = "SELECT employee_id, leave_policy_id, status 
                FROM {$this->table} 
                WHERE company_id = ? AND ? BETWEEN start_date AND end_date AND status = 'approved'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$companyId, $date]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUsedDays($employeeId, $policyId, $year)
    {
        $sql = "SELECT SUM(days) as total_used 
                FROM {$this->table} 
                WHERE employee_id = ? AND leave_policy_id = ? AND status = 'approved' 
                AND (YEAR(start_date) = ? OR YEAR(end_date) = ?)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$employeeId, $policyId, $year, $year]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['total_used'] ?? 0);
    }

    public function validate($data)
    {
        $errors = [];
        if (empty($data['employee_id'])) $errors['employee_id'] = 'Employee ID is required';
        if (empty($data['company_id'])) $errors['company_id'] = 'Company ID is required';
        if (empty($data['leave_policy_id'])) $errors['leave_policy_id'] = 'Leave policy ID is required';
        if (empty($data['start_date'])) $errors['start_date'] = 'Start date is required';
        if (empty($data['end_date'])) $errors['end_date'] = 'End date is required';
        if (empty($data['days'])) $errors['days'] = 'Number of days is required';
        
        return $errors;
    }
}
