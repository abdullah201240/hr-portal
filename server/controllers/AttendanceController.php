<?php
// server/controllers/AttendanceController.php

require_once __DIR__ . '/../models/Attendance.php';
require_once __DIR__ . '/../models/AttendancePolicy.php';
require_once __DIR__ . '/../models/Employee.php';
require_once __DIR__ . '/../helpers/functions.php';

class AttendanceController
{
    private $attendance;
    private $policy;
    private $employee;

    public function __construct()
    {
        $this->attendance = new Attendance();
        $this->policy = new AttendancePolicy();
        $this->employee = new Employee();
    }

    public function getStatus($request = null)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'employee') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $employeeId = $actor['id'];
        $date = date('Y-m-d');
        $attendance = $this->attendance->findByEmployeeAndDate($employeeId, $date);

        echo json_encode([
            'success' => true,
            'data' => $attendance
        ]);
    }

    public function clockIn($request = null)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'employee') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $employeeId = $actor['id'];
        $employee = $this->employee->findById($employeeId);
        if (!$employee) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
            return;
        }

        $companyId = $employee['companyId'];
        $policy = $this->policy->findByCompanyId($companyId);
        
        $date = date('Y-m-d');
        $time = date('H:i:s');
        
        $lateMinutes = 0;
        $status = 'present';

        if ($policy) {
            $officeStartTime = $policy['office_start_time'];
            $lateAllow = $policy['late_allow_minutes'] ?? 0;
            
            $startTime = strtotime($officeStartTime);
            $currentTime = strtotime($time);
            
            if ($currentTime > $startTime) {
                $lateMinutes = round(($currentTime - $startTime) / 60);
                if ($lateMinutes > $lateAllow) {
                    $status = 'late';
                }
            }
        }

        try {
            $result = $this->attendance->clockIn([
                'employee_id' => $employeeId,
                'company_id' => $companyId,
                'date' => $date,
                'clock_in' => $time,
                'status' => $status,
                'late_minutes' => $lateMinutes
            ]);

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Clocked in successfully',
                    'data' => $this->attendance->findByEmployeeAndDate($employeeId, $date)
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to clock in']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function clockOut($request = null)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'employee') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $employeeId = $actor['id'];
        $employee = $this->employee->findById($employeeId);
        $companyId = $employee['companyId'];
        $policy = $this->policy->findByCompanyId($companyId);

        $date = date('Y-m-d');
        $time = date('H:i:s');
        
        $overtimeMinutes = 0;
        if ($policy) {
            $officeEndTime = $policy['office_end_time'];
            $endTime = strtotime($officeEndTime);
            $currentTime = strtotime($time);
            
            if ($currentTime > $endTime) {
                $overtimeMinutes = round(($currentTime - $endTime) / 60);
            }
        }

        $result = $this->attendance->clockOut($employeeId, $date, $time, $overtimeMinutes);

        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Clocked out successfully',
                'data' => $this->attendance->findByEmployeeAndDate($employeeId, $date)
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Attendance record for today not found. Please clock in first.']);
        }
    }

    public function history($request = null)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'employee') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $employeeId = $actor['id'];
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 30;
        $history = $this->attendance->getHistory($employeeId, $limit);

        echo json_encode([
            'success' => true,
            'data' => $history
        ]);
    }
}
