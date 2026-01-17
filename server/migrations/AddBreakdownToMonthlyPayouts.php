<?php
require_once __DIR__ . '/Migration.php';

class AddBreakdownToMonthlyPayouts extends Migration
{
    public function up()
    {
        $sql = "ALTER TABLE monthly_payouts 
                ADD COLUMN late_count INT DEFAULT 0,
                ADD COLUMN late_deduction DECIMAL(15,2) DEFAULT 0.00,
                ADD COLUMN unpaid_leave_days DECIMAL(5,2) DEFAULT 0.00,
                ADD COLUMN unpaid_leave_deduction DECIMAL(15,2) DEFAULT 0.00,
                ADD COLUMN absent_days INT DEFAULT 0,
                ADD COLUMN absence_deduction DECIMAL(15,2) DEFAULT 0.00";
        
        try {
            $this->db->exec($sql);
            echo "Breakdown columns added to monthly_payouts successfully.\n";
        } catch (Exception $e) {
            echo "Error adding breakdown columns: " . $e->getMessage() . "\n";
        }
    }

    public function down()
    {
        $sql = "ALTER TABLE monthly_payouts 
                DROP COLUMN late_count,
                DROP COLUMN late_deduction,
                DROP COLUMN unpaid_leave_days,
                DROP COLUMN unpaid_leave_deduction,
                DROP COLUMN absent_days,
                DROP COLUMN absence_deduction";
        
        $this->db->exec($sql);
    }
}
