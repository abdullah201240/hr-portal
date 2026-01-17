<?php
// server/controllers/SalaryController.php

require_once __DIR__ . '/../models/Employee.php';
require_once __DIR__ . '/../models/SalaryHistory.php';
require_once __DIR__ . '/../models/MonthlyPayout.php';
require_once __DIR__ . '/../models/Attendance.php';
require_once __DIR__ . '/../models/AttendancePolicy.php';
require_once __DIR__ . '/../models/Leave.php';
require_once __DIR__ . '/../models/LeavePolicy.php';
require_once __DIR__ . '/../models/Holiday.php';
require_once __DIR__ . '/../helpers/functions.php';

class SalaryController
{
    private $employee;
    private $salaryHistory;
    private $monthlyPayout;
    private $attendance;
    private $attendancePolicy;
    private $leave;
    private $leavePolicy;
    private $holiday;

    public function __construct()
    {
        $this->employee = new Employee();
        $this->salaryHistory = new SalaryHistory();
        $this->monthlyPayout = new MonthlyPayout();
        $this->attendance = new Attendance();
        $this->attendancePolicy = new AttendancePolicy();
        $this->leave = new Leave();
        $this->leavePolicy = new LeavePolicy();
        $this->holiday = new Holiday();
    }

    // Get salary history for a specific employee
    public function getHistory($id)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            // Verify employee belongs to this company
            $employee = $this->employee->findById($id);
            if (!$employee || $employee['companyId'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Employee not found or unauthorized'], 404);
            }

            $history = $this->salaryHistory->findByEmployeeId($id);
            jsonResponse(['success' => true, 'data' => $history]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Add a salary increment
    public function addIncrement()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        
        // Validation
        if (empty($data['employee_id'])) jsonResponse(['success' => false, 'message' => 'Employee ID required'], 400);
        if (empty($data['increment_date'])) jsonResponse(['success' => false, 'message' => 'Increment date required'], 400);
        if (!isset($data['new_salary']) && !isset($data['increment_amount']) && !isset($data['increment_percentage'])) {
            jsonResponse(['success' => false, 'message' => 'New salary or increment details required'], 400);
        }

        try {
            $employee = $this->employee->findById($data['employee_id']);
            if (!$employee || $employee['companyId'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Employee not found'], 404);
            }

            $currentSalary = (float)($employee['salary'] ?? 0);
            $newSalary = 0;
            $incrementAmount = 0;
            $incrementPercentage = 0;

            if (isset($data['new_salary'])) {
                $newSalary = (float)$data['new_salary'];
                $incrementAmount = $newSalary - $currentSalary;
                if ($currentSalary > 0) {
                    $incrementPercentage = ($incrementAmount / $currentSalary) * 100;
                }
            } elseif (isset($data['increment_amount'])) {
                $incrementAmount = (float)$data['increment_amount'];
                $newSalary = $currentSalary + $incrementAmount;
                if ($currentSalary > 0) {
                    $incrementPercentage = ($incrementAmount / $currentSalary) * 100;
                }
            } elseif (isset($data['increment_percentage'])) {
                $incrementPercentage = (float)$data['increment_percentage'];
                $incrementAmount = ($currentSalary * $incrementPercentage) / 100;
                $newSalary = $currentSalary + $incrementAmount;
            }

            // Begin Transaction (simulated)
            
            // 1. Update Employee Salary
            $this->employee->update($data['employee_id'], ['salary' => $newSalary]);

            // 2. Record History
            $this->salaryHistory->create([
                'employee_id' => $data['employee_id'],
                'company_id' => $actor['id'],
                'previous_salary' => $currentSalary,
                'current_salary' => $newSalary,
                'increment_amount' => $incrementAmount,
                'increment_percentage' => $incrementPercentage,
                'increment_date' => $data['increment_date'],
                'reason' => $data['reason'] ?? 'Salary Increment',
                'created_by' => $actor['id']
            ]);

            jsonResponse(['success' => true, 'message' => 'Salary updated successfully', 'data' => ['new_salary' => $newSalary]]);
            
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Get all salary history for the current company
    public function getAllHistory()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $history = $this->salaryHistory->findByCompanyId($actor['id']);
            jsonResponse(['success' => true, 'data' => $history]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Get company-wide salary statistics
    public function getCompanyStats()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $companyId = $actor['id'];
            
            // 1. Total Employees
            $totalEmployees = $this->employee->countByCompanyId($companyId);
            
            // 2. Active Employees (We might need to update Employee model to handle status in count)
            // For now, let's use a custom query
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT COUNT(*) FROM employees WHERE companyId = ? AND status = 'active'");
            $stmt->execute([$companyId]);
            $activeEmployees = (int)$stmt->fetchColumn();

            // 3. Total Payroll
            $stmt = $db->prepare("SELECT SUM(salary) as total FROM employees WHERE companyId = ? AND status = 'active'");
            $stmt->execute([$companyId]);
            $totalPayroll = (float)$stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // 4. Average Salary
            $averageSalary = $activeEmployees > 0 ? $totalPayroll / $activeEmployees : 0;

            // 5. Total Increments given (count)
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM salary_history WHERE company_id = ?");
            $stmt->execute([$companyId]);
            $totalIncrements = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;

            jsonResponse([
                'success' => true,
                'data' => [
                    'totalEmployees' => $totalEmployees,
                    'activeEmployees' => $activeEmployees,
                    'totalPayroll' => $totalPayroll,
                    'averageSalary' => $averageSalary,
                    'totalIncrements' => $totalIncrements
                ]
            ]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Process/Generate monthly payroll for all active employees
    public function generatePayroll()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        $month = isset($data['month']) ? (int)$data['month'] : (int)date('m');
        $year = isset($data['year']) ? (int)$data['year'] : (int)date('Y');
        $force = !empty($data['force']);

        try {
            $companyId = $actor['id'];
            
            if ($force) {
                // Delete existing pending payouts for this month/year to allow regeneration
                $db = Database::getInstance()->getConnection();
                $stmt = $db->prepare("DELETE FROM monthly_payouts WHERE company_id = ? AND month = ? AND year = ? AND status = 'pending'");
                $stmt->execute([$companyId, $month, $year]);
            }

            $employees = $this->employee->findByCompanyId($companyId, 1000, 0, '', 'name', 'ASC');
            
            // Fetch Global Policies & Metadata
            $policy = $this->attendancePolicy->findByCompanyId($companyId);
            if (!$policy) {
                $policy = ['max_late_allowed' => 2, 'late_deduction_amount' => 0, 'late_deduction_type' => 'fixed', 'weekly_holidays' => ['Friday']];
            }
            
            $holidays = $this->holiday->findByCompanyId($companyId, $year);
            $holidayDates = array_column($holidays, 'holiday_date');
            
            $daysInMonth = (int)date('t', strtotime("$year-$month-01"));
            $today = date('Y-m-d');
            $endCalcDate = ($month == date('m') && $year == date('Y')) ? $today : "$year-$month-$daysInMonth";

            $generatedCount = 0;
            $skippedCount = 0;

            foreach ($employees as $emp) {
                if ($emp['status'] !== 'active') continue;
            
                // Skip if employee joined after this month/year
                $empJoinDate = $emp['joinDate'] ? strtotime($emp['joinDate']) : null;
                $monthStart = strtotime("$year-$month-01");
                if ($empJoinDate && $empJoinDate > $monthStart) {
                    // Employee joined after this month started, so skip
                    continue;
                }
            
                // Check if already exists
                if ($this->monthlyPayout->checkExists($emp['id'], $month, $year)) {
                    $skippedCount++;
                    continue;
                }
            
                $basicSalary = (float)($emp['salary'] ?? 0);
                $perDaySalary = $basicSalary / 30;
            
                // Fetch Attendance and Leaves for this employee
                $attendanceRecords = $this->attendance->getMonthlyHistory($emp['id'], $month, $year);
                $attMap = [];
                foreach ($attendanceRecords as $ar) $attMap[$ar['date']] = $ar;
            
                $leaves = $this->leave->findByEmployeeId($emp['id']); // Potentially filter by month in SQL for better performance
                $leaveMap = [];
                foreach ($leaves as $l) {
                    if ($l['status'] !== 'approved') continue;
                                    
                    $curr = $l['start_date'];
                    while ($curr <= $l['end_date']) {
                        if (date('m', strtotime($curr)) == $month && date('Y', strtotime($curr)) == $year) {
                            $leaveMap[$curr] = $l;
                        }
                        $curr = date('Y-m-d', strtotime($curr . ' +1 day'));
                    }
                }
            
                // Calculate for each day
                $lateCount = 0;
                $absentCount = 0;
                $unpaidLeaveDays = 0;
                
                // Count total working days for this employee in the month
                $totalWorkingDays = 0;
                for ($d = 1; $dayNum = sprintf('%02d', $d), $d <= $daysInMonth; $d++) {
                    $date = "$year-" . sprintf('%02d', $month) . "-$dayNum";
                    if ($date > $endCalcDate) break;
                
                    // Check if employee was active on this date
                    if ($empJoinDate && strtotime($date) < $empJoinDate) {
                        // Employee hadn't joined yet, skip this day
                        continue;
                    }
                
                    $dayOfWeek = date('l', strtotime($date));
                    $isWeekend = in_array($dayOfWeek, $policy['weekly_holidays'] ?? []);
                    $isHoliday = in_array($date, $holidayDates);
                
                    if ($isWeekend || $isHoliday) continue;
                                        
                    $totalWorkingDays++;
                }
                
                // Calculate per day salary based on actual working days
                $perDaySalary = $totalWorkingDays > 0 ? $basicSalary / $totalWorkingDays : 0;
                
                for ($d = 1; $dayNum = sprintf('%02d', $d), $d <= $daysInMonth; $d++) {
                    $date = "$year-" . sprintf('%02d', $month) . "-$dayNum";
                    if ($date > $endCalcDate) break;
                
                    // Check if employee was active on this date
                    if ($empJoinDate && strtotime($date) < $empJoinDate) {
                        // Employee hadn't joined yet, skip this day
                        continue;
                    }
                
                    $dayOfWeek = date('l', strtotime($date));
                    $isWeekend = in_array($dayOfWeek, $policy['weekly_holidays'] ?? []);
                    $isHoliday = in_array($date, $holidayDates);
                
                    if ($isWeekend || $isHoliday) continue;
                
                    if (isset($attMap[$date])) {
                        $status = strtolower($attMap[$date]['status']);
                        if ($status === 'late') $lateCount++;
                        if ($status === 'absent') $absentCount++;
                    } else {
                        // No attendance record found
                        if (isset($leaveMap[$date])) {
                            // Check if leave is unpaid
                            $lp = $this->leavePolicy->find($leaveMap[$date]['leave_policy_id']);
                            if ($lp && !$lp['is_paid']) {
                                $unpaidLeaveDays++;
                            }
                        } else {
                            // No leave, no attendance = ABSENT
                            $absentCount++;
                        }
                    }
                }

                // 3. Calculate Deductions
                $lateDeduction = 0;
                if ($lateCount > (int)$policy['max_late_allowed']) {
                    $excessLates = $lateCount - (int)$policy['max_late_allowed'];
                    if ($policy['late_deduction_type'] === 'fixed') {
                        $lateDeduction = $excessLates * (float)$policy['late_deduction_amount'];
                    } elseif ($policy['late_deduction_type'] === 'percentage') {
                        $lateDeduction = $excessLates * ($basicSalary * ((float)$policy['late_deduction_amount'] / 100));
                    } elseif ($policy['late_deduction_type'] === 'per_day') {
                        $lateDeduction = $excessLates * $perDaySalary;
                    }
                }

                $unpaidDeduction = $unpaidLeaveDays * $perDaySalary;
                $absenceDeduction = $absentCount * $perDaySalary;

                $totalDeductions = $lateDeduction + $unpaidDeduction + $absenceDeduction;
                $allowances = 0; 
                $netSalary = $basicSalary + $allowances - $totalDeductions;
                if ($netSalary < 0) $netSalary = 0;

                $this->monthlyPayout->create([
                    'employee_id' => $emp['id'],
                    'company_id' => $companyId,
                    'month' => $month,
                    'year' => $year,
                    'basic_salary' => $basicSalary,
                    'allowances' => $allowances,
                    'deductions' => $totalDeductions,
                    'net_salary' => $netSalary,
                    'late_count' => $lateCount,
                    'late_deduction' => $lateDeduction,
                    'unpaid_leave_days' => $unpaidLeaveDays,
                    'unpaid_leave_deduction' => $unpaidDeduction,
                    'absent_days' => $absentCount,
                    'absence_deduction' => $absenceDeduction,
                    'status' => 'pending'
                ]);
                $generatedCount++;
            }

            jsonResponse([
                'success' => true, 
                'message' => "Payroll generated: $generatedCount processed, $skippedCount skipped (already exist).",
                'data' => ['generated' => $generatedCount, 'skipped' => $skippedCount]
            ]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Get payroll list for company
    public function getPayrollList()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        $month = isset($data['month']) ? (int)$data['month'] : null;
        $year = isset($data['year']) ? (int)$data['year'] : null;

        try {
            $list = $this->monthlyPayout->findByCompany($actor['id'], $month, $year);
            jsonResponse(['success' => true, 'data' => $list]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Bulk/Single mark as paid
    public function updatePayoutStatus()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        if (empty($data['ids']) || !is_array($data['ids'])) {
            jsonResponse(['success' => false, 'message' => 'Payout IDs required'], 400);
        }

        $status = $data['status'] ?? 'paid';
        $paymentDate = $data['payment_date'] ?? date('Y-m-d');
        $method = $data['method'] ?? 'Bank Transfer';

        try {
            $updated = 0;
            foreach ($data['ids'] as $id) {
                if ($this->monthlyPayout->updateStatus($id, $status, $paymentDate, $method)) {
                    $updated++;
                }
            }
            jsonResponse(['success' => true, 'message' => "$updated records updated to $status"]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // For Employee: Get my payouts
    public function getMyPayouts()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'employee') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $list = $this->monthlyPayout->findByEmployee($actor['id']);
            jsonResponse(['success' => true, 'data' => $list]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Get single payout details
    public function getPayoutDetails($id)
    {
        $actor = getActorFromToken();
        if (!$actor) {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $payout = $this->monthlyPayout->findByIdWithDetails($id);
            if (!$payout) {
                jsonResponse(['success' => false, 'message' => 'Payout record not found'], 404);
            }

            // Authorization check
            if ($actor['type'] === 'company' && $payout['company_id'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Unauthorized'], 403);
            }
            if ($actor['type'] === 'employee' && $payout['employee_id'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            jsonResponse(['success' => true, 'data' => $payout]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Bulk update base salaries for multiple employees
    public function bulkUpdateSalaries()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        if (empty($data['updates']) || !is_array($data['updates'])) {
            jsonResponse(['success' => false, 'message' => 'Updates data required'], 400);
        }

        try {
            $db = Database::getInstance()->getConnection();
            $db->beginTransaction();

            $updatedCount = 0;
            $currentDate = date('Y-m-d');

            foreach ($data['updates'] as $update) {
                if (empty($update['employee_id']) || !isset($update['salary'])) continue;

                $employeeId = $update['employee_id'];
                $newSalary = (float)$update['salary'];

                // Get current employee info to record history
                $employee = $this->employee->findById($employeeId);
                if (!$employee || $employee['companyId'] != $actor['id']) continue;

                $oldSalary = (float)($employee['salary'] ?? 0);
                if ($oldSalary == $newSalary) continue; // No change

                $incrementAmount = $newSalary - $oldSalary;
                $incrementPercentage = $oldSalary > 0 ? ($incrementAmount / $oldSalary) * 100 : 0;

                // 1. Update Employee
                $this->employee->update($employeeId, ['salary' => $newSalary]);

                // 2. Record History
                $this->salaryHistory->create([
                    'employee_id' => $employeeId,
                    'company_id' => $actor['id'],
                    'previous_salary' => $oldSalary,
                    'current_salary' => $newSalary,
                    'increment_amount' => $incrementAmount,
                    'increment_percentage' => $incrementPercentage,
                    'increment_date' => $currentDate,
                    'reason' => $data['reason'] ?? 'Bulk Salary Adjustment',
                    'created_by' => $actor['id']
                ]);

                $updatedCount++;
            }

            $db->commit();
            jsonResponse(['success' => true, 'message' => "Successfully updated $updatedCount salaries."]);
        } catch (Exception $e) {
            if (isset($db)) $db->rollBack();
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
