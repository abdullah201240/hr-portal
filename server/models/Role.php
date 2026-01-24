<?php
// server/models/Role.php

require_once __DIR__ . '/Model.php';

class Role extends Model
{
    protected $table = 'roles';
    
    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} (company_id, name, description, is_active) VALUES (?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['company_id'],
            $data['name'],
            $data['description'] ?? null,
            $data['is_active'] ?? true
        ]);
        return $this->db->lastInsertId();
    }
    
    public function findByCompanyId($companyId)
    {
        $sql = "SELECT * FROM {$this->table} WHERE company_id = ? AND is_active = TRUE ORDER BY name";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$companyId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function findById($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function update($id, $data)
    {
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            $fields[] = "{$key} = ?";
            $values[] = $value;
        }
        
        $values[] = $id;
        
        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }
    
    public function delete($id)
    {
        $sql = "UPDATE {$this->table} SET is_active = FALSE WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    public function restore($id)
    {
        $sql = "UPDATE {$this->table} SET is_active = TRUE WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }
}
?>