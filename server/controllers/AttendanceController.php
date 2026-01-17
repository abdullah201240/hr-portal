<?php
// server/controllers/AttendanceController.php

require_once __DIR__ . '/../models/Attendance.php';
require_once __DIR__ . '/../models/AttendancePolicy.php';
require_once __DIR__ . '/../models/Employee.php';
require_once __DIR__ . '/../models/Holiday.php';
require_once __DIR__ . '/../models/Leave.php';
require_once __DIR__ . '/../helpers/functions.php';

class AttendanceController
{
    private $attendance;
    private $policy;
    private $employee;
    private $holiday;
    private $leave;

    public function __construct()
    {
        $this->attendance = new Attendance();
        $this->policy = new AttendancePolicy();
        $this->employee = new Employee();
        $this->holiday = new Holiday();
        $this->leave = new Leave();
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
        $month = isset($_GET['month']) ? (int)$_GET['month'] : null;
        $year = isset($_GET['year']) ? (int)$_GET['year'] : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 30;
        
        if ($month && $year) {
            $history = $this->attendance->getMonthlyHistory($employeeId, $month, $year);
        } else {
            $history = $this->attendance->getHistory($employeeId, $limit);
        }

        echo json_encode([
            'success' => true,
            'data' => $history
        ]);
    }

    public function getCompanyAttendance($request = null)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $companyId = $actor['id'];
        $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
        $isFuture = strtotime($date) > strtotime(date('Y-m-d'));
        
        $policy = $this->policy->findByCompanyId($companyId);
        $holiday = $this->holiday->findOnDate($companyId, $date);
        $leaves = $this->leave->findOnDate($companyId, $date);
        
        // Map leaves by employee_id for easy lookup
        $leaveMap = [];
        foreach ($leaves as $l) {
            $leaveMap[$l['employee_id']] = $l;
        }

        $attendanceRecords = $this->attendance->findByCompanyAndDate($companyId, $date);
        
        // Determine day type
        $dayOfWeek = date('l', strtotime($date));
        $isWeekend = false;
        if ($policy && !empty($policy['weekly_holidays'])) {
            if (in_array($dayOfWeek, $policy['weekly_holidays'])) {
                $isWeekend = true;
            }
        }

        $formattedAttendance = [];
        foreach ($attendanceRecords as $record) {
            $status = $record['status'];
            $empId = $record['emp_id'];

            if (!$record['id']) { // No attendance record found
                if ($isFuture) {
                    $status = 'scheduled';
                    $record['notes'] = 'Upcoming';
                } elseif ($holiday) {
                    $status = 'holiday';
                    $record['notes'] = $holiday['name'];
                } elseif ($isWeekend) {
                    $status = 'holiday'; // Or 'weekend' if you prefer
                    $record['notes'] = 'Weekend';
                } elseif (isset($leaveMap[$empId])) {
                    $status = 'on-leave';
                    $record['notes'] = 'On Approved Leave';
                } else {
                    $status = 'absent';
                }
            } else {
                // Check if late if not already marked
                if ($status === 'present' && $policy && $record['clock_in']) {
                    $officeStartTime = $policy['office_start_time'];
                    $lateAllow = $policy['late_allow_minutes'] ?? 0;
                    
                    $startTime = strtotime($officeStartTime);
                    $clockInTime = strtotime($record['clock_in']);
                    
                    if ($clockInTime > $startTime) {
                        $lateMinutes = round(($clockInTime - $startTime) / 60);
                        if ($lateMinutes > $lateAllow) {
                            $status = 'late';
                            $record['late_minutes'] = $lateMinutes;
                        }
                    }
                }
            }

            $record['status'] = $status;
            $formattedAttendance[] = $record;
        }

