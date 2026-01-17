<?php
// server/controllers/SalaryController.php

require_once __DIR__ . '/../models/Employee.php';
require_once __DIR__ . '/../models/SalaryHistory.php';
require_once __DIR__ . '/../helpers/functions.php';

class SalaryController
{
    private $employee;
    private $salaryHistory;

    public function __construct()
    {
        $this->employee = new Employee();
        $this->salaryHistory = new SalaryHistory();
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
}
