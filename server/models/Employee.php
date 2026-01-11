<?php

require_once __DIR__ . '/Model.php';

class Employee extends Model
{
    protected $table = 'employees';

    public function __construct()
    {
        parent::__construct();
    }

    public function validate($data)
    {
        $errors = [];

        if (empty($data['employeeId'])) {
            $errors['employeeId'] = 'Employee ID is required';
        }

        if (empty($data['name'])) {
            $errors['name'] = 'Name is required';
        } elseif (strlen($data['name']) > 255) {
            $errors['name'] = 'Name must be less than 256 characters';
        }

        if (empty($data['email'])) {
            $errors['email'] = 'Email is required';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format';
        }

        if (empty($data['companyId'])) {
            $errors['companyId'] = 'Company ID is required';
        }

        if (!empty($data['phone']) && !preg_match('/^\+?[\d\s\-\(\)]+$/', $data['phone'])) {
            $errors['phone'] = 'Invalid phone number format';
        }

        if (!empty($data['dob']) && !strtotime($data['dob'])) {
            $errors['dob'] = 'Invalid date of birth format';
        }

        if (!empty($data['gender']) && !in_array($data['gender'], ['male', 'female', 'other'])) {
            $errors['gender'] = 'Gender must be male, female, or other';
        }

        if (!empty($data['bloodGroup']) && !in_array($data['bloodGroup'], ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])) {
            $errors['bloodGroup'] = 'Invalid blood group';
        }

        if (!empty($data['maritalStatus']) && !in_array($data['maritalStatus'], ['single', 'married', 'divorced', 'widowed'])) {
            $errors['maritalStatus'] = 'Invalid marital status';
        }

        if (!empty($data['status']) && !in_array($data['status'], ['active', 'inactive'])) {
            $errors['status'] = 'Status must be active or inactive';
        }

        if (!empty($data['employeeType']) && !in_array($data['employeeType'], ['full-time', 'part-time', 'contract', 'intern'])) {
            $errors['employeeType'] = 'Invalid employee type';
        }

