<?php
// server/models/Holiday.php

require_once __DIR__ . '/Model.php';

class Holiday extends Model
{
    protected $table = 'holidays';

    public function __construct()
    {
        parent::__construct();
    }

    public function findByCompanyId($companyId, $year = null)
    {
        $sql = "SELECT * FROM {$this->table} WHERE company_id = ?";
        $params = [$companyId];

        if ($year) {
            $sql .= " AND YEAR(holiday_date) = ?";
            $params[] = $year;
        }

        $sql .= " ORDER BY holiday_date ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findOnDate($companyId, $date)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE company_id = ? AND holiday_date = ?");
        $stmt->execute([$companyId, $date]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function validate($data)
    {
        $errors = [];
        
        if (empty($data['company_id'])) {
            $errors['company_id'] = 'Company ID is required';
        }

        if (empty($data['name'])) {
            $errors['name'] = 'Holiday name is required';
        }

        if (empty($data['holiday_date'])) {
            $errors['holiday_date'] = 'Holiday date is required';
        } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['holiday_date'])) {
            $errors['holiday_date'] = 'Invalid date format (YYYY-MM-DD)';
        }

        return $errors;
    }

    public function save($data)
    {
        // Check if a holiday already exists for this date and company
        $stmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE company_id = ? AND holiday_date = ?");
        $stmt->execute([$data['company_id'], $data['holiday_date']]);
        $existing = $stmt->fetch();

        if ($existing) {
            return $this->update($existing['id'], [
                'name' => $data['name']
            ]);
        } else {
            return $this->create([
                'company_id' => $data['company_id'],
                'name' => $data['name'],
                'holiday_date' => $data['holiday_date']
            ]);
        }
    }
}
