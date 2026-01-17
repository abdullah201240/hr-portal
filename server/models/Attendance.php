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
            // Already clocked in or record exists
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
}