        return $errors;
    }

    public function create($data)
    {
        // Validate required fields for creation
        if (empty($data['password'])) {
            $creationErrors = ['password' => 'Password is required for creating an employee'];
            throw new Exception(json_encode($creationErrors));
        }
        
        $stmt = $this->db->prepare("INSERT INTO {$this->table} (
            employeeId, name, email, password, phone, dob, gender, bloodGroup, 
            companyId, designation, department, maritalStatus, currentAddress, 
            joinDate, salary, status, employeeType, personalMobile, 
            emergencyContactNumber, bankName, accountNumber
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        // Hash the password if provided, otherwise set a default/empty value
        $password = $data['password'] ?? '';
        if (!empty($password)) {
            $password = password_hash($password, PASSWORD_DEFAULT);
        }
        
        $result = $stmt->execute([
            $data['employeeId'],
            $data['name'],
            $data['email'],
            $password,
            $data['phone'] ?? '',
            $data['dob'] ?? null,
            $data['gender'] ?? '',
            $data['bloodGroup'] ?? '',
            $data['companyId'],
            $data['designation'] ?? null,
            $data['department'] ?? null,
            $data['maritalStatus'] ?? null,
            $data['currentAddress'] ?? null,
            $data['joinDate'] ?? null,
            $data['salary'] ?? null,
            $data['status'] ?? 'active',
            $data['employeeType'] ?? null,
            $data['personalMobile'] ?? null,
            $data['emergencyContactNumber'] ?? null,
            $data['bankName'] ?? null,
            $data['accountNumber'] ?? null
        ]);

        if ($result) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function update($id, $data)
    {
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            if (!in_array($key, ['id', 'created_at', 'updated_at'])) {
                // Only include known fields in the update
                $allowedFields = [
                    'employeeId', 'name', 'email', 'password', 'phone', 'dob', 'gender', 'bloodGroup',
                    'companyId', 'designation', 'department', 'maritalStatus',
                    'currentAddress', 'joinDate', 'salary', 'status', 'employeeType',
                    'personalMobile', 'emergencyContactNumber', 'bankName', 'accountNumber'
                ];
                if (in_array($key, $allowedFields)) {
                    // Hash the password if it's being updated
                    if ($key === 'password' && !empty($value)) {
                        $value = password_hash($value, PASSWORD_DEFAULT);
                    }
                    $fields[] = "$key = ?";
                    $values[] = $value;
                }
            }
        }
        
        $values[] = $id;

        $stmt = $this->db->prepare("UPDATE {$this->table} SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?");
        return $stmt->execute($values);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function findById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findAll($limit = 10, $offset = 0, $search = '', $orderBy = 'created_at', $orderDir = 'DESC', $companyId = null)
    {
        $whereClause = '';
        $params = [];

        if ($companyId) {
            $whereClause .= ($whereClause ? ' AND ' : 'WHERE ') . "companyId = ?";
            $params[] = $companyId;
        }

        if (!empty($search)) {
            $searchCondition = ($whereClause ? ' AND ' : 'WHERE ') . "(name LIKE ? OR email LIKE ? OR employeeId LIKE ?)";
            $whereClause .= $searchCondition;
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $allowedColumns = ['name', 'email', 'employeeId', 'status', 'created_at', 'updated_at'];
        if (!in_array($orderBy, $allowedColumns)) {
            $orderBy = 'created_at';
        }

        $allowedDirections = ['ASC', 'DESC'];
        if (!in_array(strtoupper($orderDir), $allowedDirections)) {
            $orderDir = 'DESC';
        }

        $sql = "SELECT * FROM {$this->table} {$whereClause} ORDER BY {$orderBy} {$orderDir} LIMIT " . (int)$offset . ", " . (int)$limit;
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function count($search = '', $companyId = null)
    {
        $whereClause = '';
        $params = [];

        if ($companyId) {
            $whereClause .= ($whereClause ? ' AND ' : 'WHERE ') . "companyId = ?";
            $params[] = $companyId;
        }

        if (!empty($search)) {
            $searchCondition = ($whereClause ? ' AND ' : 'WHERE ') . "(name LIKE ? OR email LIKE ? OR employeeId LIKE ?)";
            $whereClause .= $searchCondition;
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $sql = "SELECT COUNT(*) FROM {$this->table} {$whereClause}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn();
    }

    public function findByCompanyId($companyId, $limit = 10, $offset = 0, $search = '', $orderBy = 'created_at', $orderDir = 'DESC')
    {
        return $this->findAll($limit, $offset, $search, $orderBy, $orderDir, $companyId);
    }

    public function countByCompanyId($companyId, $search = '')
    {
        return $this->count($search, $companyId);
    }

    private function handleFileUpload($fileData, $folder)
    {
        if (empty($fileData)) {
            return null;
        }

        // Create upload directory if it doesn't exist
        $uploadDir = "uploads/{$folder}/";
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Decode base64 data if needed
        if (strpos($fileData, 'data:') === 0) {
            // Extract base64 data
            list($type, $fileData) = explode(';', $fileData);
            list(, $fileData) = explode(',', $fileData);
            $fileData = base64_decode($fileData);

            // Determine file extension
            $extension = '.jpg';
            if (strpos($type, 'png') !== false) {
                $extension = '.png';
            } elseif (strpos($type, 'gif') !== false) {
                $extension = '.gif';
            } elseif (strpos($type, 'pdf') !== false) {
                $extension = '.pdf';
            }

            // Generate unique filename
            $fileName = uniqid() . '_' . time() . $extension;
        } else {
            // If it's already a path, just return it
            return $fileData;
        }

        // Save the file
        $filePath = $uploadDir . $fileName;
        file_put_contents($filePath, $fileData);

        return $filePath;
    }
}