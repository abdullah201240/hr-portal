<?php
// server/controllers/RoleController.php

require_once __DIR__ . '/../models/Role.php';
require_once __DIR__ . '/../models/RolePermission.php';
require_once __DIR__ . '/../models/EmployeeRole.php';
require_once __DIR__ . '/../helpers/functions.php';

class RoleController
{
    private $role;
    private $rolePermission;
    private $employeeRole;

    public function __construct()
    {
        $this->role = new Role();
        $this->rolePermission = new RolePermission();
        $this->employeeRole = new EmployeeRole();
    }

    // Get all roles for a company
    public function getRoles()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $roles = $this->role->findByCompanyId($actor['id']);
            jsonResponse(['success' => true, 'data' => $roles]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Create a new role
    public function createRole()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        
        // Validation
        if (empty($data['name'])) {
            jsonResponse(['success' => false, 'message' => 'Role name is required'], 400);
        }

        try {
            $roleId = $this->role->create([
                'company_id' => $actor['id'],
                'name' => $data['name'],
                'description' => $data['description'] ?? null
            ]);
            
            jsonResponse([
                'success' => true, 
                'message' => 'Role created successfully',
                'data' => ['id' => $roleId]
            ]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Update a role
    public function updateRole($id)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        
        try {
            // Verify role belongs to this company
            $role = $this->role->findById($id);
            if (!$role || $role['company_id'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Role not found'], 404);
            }

            $updateData = [];
            if (isset($data['name'])) $updateData['name'] = $data['name'];
            if (isset($data['description'])) $updateData['description'] = $data['description'];
            if (isset($data['is_active'])) $updateData['is_active'] = $data['is_active'];

            if (!empty($updateData)) {
                $this->role->update($id, $updateData);
            }
            
            jsonResponse(['success' => true, 'message' => 'Role updated successfully']);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Delete a role (soft delete)
    public function deleteRole($id)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            // Verify role belongs to this company
            $role = $this->role->findById($id);
            if (!$role || $role['company_id'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Role not found'], 404);
            }

            $this->role->delete($id);
            jsonResponse(['success' => true, 'message' => 'Role deleted successfully']);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Get role permissions
    public function getRolePermissions($roleId)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            // Verify role belongs to this company
            $role = $this->role->findById($roleId);
            if (!$role || $role['company_id'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Role not found'], 404);
            }

            $permissions = $this->rolePermission->findByRoleId($roleId);
            jsonResponse(['success' => true, 'data' => $permissions]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Update role permissions
    public function updateRolePermissions($roleId)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        
        try {
            // Verify role belongs to this company
            $role = $this->role->findById($roleId);
            if (!$role || $role['company_id'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Role not found'], 404);
            }

            // Clear existing permissions
            $this->rolePermission->deleteByRoleId($roleId);

            // Add new permissions
            if (!empty($data['permissions']) && is_array($data['permissions'])) {
                foreach ($data['permissions'] as $permission) {
                    if (!empty($permission['feature_key']) && !empty($permission['feature_name'])) {
                        $this->rolePermission->create([
                            'role_id' => $roleId,
                            'feature_key' => $permission['feature_key'],
                            'feature_name' => $permission['feature_name'],
                            'can_view' => $permission['can_view'] ?? false,
                            'can_create' => $permission['can_create'] ?? false,
                            'can_edit' => $permission['can_edit'] ?? false,
                            'can_delete' => $permission['can_delete'] ?? false
                        ]);
                    }
                }
            }
            
            jsonResponse(['success' => true, 'message' => 'Role permissions updated successfully']);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Get employees with a specific role
    public function getRoleEmployees($roleId)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            // Verify role belongs to this company
            $role = $this->role->findById($roleId);
            if (!$role || $role['company_id'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Role not found'], 404);
            }

            $employees = $this->employeeRole->findByRoleId($roleId);
            jsonResponse(['success' => true, 'data' => $employees]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Assign role to employee
    public function assignRoleToEmployee()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        
        // Validation
        if (empty($data['employee_id']) || empty($data['role_id'])) {
            jsonResponse(['success' => false, 'message' => 'Employee ID and Role ID are required'], 400);
        }

        try {
            // Verify role belongs to this company
            $role = $this->role->findById($data['role_id']);
            if (!$role || $role['company_id'] != $actor['id']) {
                jsonResponse(['success' => false, 'message' => 'Role not found'], 404);
            }

            // Verify employee belongs to this company
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT * FROM employees WHERE id = ? AND companyId = ?");
            $stmt->execute([$data['employee_id'], $actor['id']]);
            $employee = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$employee) {
                jsonResponse(['success' => false, 'message' => 'Employee not found'], 404);
            }

            // Check if assignment already exists
            $existing = $this->employeeRole->findByEmployeeAndRole($data['employee_id'], $data['role_id']);
            if ($existing) {
                jsonResponse(['success' => false, 'message' => 'Employee already has this role'], 400);
            }

            $assignmentId = $this->employeeRole->create([
                'employee_id' => $data['employee_id'],
                'role_id' => $data['role_id'],
                'assigned_by' => $actor['id']
            ]);
            
            jsonResponse([
                'success' => true, 
                'message' => 'Role assigned to employee successfully',
                'data' => ['id' => $assignmentId]
            ]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Remove role from employee
    public function removeRoleFromEmployee()
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        
        // Validation
        if (empty($data['employee_id']) || empty($data['role_id'])) {
            jsonResponse(['success' => false, 'message' => 'Employee ID and Role ID are required'], 400);
        }

        try {
            // Verify assignment exists and belongs to this company
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("
                SELECT er.* 
                FROM employee_roles er
                JOIN roles r ON er.role_id = r.id
                WHERE er.employee_id = ? AND er.role_id = ? AND r.company_id = ?
            ");
            $stmt->execute([$data['employee_id'], $data['role_id'], $actor['id']]);
            $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$assignment) {
                jsonResponse(['success' => false, 'message' => 'Role assignment not found'], 404);
            }

            $this->employeeRole->removeEmployeeRole($data['employee_id'], $data['role_id']);
            jsonResponse(['success' => true, 'message' => 'Role removed from employee successfully']);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Get employee roles
    public function getEmployeeRoles($employeeId)
    {
        $actor = getActorFromToken();
        if (!$actor || $actor['type'] !== 'company') {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            // Verify employee belongs to this company
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT * FROM employees WHERE id = ? AND companyId = ?");
            $stmt->execute([$employeeId, $actor['id']]);
            $employee = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$employee) {
                jsonResponse(['success' => false, 'message' => 'Employee not found'], 404);
            }

            $roles = $this->employeeRole->findByEmployeeId($employeeId);
            jsonResponse(['success' => true, 'data' => $roles]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Check if employee has permission for a feature
    public function checkEmployeePermission()
    {
        $actor = getActorFromToken();
        if (!$actor) {
            jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $data = getRequestData();
        
        // Validation
        if (empty($data['feature_key']) || empty($data['permission_type'])) {
            jsonResponse(['success' => false, 'message' => 'Feature key and permission type are required'], 400);
        }

        try {
            $employeeId = $actor['type'] === 'employee' ? $actor['id'] : $data['employee_id'] ?? null;
            
            if (!$employeeId) {
                jsonResponse(['success' => false, 'message' => 'Employee ID required'], 400);
            }

            // For company users checking employee permissions, verify employee belongs to company
            if ($actor['type'] === 'company') {
                $db = Database::getInstance()->getConnection();
                $stmt = $db->prepare("SELECT * FROM employees WHERE id = ? AND companyId = ?");
                $stmt->execute([$employeeId, $actor['id']]);
                $employee = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$employee) {
                    jsonResponse(['success' => false, 'message' => 'Employee not found'], 404);
                }
            }

            $hasPermission = $this->employeeRole->hasPermission($employeeId, $data['feature_key'], $data['permission_type']);
            jsonResponse(['success' => true, 'data' => ['has_permission' => $hasPermission]]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
?>