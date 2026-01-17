<?php
require_once __DIR__ . '/Migration.php';

class AddDeductionRulesToPolicies extends Migration
{
    public function up()
    {
        // Add to attendance_policies
        $sql1 = "ALTER TABLE attendance_policies 
                ADD COLUMN max_late_allowed INT DEFAULT 2,
                ADD COLUMN late_deduction_amount DECIMAL(15,2) DEFAULT 0.00,
                ADD COLUMN late_deduction_type ENUM('fixed', 'percentage', 'per_day') DEFAULT 'fixed'";
        
        // Add to leave_policies
        $sql2 = "ALTER TABLE leave_policies ADD COLUMN is_paid BOOLEAN DEFAULT TRUE";

        try {
            $this->db->exec($sql1);
            $this->db->exec($sql2);
            echo "Deduction rules added to policies successfully.\n";
        } catch (Exception $e) {
            echo "Error adding deduction rules: " . $e->getMessage() . "\n";
        }
    }

    public function down()
    {
        $sql1 = "ALTER TABLE attendance_policies 
                DROP COLUMN max_late_allowed,
                DROP COLUMN late_deduction_amount,
                DROP COLUMN late_deduction_type";
        $sql2 = "ALTER TABLE leave_policies DROP COLUMN is_paid";
        
        $this->db->exec($sql1);
        $this->db->exec($sql2);
    }
}
