<?php
// server/models/Company.php

require_once __DIR__ . '/Model.php';

class Company extends Model
{
    protected $table = 'companies';

    public function validate($data)
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors['name'] = 'Company name is required';
        }

        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Valid email is required';
        } else {
            // Check if email is already taken
            $stmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE email = ?");
            $stmt->execute([$data['email']]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                $errors['email'] = 'Email is already taken';
            }
        }

        if (isset($data['password'])) {
            if (strlen($data['password']) < 6) {
                $errors['password'] = 'Password must be at least 6 characters long';
            }
        }

        if (empty($data['address'])) {
            $errors['address'] = 'Address is required';
        }

        if (isset($data['phone']) && $data['phone'] !== '' && !preg_match('/^\+?[1-9][\d]{1,14}$/', $data['phone'])) {
            $errors['phone'] = 'Invalid phone number format';
        }

        if (isset($data['website']) && $data['website'] !== '' && !filter_var($data['website'], FILTER_VALIDATE_URL)) {
            $errors['website'] = 'Invalid website URL';
        }

        if (isset($data['established_date']) && !strtotime($data['established_date'])) {
            $errors['established_date'] = 'Invalid date format';
        }

        if (isset($data['status']) && !in_array($data['status'], ['active', 'inactive', 'suspended'])) {
            $errors['status'] = 'Status must be active, inactive, or suspended';
        }

        return $errors;
    }

    public function validateForUpdate($data, $id)
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors['name'] = 'Company name is required';
        }

        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Valid email is required';
        } else {
            // Check if email is already taken by another company
            $stmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE email = ? AND id != ?");
            $stmt->execute([$data['email'], $id]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                $errors['email'] = 'Email is already taken by another company';
            }
        }

        if (isset($data['password']) && strlen($data['password']) < 6) {
            $errors['password'] = 'Password must be at least 6 characters long';
        }

        if (empty($data['address'])) {
            $errors['address'] = 'Address is required';
        }

        if (isset($data['phone']) && $data['phone'] !== '' && !preg_match('/^\+?[1-9][\d]{1,14}$/', $data['phone'])) {
            $errors['phone'] = 'Invalid phone number format';
        }

        if (isset($data['website']) && $data['website'] !== '' && !filter_var($data['website'], FILTER_VALIDATE_URL)) {
            $errors['website'] = 'Invalid website URL';
        }

        if (isset($data['established_date']) && !strtotime($data['established_date'])) {
            $errors['established_date'] = 'Invalid date format';
        }

        if (isset($data['status']) && !in_array($data['status'], ['active', 'inactive', 'suspended'])) {
            $errors['status'] = 'Status must be active, inactive, or suspended';
        }

        return $errors;
    }

    public function update($id, $data)
    {
        // Validate data for update (checking email uniqueness)
        $errors = $this->validateForUpdate($data, $id);
        if (!empty($errors)) {
            throw new Exception('Validation errors: ' . json_encode($errors));
        }

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

    public function findByEmail($email)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function authenticate($email, $password)
    {
        $company = $this->findByEmail($email);
        
        if ($company && password_verify($password, $company['password'])) {
            if ($company['status'] !== 'active') {
                return ['error' => 'Account is not active'];
            }
            return $company;
        }
        
        return false;
    }

    public function hashPassword($password)
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    // Count all companies
    public function countAll()
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM {$this->table}");
        $stmt->execute();
        return $stmt->fetchColumn();
    }

    // Count companies by status
    public function countByStatus($status)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM {$this->table} WHERE status = ?");
        $stmt->execute([$status]);
        return $stmt->fetchColumn();
    }

    // Get latest companies
    public function getLatest($limit)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} ORDER BY created_at DESC LIMIT ?");
        $stmt->bindValue(1, (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}