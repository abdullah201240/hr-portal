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
}