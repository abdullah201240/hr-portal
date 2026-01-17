<?php
// server/controllers/LeaveController.php

require_once __DIR__ . '/../models/Leave.php';
require_once __DIR__ . '/../models/LeavePolicy.php';
require_once __DIR__ . '/../models/Employee.php';
require_once __DIR__ . '/../helpers/functions.php';

class LeaveController
{
    private $leave;
    private $leavePolicy;
    private $employee;

    public function __construct()
    {
        $this->leave = new Leave();
        $this->leavePolicy = new LeavePolicy();
        $this->employee = new Employee();
    }

    public function apply()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'employee') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $employeeId = $actor['id'];
        $data = getRequestData();
        
        $employee = $this->employee->findById($employeeId);
        $data['employee_id'] = $employeeId;
        $data['company_id'] = $employee['companyId'];
        $data['manager_id'] = $employee['line_manager_id'];
        $data['status'] = 'pending';

        // Validation
        $errors = $this->leave->validate($data);
        if (!empty($errors)) {
            jsonResponse(['success' => false, 'errors' => $errors], 422);
        }

        // Check Policy
        $policy = $this->leavePolicy->find($data['leave_policy_id']);
        if (!$policy || $policy['company_id'] != $employee['companyId'] || !$policy['enabled']) {
            jsonResponse(['success' => false, 'message' => 'Invalid leave policy'], 400);
        }

        // Check Balance
        $year = date('Y', strtotime($data['start_date']));
        $usedDays = $this->leave->getUsedDays($employeeId, $data['leave_policy_id'], $year);
        if ($usedDays + $data['days'] > $policy['days']) {
            jsonResponse(['success' => false, 'message' => 'Insufficient leave balance. Limit: ' . $policy['days'] . ', Used: ' . $usedDays . ', Requested: ' . $data['days']], 400);
        }

        try {
            $leaveId = $this->leave->create($data);
            jsonResponse(['success' => true, 'message' => 'Leave application submitted successfully', 'data' => ['id' => $leaveId]]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function myLeaves()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'employee') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $leaves = $this->leave->findByEmployeeId($actor['id']);
            jsonResponse(['success' => true, 'data' => $leaves]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function pendingApprovals()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'employee') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $leaves = $this->leave->findByManagerId($actor['id']);
            jsonResponse(['success' => true, 'data' => $leaves]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function updateStatus($id)
    {
        $actor = getActorFromToken();
        if (!$actor || ($actor['type'] !== 'employee' && $actor['type'] !== 'company')) {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        if (!isset($data['status']) || !in_array($data['status'], ['approved', 'rejected'])) {
            jsonResponse(['success' => false, 'message' => 'Invalid status'], 400);
        }

        $leave = $this->leave->find($id);
        if (!$leave) {
            jsonResponse(['success' => false, 'message' => 'Leave request not found'], 404);
        }

        // Authorization check
        if ($actor['type'] === 'company') {
            if ($leave['company_id'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Unauthorized access to this leave request'], 403);
            }
        } else {
            // Employee (Manager) check
            if ($leave['manager_id'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Unauthorized access to this leave request'], 403);
            }
        }

        try {
            $updateData = [
                'status' => $data['status'],
                'manager_note' => $data['manager_note'] ?? null,
                'approved_at' => $data['status'] === 'approved' ? date('Y-m-d H:i:s') : null
            ];
            $this->leave->update($id, $updateData);
            jsonResponse(['success' => true, 'message' => 'Leave status updated successfully']);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getCompanyLeaves()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $leaves = $this->leave->findByCompanyId($actor['id']);
            jsonResponse(['success' => true, 'data' => $leaves]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
