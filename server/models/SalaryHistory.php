<?php
// server/models/SalaryHistory.php

require_once __DIR__ . '/Model.php';

class SalaryHistory extends Model
{
    protected $table = 'salary_history';

    public function __construct()
    {
        parent::__construct();
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("INSERT INTO {$this->table} (
            employee_id, company_id, previous_salary, current_salary, 
            increment_amount, increment_percentage, increment_date, 
            reason, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $result = $stmt->execute([
            $data['employee_id'],
            $data['company_id'],
            $data['previous_salary'],
            $data['current_salary'],
            $data['increment_amount'],
            $data['increment_percentage'] ?? null,
            $data['increment_date'],
            $data['reason'] ?? null,
            $data['created_by'] ?? null
        ]);

        if ($result) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function findByEmployeeId($employeeId)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE employee_id = ? ORDER BY increment_date DESC, created_at DESC");
        $stmt->execute([$employeeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function findByCompanyId($companyId)
    {
        $sql = "SELECT sh.*, e.name as employee_name, e.employeeId, e.department
                FROM {$this->table} sh 
                JOIN employees e ON sh.employee_id = e.id
                WHERE sh.company_id = ?
                ORDER BY sh.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$companyId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
