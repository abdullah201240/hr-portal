<?php
// server/models/Attendance.php

require_once __DIR__ . '/Model.php';

class Attendance extends Model
{
    protected $table = 'attendances';

    public function __construct()
    {
        parent::__construct();
    }

    public function findByEmployeeAndDate($employeeId, $date)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE employee_id = ? AND date = ?");
        $stmt->execute([$employeeId, $date]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getStatus($employeeId, $date)
    {
        return $this->findByEmployeeAndDate($employeeId, $date);
    }

    public function clockIn($data)
    {
        $existing = $this->findByEmployeeAndDate($data['employee_id'], $data['date']);
        
        if ($existing) {
            // If already clocked in, don't overwrite the clock_in time unless it's null
            if ($existing['clock_in']) {
                return true; 
            }
            return $this->update($existing['id'], [
                'clock_in' => $data['clock_in'],
                'status' => $data['status'] ?? 'present',
                'late_minutes' => $data['late_minutes'] ?? 0
            ]);
        } else {
            return $this->create([
                'employee_id' => $data['employee_id'],
                'company_id' => $data['company_id'],
                'date' => $data['date'],
                'clock_in' => $data['clock_in'],
                'status' => $data['status'] ?? 'present',
                'late_minutes' => $data['late_minutes'] ?? 0
            ]);
        }
    }

    public function clockOut($employeeId, $date, $clockOutTime, $overtimeMinutes = 0)
    {
        $existing = $this->findByEmployeeAndDate($employeeId, $date);
        
        if ($existing) {
            return $this->update($existing['id'], [
                'clock_out' => $clockOutTime,
                'overtime_minutes' => $overtimeMinutes
            ]);
        }
        return false;
    }

    public function getHistory($employeeId, $limit = 30)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE employee_id = ? ORDER BY date DESC LIMIT ?");
        $stmt->bindValue(1, $employeeId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMonthlyHistory($employeeId, $month, $year)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ? ORDER BY date ASC");
        $stmt->execute([$employeeId, $month, $year]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByCompanyAndDate($companyId, $date)
    {
        $sql = "SELECT e.id as emp_id, e.name as employee_name, e.employeeId, e.department, e.designation,
                       a.*
                FROM employees e
                LEFT JOIN {$this->table} a ON e.id = a.employee_id AND a.date = ?
                WHERE e.companyId = ? AND e.status = 'active' AND (e.joinDate IS NULL OR e.joinDate <= ?)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$date, $companyId, $date]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByCompanyAndMonth($companyId, $month, $year)
    {
        $sql = "SELECT e.id as employee_id, e.name as employee_name, e.employeeId, e.department, e.designation,
                       a.id as attendance_id, a.date, a.clock_in, a.clock_out, a.status, a.late_minutes, a.overtime_minutes
                FROM employees e
                LEFT JOIN {$this->table} a ON e.id = a.employee_id AND MONTH(a.date) = ? AND YEAR(a.date) = ?
                WHERE e.companyId = ? AND e.status = 'active' 
                AND (e.joinDate IS NULL OR e.joinDate <= ?)
                ORDER BY e.name, a.date ASC";
        $stmt = $this->db->prepare($sql);
        $firstDayOfMonth = sprintf('%04d-%02d-01', $year, $month);
        $stmt->execute([$month, $year, $companyId, $firstDayOfMonth]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
