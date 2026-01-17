<?php
// server/models/MonthlyPayout.php

require_once __DIR__ . '/Model.php';

class MonthlyPayout extends Model
{
    protected $table = 'monthly_payouts';

    public function __construct()
    {
        parent::__construct();
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("INSERT INTO {$this->table} (
            employee_id, company_id, month, year, basic_salary, 
            allowances, deductions, net_salary, 
            late_count, late_deduction, unpaid_leave_days, 
            unpaid_leave_deduction, absent_days, absence_deduction,
            status, note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $result = $stmt->execute([
            $data['employee_id'],
            $data['company_id'],
            $data['month'],
            $data['year'],
            $data['basic_salary'],
            $data['allowances'] ?? 0,
            $data['deductions'] ?? 0,
            $data['net_salary'],
            $data['late_count'] ?? 0,
            $data['late_deduction'] ?? 0,
            $data['unpaid_leave_days'] ?? 0,
            $data['unpaid_leave_deduction'] ?? 0,
            $data['absent_days'] ?? 0,
            $data['absence_deduction'] ?? 0,
            $data['status'] ?? 'pending',
            $data['note'] ?? null
        ]);

        if ($result) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function findByCompany($companyId, $month = null, $year = null)
    {
        $sql = "SELECT mp.*, e.name as employee_name, e.employeeId, e.designation, e.department
                FROM {$this->table} mp
                JOIN employees e ON mp.employee_id = e.id
                WHERE mp.company_id = ?";
        
        $params = [$companyId];

        if ($month) {
            $sql .= " AND mp.month = ?";
            $params[] = $month;
        }

        if ($year) {
            $sql .= " AND mp.year = ?";
            $params[] = $year;
        }

        $sql .= " ORDER BY mp.year DESC, mp.month DESC, e.name ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByEmployee($employeeId)
    {
        $sql = "SELECT * FROM {$this->table} WHERE employee_id = ? ORDER BY year DESC, month DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$employeeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateStatus($id, $status, $paymentDate = null, $method = null)
    {
        $sql = "UPDATE {$this->table} SET status = ?, payment_date = ?, payment_method = ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$status, $paymentDate, $method, $id]);
    }

    public function checkExists($employeeId, $month, $year)
    {
        $stmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE employee_id = ? AND month = ? AND year = ?");
        $stmt->execute([$employeeId, $month, $year]);
        return $stmt->fetch();
    }

    public function findByIdWithDetails($id)
    {
        $sql = "SELECT mp.*, e.name as employee_name, e.employeeId as emp_code, e.designation, e.department, e.salary as current_base_salary,
                       c.name as company_name, c.logo as company_logo
                FROM {$this->table} mp
                JOIN employees e ON mp.employee_id = e.id
                JOIN companies c ON mp.company_id = c.id
                WHERE mp.id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
