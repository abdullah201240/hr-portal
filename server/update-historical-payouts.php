<?php
// server/update-historical-payouts.php
// Script to generate historical monthly payouts for 2025 and January 2026

require_once __DIR__ . '/database/Database.php';

function generateHistoricalPayouts() {
    echo "💰 Generating historical monthly payouts for 2025 and January 2026...\n\n";
    
    $db = Database::getInstance()->getConnection();
    
    // Get all employees
    $stmt = $db->prepare("SELECT id, salary FROM employees WHERE status = 'active'");
    $stmt->execute();
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($employees)) {
        echo "❌ No active employees found.\n";
        return;
    }
    
    echo "👥 Found " . count($employees) . " active employees\n";
    
    // Get company ID
    $companyId = 1;
    
    // Prepare statement for inserting monthly payouts
    $insertStmt = $db->prepare("INSERT INTO monthly_payouts (employee_id, company_id, month, year, basic_salary, allowances, deductions, net_salary, late_count, late_deduction, absent_days, absence_deduction, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    
    $payoutCount = 0;
    
    // Generate payouts for 2025 (full year)
    for ($year = 2025; $year <= 2025; $year++) {
        for ($month = 1; $month <= 12; $month++) {
            $monthPayouts = 0;
            foreach ($employees as $employee) {
                // Calculate deductions based on attendance for that month
                $stmt = $db->prepare("SELECT COUNT(*) as late_count FROM attendances WHERE employee_id = ? AND company_id = ? AND YEAR(date) = ? AND MONTH(date) = ? AND status = 'late'");
                $stmt->execute([$employee['id'], $companyId, $year, $month]);
                $lateCount = $stmt->fetch()['late_count'] ?? 0;
                
                $stmt = $db->prepare("SELECT COUNT(*) as absent_count FROM attendances WHERE employee_id = ? AND company_id = ? AND YEAR(date) = ? AND MONTH(date) = ? AND status = 'absent'");
                $stmt->execute([$employee['id'], $companyId, $year, $month]);
                $absentCount = $stmt->fetch()['absent_count'] ?? 0;
                
                // Apply deductions
                $lateDeduction = 0;
                if ($lateCount > 3) {
                    $lateDeduction = ($lateCount - 3) * 500; // 500 BDT per late after 3 free lates
                }
                $absenceDeduction = $absentCount * ($employee['salary'] / 30);
                
                $totalDeductions = $lateDeduction + $absenceDeduction;
                $netSalary = $employee['salary'] - $totalDeductions;
                
                if ($netSalary < 0) $netSalary = 0;
                
                try {
                    $insertStmt->execute([
                        $employee['id'],
                        $companyId,
                        $month,
                        $year,
                        $employee['salary'], // basic_salary
                        0, // allowances
                        $totalDeductions,
                        $netSalary,
                        $lateCount,
                        $lateDeduction,
                        $absentCount,
                        $absenceDeduction,
                        'paid' // status
                    ]);
                    $payoutCount++;
                    $monthPayouts++;
                } catch (PDOException $e) {
                    // Skip duplicate entries if they exist
                    if (strpos($e->getMessage(), 'Duplicate entry') === false) {
                        echo "Error inserting payout for employee {$employee['id']}, month $month, year $year: " . $e->getMessage() . "\n";
                    }
                }
            }
            echo "✅ Generated $monthPayouts payouts for " . date('F', mktime(0, 0, 0, $month, 1)) . " $year\n";
        }
    }
    
    // Generate payout for January 2026
    $month = 1;
    $year = 2026;
    $monthPayouts = 0;
    foreach ($employees as $employee) {
        // Calculate deductions based on attendance for January 2026
        $stmt = $db->prepare("SELECT COUNT(*) as late_count FROM attendances WHERE employee_id = ? AND company_id = ? AND YEAR(date) = ? AND MONTH(date) = ? AND status = 'late'");
        $stmt->execute([$employee['id'], $companyId, $year, $month]);
        $lateCount = $stmt->fetch()['late_count'] ?? 0;
        
        $stmt = $db->prepare("SELECT COUNT(*) as absent_count FROM attendances WHERE employee_id = ? AND company_id = ? AND YEAR(date) = ? AND MONTH(date) = ? AND status = 'absent'");
        $stmt->execute([$employee['id'], $companyId, $year, $month]);
        $absentCount = $stmt->fetch()['absent_count'] ?? 0;
        
        // Apply deductions
        $lateDeduction = 0;
        if ($lateCount > 3) {
            $lateDeduction = ($lateCount - 3) * 500; // 500 BDT per late after 3 free lates
        }
        $absenceDeduction = $absentCount * ($employee['salary'] / 30);
        
        $totalDeductions = $lateDeduction + $absenceDeduction;
        $netSalary = $employee['salary'] - $totalDeductions;
        
        if ($netSalary < 0) $netSalary = 0;
        
        try {
            $insertStmt->execute([
                $employee['id'],
                $companyId,
                $month,
                $year,
                $employee['salary'], // basic_salary
                0, // allowances
                $totalDeductions,
                $netSalary,
                $lateCount,
                $lateDeduction,
                $absentCount,
                $absenceDeduction,
                'paid' // status
            ]);
            $payoutCount++;
            $monthPayouts++;
        } catch (PDOException $e) {
            // Skip duplicate entries if they exist
            if (strpos($e->getMessage(), 'Duplicate entry') === false) {
                echo "Error inserting payout for employee {$employee['id']}, month $month, year $year: " . $e->getMessage() . "\n";
            }
        }
    }
    echo "✅ Generated $monthPayouts payouts for January 2026\n";
    
    echo "\n🎉 Successfully generated $payoutCount monthly payout records for 2025 and January 2026!\n";
}

// Run the historical payouts generation
generateHistoricalPayouts();
?>