        echo json_encode([
            'success' => true,
            'data' => $formattedAttendance
        ]);
    }

    public function getCompanyMonthlyAttendance($request = null)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $companyId = $actor['id'];
        $month = isset($_GET['month']) ? (int)$_GET['month'] : date('n');
        $year = isset($_GET['year']) ? (int)$_GET['year'] : date('Y');
        
        $daysInMonth = (int)date('t', strtotime(sprintf('%04d-%02d-01', $year, $month)));
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = sprintf('%04d-%02d-%02d', $year, $month, $daysInMonth);
        
        $policy = $this->policy->findByCompanyId($companyId);
        $holidays = $this->holiday->findByCompanyId($companyId, $year);
        $leaves = $this->leave->findByCompanyId($companyId);
        
        // Map holidays by date for easy lookup
        $holidayMap = [];
        foreach ($holidays as $holiday) {
            $holidayMap[$holiday['holiday_date']] = $holiday;
        }
        
        // Filter leaves for the specific month/year and map by employee and date
        $leaveMap = [];
        foreach ($leaves as $leave) {
            $leaveStartDate = $leave['start_date'];
            $leaveEndDate = $leave['end_date'];
            
            // Check if leave overlaps with our month
            $overlapStart = max($startDate, $leaveStartDate);
            $overlapEnd = min($endDate, $leaveEndDate);
            
            if ($overlapStart <= $overlapEnd) {
                // Generate dates in the overlap range
                $currentDate = $overlapStart;
                while ($currentDate <= $overlapEnd) {
                    if (!isset($leaveMap[$currentDate])) {
                        $leaveMap[$currentDate] = [];
                    }
                    $leaveMap[$currentDate][$leave['employee_id']] = $leave;
                    $currentDate = date('Y-m-d', strtotime($currentDate . ' +1 day'));
                }
            }
        }
        
        // Get all employees for this company
        $employees = $this->employee->findByCompanyId($companyId, PHP_INT_MAX, 0);
        
        // Get attendance records for the month
        $attendanceRecords = $this->attendance->findByCompanyAndMonth($companyId, $month, $year);
        
        // Map attendance records by employee_id and date
        $attendanceMap = [];
        foreach ($attendanceRecords as $record) {
            $date = $record['date'];
            $empId = $record['employee_id'];
            
            if (!isset($attendanceMap[$empId])) {
                $attendanceMap[$empId] = [];
            }
            // Only add to map if there's a date (meaning there's an actual attendance record)
            if ($date) {
                $attendanceMap[$empId][$date] = $record;
            }
        }
        
        $today = date('Y-m-d');
        $datesMetadata = [];
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = sprintf('%04d-%02d-%02d', $year, $month, $day);
            $dayOfWeek = date('l', strtotime($date));
            $isWeekend = false;
            $holidayName = null;
            
            if ($policy && !empty($policy['weekly_holidays'])) {
                if (in_array($dayOfWeek, $policy['weekly_holidays'])) {
                    $isWeekend = true;
                }
            }
            
            if (isset($holidayMap[$date])) {
                $holidayName = $holidayMap[$date]['name'];
            }
            
            $datesMetadata[$date] = [
                'date' => $date,
                'day' => $day,
                'dayOfWeek' => $dayOfWeek,
                'isWeekend' => $isWeekend,
                'holiday' => $holidayName
            ];
        }

        // Build the monthly attendance data
        $monthlyAttendance = [];
        foreach ($employees as $employee) {
            $empData = [
                'emp_id' => $employee['id'],
                'employee_name' => $employee['name'],
                'employeeId' => $employee['employeeId'],
                'department' => $employee['department'],
                'designation' => $employee['designation'],
                'attendance_data' => []
            ];
            
            // Process each day of the month
            foreach ($datesMetadata as $date => $meta) {
                $isWeekend = $meta['isWeekend'];
                $holidayName = $meta['holiday'];
                
                $status = 'absent';
                $record = null;
                $notes = '';
                
                // Check attendance record
                if (isset($attendanceMap[$employee['id']][$date])) {
                    $record = $attendanceMap[$employee['id']][$date];
                    $status = $record['status'];
                    
                    // Update status based on policy
                    if ($status === 'present' && $policy && $record['clock_in']) {
                        $officeStartTime = $policy['office_start_time'];
                        $lateAllow = $policy['late_allow_minutes'] ?? 0;
                        
                        $startTime = strtotime($officeStartTime);
                        $clockInTime = strtotime($record['clock_in']);
                        
                        if ($clockInTime > $startTime) {
                            $lateMinutes = round(($clockInTime - $startTime) / 60);
                            if ($lateMinutes > $lateAllow) {
                                $status = 'late';
                                $record['late_minutes'] = $lateMinutes;
                            }
                        }
                    }
                } 
                // Check if it's a holiday
                elseif ($holidayName) {
                    $status = 'holiday';
                    $notes = $holidayName;
                } 
                // Check if it's a weekend
                elseif ($isWeekend) {
                    $status = 'holiday'; // or 'weekend' if you prefer
                    $notes = 'Weekend';
                } 
                // Check if employee is on leave
                elseif (isset($leaveMap[$date][$employee['id']])) {
                    $leave = $leaveMap[$date][$employee['id']];
                    if ($leave['status'] === 'approved') {
                        $status = 'on-leave';
                        $notes = 'On Approved Leave';
                    }
                }
                
                // If it's a future date and no record/holiday/leave, mark as scheduled
                if ($status === 'absent' && $date > $today) {
                    $status = 'scheduled';
                }
                
                $empData['attendance_data'][$date] = [
                    'status' => $status,
                    'date' => $date,
                    'clock_in' => $record ? $record['clock_in'] : null,
                    'clock_out' => $record ? $record['clock_out'] : null,
                    'late_minutes' => $record ? $record['late_minutes'] : 0,
                    'overtime_minutes' => $record ? $record['overtime_minutes'] : 0,
                    'notes' => $notes
                ];
            }
            
            $monthlyAttendance[] = $empData;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $monthlyAttendance,
            'meta' => [
                'month' => $month,
                'year' => $year,
                'days_in_month' => $daysInMonth,
                'dates' => array_values($datesMetadata)
            ]
        ]);
    }
}
