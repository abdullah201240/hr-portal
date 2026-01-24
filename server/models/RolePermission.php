<?php
// server/models/RolePermission.php

require_once __DIR__ . '/Model.php';

class RolePermission extends Model
{
    protected $table = 'role_permissions';
    
    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} (role_id, feature_key, feature_name, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['role_id'],
            $data['feature_key'],
            $data['feature_name'],
            $data['can_view'] ?? false,
            $data['can_create'] ?? false,
            $data['can_edit'] ?? false,
            $data['can_delete'] ?? false
        ]);
        return $this->db->lastInsertId();
    }
    
    public function findByRoleId($roleId)
    {
        $sql = "SELECT * FROM {$this->table} WHERE role_id = ? ORDER BY feature_name";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$roleId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function findByRoleIdAndFeature($roleId, $featureKey)
    {
        $sql = "SELECT * FROM {$this->table} WHERE role_id = ? AND feature_key = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$roleId, $featureKey]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function update($id, $data)
    {
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            if (in_array($key, ['can_view', 'can_create', 'can_edit', 'can_delete'])) {
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
    
    public function updateByRoleAndFeature($roleId, $featureKey, $data)
    {
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            if (in_array($key, ['can_view', 'can_create', 'can_edit', 'can_delete'])) {
                $fields[] = "{$key} = ?";
                $values[] = $value;
            }
        }
        
        if (empty($fields)) return false;
        
        $values[] = $roleId;
        $values[] = $featureKey;
        
        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE role_id = ? AND feature_key = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }
    
    public function deleteByRoleId($roleId)
    {
        $sql = "DELETE FROM {$this->table} WHERE role_id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$roleId]);
    }
    
    public function deleteByRoleAndFeature($roleId, $featureKey)
    {
        $sql = "DELETE FROM {$this->table} WHERE role_id = ? AND feature_key = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$roleId, $featureKey]);
    }
}
?>