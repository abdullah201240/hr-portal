<?php

require_once __DIR__ . '/Model.php';

class Designation extends Model
{
    protected $table = 'designations';

    public function __construct()
    {
        parent::__construct();
    }

    public function validate($data)
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors['name'] = 'Name is required';
        } elseif (strlen($data['name']) > 255) {
            $errors['name'] = 'Name must be less than 256 characters';
        }

        if (!empty($data['department_id'])) {
            // Check if department exists and belongs to the same company
            $deptStmt = $this->db->prepare("SELECT id FROM departments WHERE id = ? AND company_id = ?");
            $deptStmt->execute([$data['department_id'], $data['company_id']]);
            if (!$deptStmt->fetch()) {
                $errors['department_id'] = 'Selected department does not exist or does not belong to your company';
            }
        }

        if (!empty($data['description']) && strlen($data['description']) > 1000) {
            $errors['description'] = 'Description must be less than 1001 characters';
        }

        if (!empty($data['status']) && !in_array($data['status'], ['active', 'inactive'])) {
            $errors['status'] = 'Status must be either active or inactive';
        }

        if (empty($data['company_id'])) {
            $errors['company_id'] = 'Company ID is required';
        }

        return $errors;
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("INSERT INTO {$this->table} (name, department_id, description, status, company_id) VALUES (?, ?, ?, ?, ?)");
        $result = $stmt->execute([
            $data['name'],
            $data['department_id'] ?? null,
            $data['description'] ?? null,
            $data['status'] ?? 'active',
            $data['company_id']
        ]);

        if ($result) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function update($id, $data)
    {
        $stmt = $this->db->prepare("UPDATE {$this->table} SET name = ?, department_id = ?, description = ?, status = ?, updated_at = NOW() WHERE id = ?");
        return $stmt->execute([
            $data['name'],
            $data['department_id'] ?? null,
            $data['description'] ?? null,
            $data['status'] ?? 'active',
            $id
        ]);
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
            $whereClause .= ($whereClause ? ' AND ' : 'WHERE ') . "d.company_id = ?";
            $params[] = $companyId;
        }

        if (!empty($search)) {
            $searchCondition = ($whereClause ? ' AND ' : 'WHERE ') . "(d.name LIKE ? OR d.description LIKE ? OR dept.name LIKE ?)";
            $whereClause .= $searchCondition;
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $allowedColumns = ['d.name', 'd.status', 'd.created_at', 'd.updated_at', 'dept.name'];
        if (!in_array($orderBy, $allowedColumns)) {
            $orderBy = 'd.created_at';
        }

        $allowedDirections = ['ASC', 'DESC'];
        if (!in_array(strtoupper($orderDir), $allowedDirections)) {
            $orderDir = 'DESC';
        }

        $sql = "SELECT d.*, dept.name as department_name FROM {$this->table} d LEFT JOIN departments dept ON d.department_id = dept.id {$whereClause} ORDER BY {$orderBy} {$orderDir} LIMIT ? OFFSET ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_merge($params, [$limit, $offset]));
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function count($search = '', $companyId = null)
    {
        $whereClause = '';
        $params = [];

        if ($companyId) {
            $whereClause .= ($whereClause ? ' AND ' : 'WHERE ') . "d.company_id = ?";
            $params[] = $companyId;
        }

        if (!empty($search)) {
            $searchCondition = ($whereClause ? ' AND ' : 'WHERE ') . "(d.name LIKE ? OR d.description LIKE ? OR dept.name LIKE ?)";
            $whereClause .= $searchCondition;
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $sql = "SELECT COUNT(*) FROM {$this->table} d LEFT JOIN departments dept ON d.department_id = dept.id {$whereClause}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn();
    }

    public function getAllDepartments($companyId = null)
    {
        $whereClause = '';
        $params = [];
        
        if ($companyId) {
            $whereClause = 'WHERE company_id = ? AND status = ?';
            $params = [$companyId, 'active'];
        } else {
            $whereClause = 'WHERE status = ?';
            $params = ['active'];
        }
        
        $sql = "SELECT id, name FROM departments WHERE {$whereClause}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByCompanyId($companyId, $limit = 10, $offset = 0, $search = '', $orderBy = 'created_at', $orderDir = 'DESC')
    {
        return $this->findAll($limit, $offset, $search, $orderBy, $orderDir, $companyId);
    }

    public function countByCompanyId($companyId, $search = '')
    {
        return $this->count($search, $companyId);
    }
}