<?php
// server/models/LeavePolicy.php

require_once __DIR__ . '/Model.php';

class LeavePolicy extends Model
{
    protected $table = 'leave_policies';

    public function __construct()
    {
        parent::__construct();
    }

    public function findByCompanyId($companyId)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE company_id = ? ORDER BY created_at ASC");
        $stmt->execute([$companyId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function validate($data)
    {
        $errors = [];
        
        if (empty($data['company_id'])) {
            $errors['company_id'] = 'Company ID is required';
        }

        if (empty($data['name'])) {
            $errors['name'] = 'Leave type name is required';
        }

        if (!isset($data['days']) || !is_numeric($data['days'])) {
            $errors['days'] = 'Valid number of days is required';
        }

        return $errors;
    }

    public function sync($companyId, $policies)
    {
        try {
            $this->db->beginTransaction();

            // Get existing IDs for this company
            $stmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE company_id = ?");
            $stmt->execute([$companyId]);
            $existingIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $receivedIds = [];
            foreach ($policies as $policy) {
                $policyData = [
                    'company_id' => $companyId,
                    'name' => $policy['name'],
                    'days' => $policy['days'],
                    'enabled' => isset($policy['enabled']) ? (int)$policy['enabled'] : 1
                ];

                if (!empty($policy['id']) && in_array($policy['id'], $existingIds)) {
                    // Update existing
                    $this->update($policy['id'], $policyData);
                    $receivedIds[] = $policy['id'];
                } else {
                    // Create new
                    $newId = $this->create($policyData);
                    $receivedIds[] = $newId;
                }
            }

            // Delete ones that were not in the received list
            $idsToDelete = array_diff($existingIds, $receivedIds);
            if (!empty($idsToDelete)) {
                $placeholders = implode(',', array_fill(0, count($idsToDelete), '?'));
                $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id IN ($placeholders) AND company_id = ?");
                $stmt->execute(array_merge(array_values($idsToDelete), [$companyId]));
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
