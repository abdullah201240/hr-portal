<?php
// server/models/Admin.php

require_once __DIR__ . '/Model.php';

class Admin extends Model
{
    protected $table = 'admins';

    public function validate($data)
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors['name'] = 'Name is required';
        }

        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Valid email is required';
        }

        if (isset($data['password'])) {
            if (strlen($data['password']) < 6) {
                $errors['password'] = 'Password must be at least 6 characters long';
            }
        }

        if (isset($data['role']) && !in_array($data['role'], ['super_admin', 'admin'])) {
            $errors['role'] = 'Role must be super_admin or admin';
        }

        if (isset($data['status']) && !in_array($data['status'], ['active', 'inactive', 'suspended'])) {
            $errors['status'] = 'Status must be active, inactive, or suspended';
        }

        return $errors;
    }

    public function findByEmail($email)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function authenticate($email, $password)
    {
        $admin = $this->findByEmail($email);
        
        if ($admin && password_verify($password, $admin['password'])) {
            if ($admin['status'] !== 'active') {
                return ['error' => 'Account is not active'];
            }
            return $admin;
        }
        
        return false;
    }

    public function updateLastLogin($id)
    {
        $stmt = $this->db->prepare("UPDATE {$this->table} SET last_login = NOW() WHERE id = ?");
        return $stmt->execute([$id]);
    }
    
    public function create($data)
    {
        // Hash password if it exists in the data and is not already hashed
        if (isset($data['password']) && !str_starts_with($data['password'], '$2y$')) {
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
}