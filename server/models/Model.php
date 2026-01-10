<?php
// server/models/Model.php

require_once __DIR__ . '/../database/Database.php';

abstract class Model
{
    protected $db;
    protected $table;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function all()
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table}");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function create($data)
    {
        // Hash password if it exists in the data
        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        $columns = implode(',', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";
        $stmt = $this->db->prepare($sql);
        
        try {
            $stmt->execute($data);
            return $this->db->lastInsertId();
        } catch (PDOException $e) {
            throw new Exception("Error creating record: " . $e->getMessage());
        }
    }

    public function update($id, $data)
    {
        // Hash password if it exists in the data
        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        $setClause = [];
        foreach ($data as $key => $value) {
            $setClause[] = "{$key} = :{$key}";
        }
        $setClause = implode(', ', $setClause);
        
        $sql = "UPDATE {$this->table} SET {$setClause} WHERE id = :id";
        $data['id'] = $id;
        $stmt = $this->db->prepare($sql);
        
        try {
            return $stmt->execute($data);
        } catch (PDOException $e) {
            throw new Exception("Error updating record: " . $e->getMessage());
        }
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
        
        try {
            return $stmt->execute([$id]);
        } catch (PDOException $e) {
            throw new Exception("Error deleting record: " . $e->getMessage());
        }
    }
}