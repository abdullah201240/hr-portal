<?php
// server/generate-historical-attendance.php
// Script to generate historical attendance data for 2025 and January 2026

require_once __DIR__ . '/database/Database.php';

function generateHistoricalAttendance() {
    echo "📅 Generating historical attendance data for 2025 and January 2026...\n\n";
    
    $db = Database::getInstance()->getConnection();
    
    // Get all employees
    $stmt = $db->prepare("SELECT id FROM employees WHERE status = 'active'");
    $stmt->execute();
    $employees = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($employees)) {
        echo "❌ No active employees found. Please run the main seeding script first.\n";
        return;
    }
    
    echo "👥 Found " . count($employees) . " active employees\n";
    
    // Get company ID (assuming company ID 1 exists)
    $companyId = 1;
    
    // Get attendance policy
    $stmt = $db->prepare("SELECT office_start_time, office_end_time, late_allow_minutes FROM attendance_policies WHERE company_id = ?");
    $stmt->execute([$companyId]);
    $policy = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$policy) {
        echo "❌ No attendance policy found. Creating default policy...\n";
        $stmt = $db->prepare("INSERT INTO attendance_policies (company_id, office_start_time, office_end_time, late_allow_minutes, grace_minutes, weekly_holidays, max_late_allowed, late_deduction_amount, late_deduction_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([
            $companyId,
            '09:00:00',  // office_start_time
            '18:00:00',  // office_end_time
            15,          // late_allow_minutes
            30,          // grace_minutes
            '["Friday","Saturday"]', // weekly_holidays
            3,           // max_late_allowed
            500,         // late_deduction_amount
            'fixed'      // late_deduction_type
        ]);
        
        $stmt = $db->prepare("SELECT office_start_time, office_end_time, late_allow_minutes FROM attendance_policies WHERE company_id = ?");
        $stmt->execute([$companyId]);
        $policy = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    echo "✅ Using attendance policy\n";
    
    // Generate attendance for 2025 (full year)
    $totalRecords2025 = 0;
    echo "📅 Generating 2025 attendance data...\n";
    for ($month = 1; $month <= 12; $month++) {
        $recordsForMonth = generateMonthlyAttendance($db, $employees, $companyId, 2025, $month, $policy);
        $totalRecords2025 += $recordsForMonth;
        echo "  ✅ Generated $recordsForMonth records for " . date('F', mktime(0, 0, 0, $month, 1)) . " 2025\n";
    }
    
    // Generate attendance for January 2026
    $recordsForJan2026 = generateMonthlyAttendance($db, $employees, $companyId, 2026, 1, $policy);
    echo "📅 Generating January 2026 attendance data...\n";
    echo "  ✅ Generated $recordsForJan2026 records for January 2026\n";
    
    $totalGenerated = $totalRecords2025 + $recordsForJan2026;
    echo "\n🎉 Successfully generated $totalGenerated attendance records!\n";
    echo "📊 Total breakdown:\n";
    echo "   - 2025: $totalRecords2025 records\n";
    echo "   - Jan 2026: $recordsForJan2026 records\n";
}

function generateMonthlyAttendance($db, $employees, $companyId, $year, $month, $policy) {
    $startDate = new DateTime("$year-$month-01");
    $endDate = clone $startDate;
    $endDate->modify('last day of this month');
    
    // Bangladesh holidays for 2025-2026 (sample)
    $holidays = [];
    if ($year == 2025) {
        $holidays = [
            '2025-01-01', '2025-01-26', '2025-03-26', '2025-04-14', '2025-05-01', 
            '2025-08-15', '2025-12-16', '2025-12-25'
        ];
    } else if ($year == 2026) {
        if ($month == 1) {
            $holidays = ['2026-01-01', '2026-01-26'];
        }
    }
    
    $totalRecords = 0;
    
    // Prepare statement for inserting attendance records
    $insertStmt = $db->prepare("INSERT INTO attendances (employee_id, company_id, date, clock_in, clock_out, status, late_minutes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
    
    $currentDate = clone $startDate;
    while ($currentDate <= $endDate) {
        $dateStr = $currentDate->format('Y-m-d');
        $dayOfWeek = (int)$currentDate->format('w'); // 0 = Sunday, 6 = Saturday
        
        // Skip weekends (Friday and Saturday for Bangladesh)
        if ($dayOfWeek != 5 && $dayOfWeek != 6 && !in_array($dateStr, $holidays)) {
            foreach ($employees as $employeeId) {
                // Random attendance status
                $statuses = ['present', 'present', 'present', 'present', 'present', 'late', 'absent', 'half-day'];
                $status = $statuses[array_rand($statuses)];
                
                $clockIn = null;
                $clockOut = null;
                $lateMinutes = 0;
                
                if ($status === 'present' || $status === 'late') {
                    // Generate realistic clock-in times
                    if ($status === 'late') {
                        $lateMinutes = rand(15, 120);
                        $extraHours = floor($lateMinutes / 60);
                        $remainingMinutes = $lateMinutes % 60;
                        $clockInHour = min(12, 9 + $extraHours); // Cap at 12 to avoid invalid times
                        $clockInMinute = min(59, $remainingMinutes + rand(0, 15)); // Ensure minute doesn't exceed 59
                    } else {
                        $clockInHour = rand(8, 9);
                        $clockInMinute = rand(0, 59);
                    }
                    
                    $clockIn = sprintf('%02d:%02d:00', $clockInHour, $clockInMinute);
                    
                    // Generate clock-out time (8-10 hours after clock-in)
                    $workHours = rand(8, 10);
                    $clockOutHour = min(23, $clockInHour + $workHours); // Cap at 23 to avoid invalid times
                    $clockOutMinute = rand(0, 59);
                    $clockOut = sprintf('%02d:%02d:00', $clockOutHour, $clockOutMinute);
                }
                
                try {
                    $insertStmt->execute([
                        $employeeId,
                        $companyId,
                        $dateStr,
                        $clockIn,
                        $clockOut,
                        $status,
                        $lateMinutes
                    ]);
                    $totalRecords++;
                } catch (PDOException $e) {
                    // Skip duplicate entries if they exist
                    if (strpos($e->getMessage(), 'Duplicate entry') === false) {
                        echo "Error inserting attendance for $dateStr, employee $employeeId: " . $e->getMessage() . "\n";
                    }
                }
            }
        }
        
        $currentDate->modify('+1 day');
    }
    
    return $totalRecords;
}

// Run the historical attendance generation
generateHistoricalAttendance();
?>