<?php
// server/models/EmployeeRole.php

require_once __DIR__ . '/Model.php';

class EmployeeRole extends Model
{
    protected $table = 'employee_roles';
    
    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} (employee_id, role_id, assigned_by, is_active) VALUES (?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['employee_id'],
            $data['role_id'],
            $data['assigned_by'] ?? null,
            $data['is_active'] ?? true
        ]);
        return $this->db->lastInsertId();
    }
    
    public function findByEmployeeId($employeeId)
    {
        $sql = "SELECT er.*, r.name as role_name, r.description as role_description 
                FROM {$this->table} er 
                JOIN roles r ON er.role_id = r.id 
                WHERE er.employee_id = ? AND er.is_active = TRUE AND r.is_active = TRUE";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$employeeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function findByRoleId($roleId)
    {
        $sql = "SELECT er.*, e.name as employee_name, e.employeeId as employee_code
                FROM {$this->table} er 
                JOIN employees e ON er.employee_id = e.id 
                WHERE er.role_id = ? AND er.is_active = TRUE";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$roleId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function findByEmployeeAndRole($employeeId, $roleId)
    {
        $sql = "SELECT * FROM {$this->table} WHERE employee_id = ? AND role_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$employeeId, $roleId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function update($id, $data)
    {
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            if (in_array($key, ['is_active'])) {
                $fields[] = "{$key} = ?";
                $values[] = $value;
            }
        }
        
        if (empty($fields)) return false;
        
        $values[] = $id;
        
        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }
    
    public function removeEmployeeRole($employeeId, $roleId)
    {
        $sql = "DELETE FROM {$this->table} WHERE employee_id = ? AND role_id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$employeeId, $roleId]);
    }
    
    // Get all permissions for an employee by joining through roles
    public function getEmployeePermissions($employeeId)
    {
        $sql = "SELECT rp.feature_key, rp.can_view, rp.can_create, rp.can_edit, rp.can_delete
                FROM {$this->table} er
                JOIN role_permissions rp ON er.role_id = rp.role_id
                WHERE er.employee_id = ? AND er.is_active = TRUE";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$employeeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    // Check if employee has specific permission for a feature
    public function hasPermission($employeeId, $featureKey, $permissionType)
    {
        $sql = "SELECT rp.{$permissionType} as has_permission
                FROM {$this->table} er
                JOIN role_permissions rp ON er.role_id = rp.role_id
                WHERE er.employee_id = ? AND er.is_active = TRUE 
                AND rp.feature_key = ? AND rp.{$permissionType} = TRUE";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$employeeId, $featureKey]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
    }
}
?>