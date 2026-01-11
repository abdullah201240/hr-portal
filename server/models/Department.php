<?php

require_once __DIR__ . '/Model.php';

class Department extends Model
{
    protected $table = 'departments';

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
        $stmt = $this->db->prepare("INSERT INTO {$this->table} (name, description, status, company_id) VALUES (?, ?, ?, ?)");
        $result = $stmt->execute([
            $data['name'],
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
        $stmt = $this->db->prepare("UPDATE {$this->table} SET name = ?, description = ?, status = ?, updated_at = NOW() WHERE id = ?");
        return $stmt->execute([
            $data['name'],
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
            $whereClause .= ($whereClause ? ' AND ' : 'WHERE ') . "company_id = ?";
            $params[] = $companyId;
        }

        if (!empty($search)) {
            $searchCondition = ($whereClause ? ' AND ' : 'WHERE ') . "(name LIKE ? OR description LIKE ?)";
            $whereClause .= $searchCondition;
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $allowedColumns = ['name', 'status', 'created_at', 'updated_at'];
        if (!in_array($orderBy, $allowedColumns)) {
            $orderBy = 'created_at';
        }

        $allowedDirections = ['ASC', 'DESC'];
        if (!in_array(strtoupper($orderDir), $allowedDirections)) {
            $orderDir = 'DESC';
        }

        $limit = (int)$limit;
        $offset = (int)$offset;
        
        $sql = "SELECT * FROM {$this->table} {$whereClause} ORDER BY {$orderBy} {$orderDir} LIMIT {$limit} OFFSET {$offset}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function count($search = '', $companyId = null)
    {
        $whereClause = '';
        $params = [];

        if ($companyId) {
            $whereClause .= ($whereClause ? ' AND ' : 'WHERE ') . "company_id = ?";
            $params[] = $companyId;
        }

        if (!empty($search)) {
            $searchCondition = ($whereClause ? ' AND ' : 'WHERE ') . "(name LIKE ? OR description LIKE ?)";
            $whereClause .= $searchCondition;
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
}