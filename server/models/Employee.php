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

        if (!empty($data['religion']) && !in_array($data['religion'], ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other'])) {
            $errors['religion'] = 'Invalid religion';
        }

        return $errors;
    }

    public function create($data)
    {
        // Handle file uploads if needed
        if (isset($data['photo'])) {
            $data['photo'] = $this->handleFileUpload($data['photo'], 'photos');
        }
        if (isset($data['nidPhoto'])) {
            $data['nidPhoto'] = $this->handleFileUpload($data['nidPhoto'], 'nid_photos');
        }
        if (isset($data['spouseNidPhoto'])) {
            $data['spouseNidPhoto'] = $this->handleFileUpload($data['spouseNidPhoto'], 'spouse_nid_photos');
        }
        if (isset($data['marriageCertificate'])) {
            $data['marriageCertificate'] = $this->handleFileUpload($data['marriageCertificate'], 'marriage_certificates');
        }
        if (isset($data['freedomFighterDoc'])) {
            $data['freedomFighterDoc'] = $this->handleFileUpload($data['freedomFighterDoc'], 'freedom_fighter_docs');
        }
        if (isset($data['thirdGenderDoc'])) {
            $data['thirdGenderDoc'] = $this->handleFileUpload($data['thirdGenderDoc'], 'third_gender_docs');
        }
        if (isset($data['bankStatement'])) {
            $data['bankStatement'] = $this->handleFileUpload($data['bankStatement'], 'bank_statements');
        }

        $stmt = $this->db->prepare("INSERT INTO {$this->table} (
            employeeId, name, email, password, phone, dob, gender, bloodGroup, 
            companyId, sisterConcernId, photo, nid, nidPhoto, tinNumber, 
            designation, department, maritalStatus, spouseName, spouseNid, 
            spouseNidPhoto, marriageCertificate, currentAddress, permanentAddress, 
            joinDate, salary, status, employeeType, employeeTypeChangeDate, 
            isFreedomFighter, freedomFighterDoc, isThirdGender, thirdGenderDoc, 
            hasPF, nameBangla, fatherName, fatherNameBangla, motherName, 
            motherNameBangla, religion, personalMobile, personalEmail, 
            emergencyContactName, emergencyContactRelation, emergencyContactNumber, 
            bankName, bankBranch, accountNumber, accountType, routingNumber, 
            swiftCode, ibanNumber, bankStatement
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $result = $stmt->execute([
            $data['employeeId'],
            $data['name'],
            $data['email'],
            $data['password'] ?? '',
            $data['phone'] ?? '',
            $data['dob'] ?? null,
            $data['gender'] ?? '',
            $data['bloodGroup'] ?? '',
            $data['companyId'],
            $data['sisterConcernId'] ?? null,
            $data['photo'] ?? null,
            $data['nid'] ?? null,
            $data['nidPhoto'] ?? null,
            $data['tinNumber'] ?? null,
            $data['designation'] ?? null,
            $data['department'] ?? null,
            $data['maritalStatus'] ?? null,
            $data['spouseName'] ?? null,
            $data['spouseNid'] ?? null,
            $data['spouseNidPhoto'] ?? null,
            $data['marriageCertificate'] ?? null,
            $data['currentAddress'] ?? null,
            $data['permanentAddress'] ?? null,
            $data['joinDate'] ?? null,
            $data['salary'] ?? null,
            $data['status'] ?? 'active',
            $data['employeeType'] ?? null,
            $data['employeeTypeChangeDate'] ?? null,
            $data['isFreedomFighter'] ?? false,
            $data['freedomFighterDoc'] ?? null,
            $data['isThirdGender'] ?? false,
            $data['thirdGenderDoc'] ?? null,
            $data['hasPF'] ?? false,
            $data['nameBangla'] ?? null,
            $data['fatherName'] ?? null,
            $data['fatherNameBangla'] ?? null,
            $data['motherName'] ?? null,
            $data['motherNameBangla'] ?? null,
            $data['religion'] ?? null,
            $data['personalMobile'] ?? null,
            $data['personalEmail'] ?? null,
            $data['emergencyContactName'] ?? null,
            $data['emergencyContactRelation'] ?? null,
            $data['emergencyContactNumber'] ?? null,
            $data['bankName'] ?? null,
            $data['bankBranch'] ?? null,
            $data['accountNumber'] ?? null,
            $data['accountType'] ?? null,
            $data['routingNumber'] ?? null,
            $data['swiftCode'] ?? null,
            $data['ibanNumber'] ?? null,
            $data['bankStatement'] ?? null
        ]);

        if ($result) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function update($id, $data)
    {
        // Handle file uploads if needed
        if (isset($data['photo'])) {
            $data['photo'] = $this->handleFileUpload($data['photo'], 'photos');
        }
        if (isset($data['nidPhoto'])) {
            $data['nidPhoto'] = $this->handleFileUpload($data['nidPhoto'], 'nid_photos');
        }
        if (isset($data['spouseNidPhoto'])) {
            $data['spouseNidPhoto'] = $this->handleFileUpload($data['spouseNidPhoto'], 'spouse_nid_photos');
        }
        if (isset($data['marriageCertificate'])) {
            $data['marriageCertificate'] = $this->handleFileUpload($data['marriageCertificate'], 'marriage_certificates');
        }
        if (isset($data['freedomFighterDoc'])) {
            $data['freedomFighterDoc'] = $this->handleFileUpload($data['freedomFighterDoc'], 'freedom_fighter_docs');
        }
        if (isset($data['thirdGenderDoc'])) {
            $data['thirdGenderDoc'] = $this->handleFileUpload($data['thirdGenderDoc'], 'third_gender_docs');
        }
        if (isset($data['bankStatement'])) {
            $data['bankStatement'] = $this->handleFileUpload($data['bankStatement'], 'bank_statements');
        }

        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            if (!in_array($key, ['id', 'created_at', 'updated_at'])) {
                $fields[] = "$key = ?";
                $values[] = $value;
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