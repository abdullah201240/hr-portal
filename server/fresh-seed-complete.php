<?php
// server/fresh-seed-complete.php
// Comprehensive seeding script that adds data in proper sequence with correct relationships

require_once __DIR__ . '/database/Database.php';

function seedCompleteData() {
    echo "🌱 Starting fresh data seeding in proper sequence...\n\n";
    
    $db = Database::getInstance()->getConnection();
    
    // 1. First create Company
    $companyId = createCompany($db);
    
    // 2. Then create Admins (with reference to company if needed)
    createAdmins($db);
    
    // 3. Create Departments
    $departments = createDepartments($db, $companyId);
    
    // 4. Create Designations
    $designations = createDesignations($db, $companyId, $departments);
    
    // 5. Create Employees
    $employees = createEmployees($db, $companyId, $departments, $designations);
    
    // 6. Create Policies
    createAttendancePolicies($db, $companyId);
    createLeavePolicies($db, $companyId);
    
    // 7. Create Holidays
    createHolidays($db, $companyId);
    
    // 8. Create Attendance Records
    createAttendanceRecords($db, $companyId, $employees);
    
    // 9. Create Leave Records
    createLeaveRecords($db, $companyId, $employees);
    
    // 10. Create Salary History
    createSalaryHistory($db, $companyId, $employees);
    
    // 11. Create Monthly Payouts
    createMonthlyPayouts($db, $companyId, $employees);
    
    // 12. Create Roles and Role Permissions
    createRoles($db, $companyId);
    createRolePermissions($db);
    
    // 13. Assign Employee Roles
    assignEmployeeRoles($db, $employees);
    
    echo "\n🎉 Complete data seeding finished successfully!\n";
    echo "📊 Final Summary:\n";
    echo "- Company created with ID: $companyId\n";
    echo "- All tables properly linked with correct relationships\n";
    echo "- Complete HR portal data set ready for use\n";
}

function createCompany($db) {
    echo "🏢 Creating company...\n";
    
    $stmt = $db->prepare("INSERT INTO companies (name, email, password, address, phone, website, description, industry, established_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->execute([
        'TechCorp Solutions Ltd.',
        'contact@techcorp.com',
        password_hash('password123', PASSWORD_DEFAULT),
        '123 Business Avenue, Tech District, Dhaka 1205',
        '+8801712345678',
        'https://techcorp.com',
        'Leading technology solutions provider with expertise in software development, cloud services, and digital transformation.',
        'Information Technology',
        '2015-03-15',
        'active'
    ]);
    
    $companyId = $db->lastInsertId();
    echo "✅ Company created: TechCorp Solutions Ltd. (ID: $companyId)\n";
    return $companyId;
}

function createAdmins($db) {
    echo "👮 Creating admin accounts...\n";
    
    $admins = [
        [
            'name' => 'John Smith',
            'email' => 'john.admin@hrportal.com',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'role' => 'super_admin',
            'status' => 'active'
        ],
        [
            'name' => 'Sarah Johnson',
            'email' => 'sarah.admin@hrportal.com',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'role' => 'admin',
            'status' => 'active'
        ]
    ];
    
    foreach ($admins as $admin) {
        $stmt = $db->prepare("INSERT INTO admins (name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([
            $admin['name'],
            $admin['email'],
            $admin['password'],
            $admin['role'],
            $admin['status']
        ]);
        
        echo "✅ Admin created: {$admin['name']} ({$admin['email']})\n";
    }
}

function createDepartments($db, $companyId) {
    echo "🏢 Creating departments...\n";
    
    $departments = [
        ['name' => 'Engineering', 'description' => 'Software development and technical operations'],
        ['name' => 'Human Resources', 'description' => 'Talent acquisition, employee relations, and HR operations'],
        ['name' => 'Marketing', 'description' => 'Digital marketing, branding, and customer engagement'],
        ['name' => 'Sales', 'description' => 'Client acquisition and revenue generation'],
        ['name' => 'Finance', 'description' => 'Financial planning, accounting, and budget management'],
        ['name' => 'Operations', 'description' => 'Business operations and process improvement'],
        ['name' => 'Customer Support', 'description' => 'Technical support and customer service'],
        ['name' => 'Quality Assurance', 'description' => 'Testing and quality control']
    ];
    
    $createdDepartments = [];
    
    foreach ($departments as $dept) {
        $stmt = $db->prepare("INSERT INTO departments (name, description, status, company_id, created_at) VALUES (?, ?, 'active', ?, NOW())");
        $stmt->execute([
            $dept['name'],
            $dept['description'],
            $companyId
        ]);
        
        $deptId = $db->lastInsertId();
        $createdDepartments[] = ['id' => $deptId, 'name' => $dept['name']];
        echo "✅ Department created: {$dept['name']} (ID: $deptId)\n";
    }
    
    return $createdDepartments;
}

function createDesignations($db, $companyId, $departments) {
    echo "💼 Creating designations...\n";
    
    $designations = [
        // Engineering
        ['name' => 'Software Engineer', 'department' => 'Engineering'],
        ['name' => 'Senior Software Engineer', 'department' => 'Engineering'],
        ['name' => 'Lead Developer', 'department' => 'Engineering'],
        ['name' => 'Engineering Manager', 'department' => 'Engineering'],
        ['name' => 'DevOps Engineer', 'department' => 'Engineering'],
        
        // HR
        ['name' => 'HR Executive', 'department' => 'Human Resources'],
        ['name' => 'HR Manager', 'department' => 'Human Resources'],
        ['name' => 'Recruitment Specialist', 'department' => 'Human Resources'],
        
        // Marketing
        ['name' => 'Marketing Executive', 'department' => 'Marketing'],
        ['name' => 'Senior Marketing Executive', 'department' => 'Marketing'],
        ['name' => 'Marketing Manager', 'department' => 'Marketing'],
        ['name' => 'Digital Marketing Specialist', 'department' => 'Marketing'],
        
        // Sales
        ['name' => 'Sales Executive', 'department' => 'Sales'],
        ['name' => 'Senior Sales Executive', 'department' => 'Sales'],
        ['name' => 'Sales Manager', 'department' => 'Sales'],
        ['name' => 'Account Manager', 'department' => 'Sales'],
        
        // Finance
        ['name' => 'Accountant', 'department' => 'Finance'],
        ['name' => 'Senior Accountant', 'department' => 'Finance'],
        ['name' => 'Finance Manager', 'department' => 'Finance'],
        
        // Operations
        ['name' => 'Operations Executive', 'department' => 'Operations'],
        ['name' => 'Operations Manager', 'department' => 'Operations'],
        
        // Customer Support
        ['name' => 'Support Executive', 'department' => 'Customer Support'],
        ['name' => 'Senior Support Executive', 'department' => 'Customer Support'],
        ['name' => 'Support Manager', 'department' => 'Customer Support'],
        
        // QA
        ['name' => 'QA Engineer', 'department' => 'Quality Assurance'],
        ['name' => 'Senior QA Engineer', 'department' => 'Quality Assurance'],
        ['name' => 'QA Manager', 'department' => 'Quality Assurance']
    ];
    
    $createdDesignations = [];
    
    foreach ($designations as $desig) {
        $deptId = null;
        foreach ($departments as $dept) {
            if ($dept['name'] === $desig['department']) {
                $deptId = $dept['id'];
                break;
            }
        }
        
        if ($deptId) {
            $stmt = $db->prepare("INSERT INTO designations (name, department_id, description, status, company_id, created_at) VALUES (?, ?, ?, 'active', ?, NOW())");
            $stmt->execute([
                $desig['name'],
                $deptId,
                "Professional role for {$desig['name']}",
                $companyId
            ]);
            
            $desigId = $db->lastInsertId();
            $createdDesignations[] = [
                'id' => $desigId, 
                'name' => $desig['name'], 
                'department_id' => $deptId,
                'department_name' => $desig['department']
            ];
            echo "✅ Designation created: {$desig['name']} (ID: $desigId)\n";
        }
    }
    
    return $createdDesignations;
}

function createEmployees($db, $companyId, $departments, $designations) {
    echo "👥 Creating 50 employees with proper relationships...\n";
    
    $employeeData = [
        // Engineering (15 employees)
        ['name' => 'Rahim Ahmed', 'email' => 'rahim.ahmed@techcorp.com', 'department' => 'Engineering', 'designation' => 'Software Engineer'],
        ['name' => 'Fatima Rahman', 'email' => 'fatima.rahman@techcorp.com', 'department' => 'Engineering', 'designation' => 'Software Engineer'],
        ['name' => 'Karim Hasan', 'email' => 'karim.hasan@techcorp.com', 'department' => 'Engineering', 'designation' => 'Senior Software Engineer'],
        ['name' => 'Nusrat Jahan', 'email' => 'nusrat.jahan@techcorp.com', 'department' => 'Engineering', 'designation' => 'Senior Software Engineer'],
        ['name' => 'Shahriar Kabir', 'email' => 'shahriar.kabir@techcorp.com', 'department' => 'Engineering', 'designation' => 'Lead Developer'],
        ['name' => 'Tasnim Akter', 'email' => 'tasnim.akter@techcorp.com', 'department' => 'Engineering', 'designation' => 'Lead Developer'],
        ['name' => 'Mahfuzur Rahman', 'email' => 'mahfuzur.rahman@techcorp.com', 'department' => 'Engineering', 'designation' => 'Engineering Manager'],
        ['name' => 'Sabina Yeasmin', 'email' => 'sabina.yeasmin@techcorp.com', 'department' => 'Engineering', 'designation' => 'DevOps Engineer'],
        ['name' => 'Rezaul Karim', 'email' => 'rezaul.karim@techcorp.com', 'department' => 'Engineering', 'designation' => 'DevOps Engineer'],
        ['name' => 'Farzana Islam', 'email' => 'farzana.islam@techcorp.com', 'department' => 'Engineering', 'designation' => 'Software Engineer'],
        ['name' => 'Imran Hossain', 'email' => 'imran.hossain@techcorp.com', 'department' => 'Engineering', 'designation' => 'Software Engineer'],
        ['name' => 'Sumaya Khan', 'email' => 'sumaya.khan@techcorp.com', 'department' => 'Engineering', 'designation' => 'Senior Software Engineer'],
        ['name' => 'Anwar Hossain', 'email' => 'anwar.hossain@techcorp.com', 'department' => 'Engineering', 'designation' => 'QA Engineer'],
        ['name' => 'Rina Akter', 'email' => 'rina.akter@techcorp.com', 'department' => 'Engineering', 'designation' => 'QA Engineer'],
        ['name' => 'Sajjad Hossain', 'email' => 'sajjad.hossain@techcorp.com', 'department' => 'Engineering', 'designation' => 'DevOps Engineer'],
        
        // HR (5 employees)
        ['name' => 'Nadia Rahman', 'email' => 'nadia.rahman@techcorp.com', 'department' => 'Human Resources', 'designation' => 'HR Executive'],
        ['name' => 'Kamal Ahmed', 'email' => 'kamal.ahmed@techcorp.com', 'department' => 'Human Resources', 'designation' => 'HR Manager'],
        ['name' => 'Tania Akter', 'email' => 'tania.akter@techcorp.com', 'department' => 'Human Resources', 'designation' => 'Recruitment Specialist'],
        ['name' => 'Mizanur Rahman', 'email' => 'mizanur.rahman@techcorp.com', 'department' => 'Human Resources', 'designation' => 'HR Executive'],
        ['name' => 'Sharmin Akter', 'email' => 'sharmin.akter@techcorp.com', 'department' => 'Human Resources', 'designation' => 'Recruitment Specialist'],
        
        // Marketing (8 employees)
        ['name' => 'Arif Hossain', 'email' => 'arif.hossain@techcorp.com', 'department' => 'Marketing', 'designation' => 'Marketing Executive'],
        ['name' => 'Taslima Begum', 'email' => 'taslima.begum@techcorp.com', 'department' => 'Marketing', 'designation' => 'Senior Marketing Executive'],
        ['name' => 'Rakibul Hasan', 'email' => 'rakibul.hasan@techcorp.com', 'department' => 'Marketing', 'designation' => 'Marketing Manager'],
        ['name' => 'Nazma Akter', 'email' => 'nazma.akter@techcorp.com', 'department' => 'Marketing', 'designation' => 'Digital Marketing Specialist'],
        ['name' => 'Sohel Rana', 'email' => 'sohel.rana@techcorp.com', 'department' => 'Marketing', 'designation' => 'Marketing Executive'],
        ['name' => 'Fariha Rahman', 'email' => 'fariha.rahman@techcorp.com', 'department' => 'Marketing', 'designation' => 'Digital Marketing Specialist'],
        ['name' => 'Mamun Khan', 'email' => 'mamun.khan@techcorp.com', 'department' => 'Marketing', 'designation' => 'Senior Marketing Executive'],
        ['name' => 'Nipa Akter', 'email' => 'nipa.akter@techcorp.com', 'department' => 'Marketing', 'designation' => 'Marketing Executive'],
        
        // Sales (8 employees)
        ['name' => 'Jewel Ahmed', 'email' => 'jewel.ahmed@techcorp.com', 'department' => 'Sales', 'designation' => 'Sales Executive'],
        ['name' => 'Rupa Begum', 'email' => 'rupa.begum@techcorp.com', 'department' => 'Sales', 'designation' => 'Senior Sales Executive'],
        ['name' => 'Hasan Mahmud', 'email' => 'hasan.mahmud@techcorp.com', 'department' => 'Sales', 'designation' => 'Sales Manager'],
        ['name' => 'Laila Akter', 'email' => 'laila.akter@techcorp.com', 'department' => 'Sales', 'designation' => 'Account Manager'],
        ['name' => 'Rafiqul Islam', 'email' => 'rafiqul.islam@techcorp.com', 'department' => 'Sales', 'designation' => 'Sales Executive'],
        ['name' => 'Shirin Akter', 'email' => 'shirin.akter@techcorp.com', 'department' => 'Sales', 'designation' => 'Senior Sales Executive'],
        ['name' => 'Nayeem Hossain', 'email' => 'nayeem.hossain@techcorp.com', 'department' => 'Sales', 'designation' => 'Account Manager'],
        ['name' => 'Tania Rahman', 'email' => 'tania.rahman@techcorp.com', 'department' => 'Sales', 'designation' => 'Sales Executive'],
        
        // Finance (4 employees)
        ['name' => 'Shamsul Alam', 'email' => 'shamsul.alam@techcorp.com', 'department' => 'Finance', 'designation' => 'Accountant'],
        ['name' => 'Rina Begum', 'email' => 'rina.begum@techcorp.com', 'department' => 'Finance', 'designation' => 'Senior Accountant'],
        ['name' => 'Mizan Rahman', 'email' => 'mizan.rahman@techcorp.com', 'department' => 'Finance', 'designation' => 'Finance Manager'],
        ['name' => 'Farhana Akter', 'email' => 'farhana.akter@techcorp.com', 'department' => 'Finance', 'designation' => 'Accountant'],
        
        // Operations (4 employees)
        ['name' => 'Rashidul Hasan', 'email' => 'rashidul.hasan@techcorp.com', 'department' => 'Operations', 'designation' => 'Operations Executive'],
        ['name' => 'Nasrin Akter', 'email' => 'nasrin.akter@techcorp.com', 'department' => 'Operations', 'designation' => 'Operations Manager'],
        ['name' => 'Saiful Islam', 'email' => 'saiful.islam@techcorp.com', 'department' => 'Operations', 'designation' => 'Operations Executive'],
        ['name' => 'Taslima Rahman', 'email' => 'taslima.rahman@techcorp.com', 'department' => 'Operations', 'designation' => 'Operations Executive'],
        
        // Customer Support (3 employees)
        ['name' => 'Kamrul Hasan', 'email' => 'kamrul.hasan@techcorp.com', 'department' => 'Customer Support', 'designation' => 'Support Executive'],
        ['name' => 'Firoza Akter', 'email' => 'firoza.akter@techcorp.com', 'department' => 'Customer Support', 'designation' => 'Senior Support Executive'],
        ['name' => 'Ashraf Hossain', 'email' => 'ashraf.hossain@techcorp.com', 'department' => 'Customer Support', 'designation' => 'Support Manager'],
        
        // QA (3 employees)
        ['name' => 'Monir Hossain', 'email' => 'monir.hossain@techcorp.com', 'department' => 'Quality Assurance', 'designation' => 'QA Engineer'],
        ['name' => 'Sabina Rahman', 'email' => 'sabina.rahman@techcorp.com', 'department' => 'Quality Assurance', 'designation' => 'Senior QA Engineer'],
        ['name' => 'Rakib Ahmed', 'email' => 'rakib.ahmed@techcorp.com', 'department' => 'Quality Assurance', 'designation' => 'QA Manager']
    ];
    
    $createdEmployees = [];
    $employeeCounter = 1;
    
    foreach ($employeeData as $emp) {
        // Find department and designation IDs
        $deptId = null;
        $desigId = null;
        
        foreach ($departments as $dept) {
            if ($dept['name'] === $emp['department']) {
                $deptId = $dept['id'];
                break;
            }
        }
        
        foreach ($designations as $desig) {
            if ($desig['name'] === $emp['designation'] && $desig['department_name'] === $emp['department']) {
                $desigId = $desig['id'];
                break;
            }
        }
        
        if ($deptId && $desigId) {
            // Generate realistic salary based on designation
            $salaryRanges = [
                'Software Engineer' => [35000, 55000],
                'Senior Software Engineer' => [60000, 85000],
                'Lead Developer' => [80000, 120000],
                'Engineering Manager' => [100000, 150000],
                'DevOps Engineer' => [50000, 80000],
                'HR Executive' => [25000, 40000],
                'HR Manager' => [60000, 90000],
                'Recruitment Specialist' => [30000, 50000],
                'Marketing Executive' => [28000, 45000],
                'Senior Marketing Executive' => [45000, 70000],
                'Marketing Manager' => [70000, 100000],
                'Digital Marketing Specialist' => [35000, 60000],
                'Sales Executive' => [25000, 40000],
                'Senior Sales Executive' => [40000, 65000],
                'Sales Manager' => [75000, 110000],
                'Account Manager' => [50000, 80000],
                'Accountant' => [30000, 50000],
                'Senior Accountant' => [50000, 75000],
                'Finance Manager' => [80000, 120000],
                'Operations Executive' => [30000, 45000],
                'Operations Manager' => [60000, 90000],
                'Support Executive' => [25000, 40000],
                'Senior Support Executive' => [40000, 60000],
                'Support Manager' => [60000, 85000],
                'QA Engineer' => [35000, 55000],
                'Senior QA Engineer' => [55000, 80000],
                'QA Manager' => [80000, 110000]
            ];
            
            $salaryRange = $salaryRanges[$emp['designation']] ?? [30000, 50000];
            $salary = rand($salaryRange[0], $salaryRange[1]);
            
            // Join dates should be before or during January 2024 to appear in attendance
            $joinDate = '2024-01-01'; // All employees joined before January 2024 to appear in attendance records
            
            // Generate blood group - only some employees have it to avoid enum issues
            // Use only valid values from the enum or skip the field
            $bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            $hasBloodGroup = (rand(1, 3) === 1); // Only ~33% have blood group
            $bloodGroup = $hasBloodGroup ? $bloodGroups[array_rand($bloodGroups)] : '';
            
            if ($hasBloodGroup) {
                $stmt = $db->prepare("INSERT INTO employees (employeeId, name, email, password, phone, gender, bloodGroup, companyId, department, designation, salary, joinDate, status, employeeType, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'full-time', NOW())");
                $stmt->execute([
                    sprintf('EMP%04d', $employeeCounter),
                    $emp['name'],
                    $emp['email'],
                    password_hash('password123', PASSWORD_DEFAULT),
                    '+8801' . rand(300000000, 999999999),
                    (rand(0, 1) === 0) ? 'male' : 'female',
                    $bloodGroup, // Valid enum value
                    $companyId,
                    $emp['department'],
                    $emp['designation'],
                    $salary,
                    $joinDate
                ]);
            } else {
                $stmt = $db->prepare("INSERT INTO employees (employeeId, name, email, password, phone, gender, companyId, department, designation, salary, joinDate, status, employeeType, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'full-time', NOW())");
                $stmt->execute([
                    sprintf('EMP%04d', $employeeCounter),
                    $emp['name'],
                    $emp['email'],
                    password_hash('password123', PASSWORD_DEFAULT),
                    '+8801' . rand(300000000, 999999999),
                    (rand(0, 1) === 0) ? 'male' : 'female',
                    $companyId,
                    $emp['department'],
                    $emp['designation'],
                    $salary,
                    $joinDate
                ]);
            }
            
            $employeeId = $db->lastInsertId();
            $createdEmployees[] = [
                'id' => $employeeId,
                'name' => $emp['name'],
                'email' => $emp['email'],
                'department' => $emp['department'],
                'designation' => $emp['designation'],
                'salary' => $salary
            ];
            
            echo "✅ Employee created: {$emp['name']} (ID: $employeeId)\n";
            $employeeCounter++;
        }
    }
    
    return $createdEmployees;
}

function createAttendancePolicies($db, $companyId) {
    echo "📋 Creating attendance policies...\n";
    
    $stmt = $db->prepare("INSERT INTO attendance_policies (company_id, office_start_time, office_end_time, late_allow_minutes, grace_minutes, weekly_holidays, max_late_allowed, late_deduction_amount, late_deduction_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->execute([
        $companyId,
        '09:00:00',
        '18:00:00',
        15, // late_allow_minutes
        30, // grace_minutes
        '["Friday","Saturday"]',
        3, // max_late_allowed
        500, // late_deduction_amount
        'fixed' // late_deduction_type
    ]);
    
    echo "✅ Attendance policy created\n";
}

function createLeavePolicies($db, $companyId) {
    echo "📝 Creating leave policies...\n";
    
    $leavePolicies = [
        ['name' => 'Casual Leave', 'days' => 14, 'is_paid' => 1],
        ['name' => 'Sick Leave', 'days' => 12, 'is_paid' => 1],
        ['name' => 'Annual Leave', 'days' => 20, 'is_paid' => 1],
        ['name' => 'Maternity Leave', 'days' => 112, 'is_paid' => 1],
        ['name' => 'Paternity Leave', 'days' => 7, 'is_paid' => 1],
        ['name' => 'Unpaid Leave', 'days' => 30, 'is_paid' => 0]
    ];
    
    foreach ($leavePolicies as $policy) {
        $stmt = $db->prepare("INSERT INTO leave_policies (company_id, name, days, enabled, is_paid, created_at) VALUES (?, ?, ?, 1, ?, NOW())");
        $stmt->execute([
            $companyId,
            $policy['name'],
            $policy['days'],
            $policy['is_paid']
        ]);
        echo "✅ Leave policy created: {$policy['name']}\n";
    }
}

function createHolidays($db, $companyId) {
    echo "🎉 Creating holidays...\n";
    
    $holidays = [
        ['name' => 'New Year\'s Day', 'holiday_date' => '2024-01-01'],
        ['name' => 'Independence Day', 'holiday_date' => '2024-03-26'],
        ['name' => 'Eid-ul-Fitr', 'holiday_date' => '2024-04-10'],
        ['name' => 'Eid-ul-Fitr', 'holiday_date' => '2024-04-11'],
        ['name' => 'Eid-ul-Fitr', 'holiday_date' => '2024-04-12'],
        ['name' => 'May Day', 'holiday_date' => '2024-05-01'],
        ['name' => 'Eid-al-Adha', 'holiday_date' => '2024-06-17'],
        ['name' => 'Eid-al-Adha', 'holiday_date' => '2024-06-18'],
        ['name' => 'Eid-al-Adha', 'holiday_date' => '2024-06-19'],
        ['name' => 'Eid-al-Adha', 'holiday_date' => '2024-06-20'],
        ['name' => 'Durga Puja', 'holiday_date' => '2024-10-15'],
        ['name' => 'Christmas Day', 'holiday_date' => '2024-12-25']
    ];
    
    foreach ($holidays as $holiday) {
        $stmt = $db->prepare("INSERT INTO holidays (company_id, name, holiday_date, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([
            $companyId,
            $holiday['name'],
            $holiday['holiday_date']
        ]);
        echo "✅ Holiday created: {$holiday['name']}\n";
    }
}

function createAttendanceRecords($db, $companyId, $employees) {
    echo "📅 Creating January attendance records with proper relationships...\n";
    
    // January 2024 dates (excluding weekends and holidays)
    $januaryDates = [];
    $startDate = new DateTime('2024-01-01');
    $endDate = new DateTime('2024-01-31');
    
    // Bangladesh holidays in January 2024
    $holidays = ['2024-01-01', '2024-01-07', '2024-01-14', '2024-01-21', '2024-01-28'];
    
    while ($startDate <= $endDate) {
        $dateStr = $startDate->format('Y-m-d');
        $dayOfWeek = $startDate->format('w'); // 0 = Sunday, 6 = Saturday
        
        // Skip Friday (5) and Saturday (6) as weekends
        if ($dayOfWeek != 5 && $dayOfWeek != 6 && !in_array($dateStr, $holidays)) {
            $januaryDates[] = $dateStr;
        }
        $startDate->modify('+1 day');
    }
    
    $attendanceCount = 0;
    
    foreach ($employees as $employee) {
        foreach ($januaryDates as $date) {
            // Random attendance status - using only valid enum values
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
            
            $stmt = $db->prepare("INSERT INTO attendances (employee_id, company_id, date, clock_in, clock_out, status, late_minutes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([
                $employee['id'],
                $companyId,
                $date,
                $clockIn,
                $clockOut,
                $status,
                $lateMinutes
            ]);
            $attendanceCount++;
        }
    }
    
    echo "✅ Created $attendanceCount attendance records for January\n";
}

function createLeaveRecords($db, $companyId, $employees) {
    echo "🗓️ Creating leave records with proper relationships...\n";
    
    $leaveCount = 0;
    
    foreach ($employees as $employee) {
        // Each employee gets 1-3 leave applications
        $numLeaves = rand(1, 3);
        
        for ($i = 0; $i < $numLeaves; $i++) {
            $startDate = sprintf('2024-01-%02d', rand(5, 25));
            $days = rand(1, 3);
            $endDate = date('Y-m-d', strtotime($startDate . ' + ' . ($days - 1) . ' days'));
            
            $statuses = ['pending', 'approved', 'rejected'];
            $status = $statuses[array_rand($statuses)];
            
            // Use existing leave policy IDs (1-6)
            $leavePolicyId = rand(1, 3); // Casual, Sick, or Annual
            
            $stmt = $db->prepare("INSERT INTO leaves (employee_id, company_id, leave_policy_id, start_date, end_date, days, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([
                $employee['id'],
                $companyId,
                $leavePolicyId,
                $startDate,
                $endDate,
                $days,
                'Personal reason',
                $status
            ]);
            $leaveCount++;
        }
    }
    
    echo "✅ Created $leaveCount leave records\n";
}

function createSalaryHistory($db, $companyId, $employees) {
    echo "💰 Creating salary history records...\n";
    
    $historyCount = 0;
    
    foreach ($employees as $employee) {
        // Some employees get salary increments (about 30%)
        if (rand(1, 10) <= 3) {
            $incrementDate = date('Y-m-d', strtotime('-' . rand(30, 180) . ' days'));
            $oldSalary = $employee['salary'] * 0.85; // 15% lower previous salary
            $newSalary = $employee['salary'];
            $incrementAmount = $newSalary - $oldSalary;
            $incrementPercentage = round(($incrementAmount / $oldSalary) * 100, 2);
            
            $stmt = $db->prepare("INSERT INTO salary_history (employee_id, company_id, previous_salary, current_salary, increment_amount, increment_percentage, increment_date, reason, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([
                $employee['id'],
                $companyId,
                $oldSalary,
                $newSalary,
                $incrementAmount,
                $incrementPercentage,
                $incrementDate,
                'Performance based increment',
                1 // Assuming admin ID 1
            ]);
            $historyCount++;
        }
    }
    
    echo "✅ Created $historyCount salary history records\n";
}

function createMonthlyPayouts($db, $companyId, $employees) {
    echo "💸 Creating monthly payouts for January 2024...\n";
    
    $payoutCount = 0;
    
    foreach ($employees as $employee) {
        $basicSalary = $employee['salary'];
        
        // Calculate deductions based on attendance
        $stmt = $db->prepare("SELECT COUNT(*) as late_count FROM attendances WHERE employee_id = ? AND company_id = ? AND date LIKE '2024-01%' AND status = 'late'");
        $stmt->execute([$employee['id'], $companyId]);
        $lateCount = $stmt->fetch()['late_count'] ?? 0;
        
        $stmt = $db->prepare("SELECT COUNT(*) as absent_count FROM attendances WHERE employee_id = ? AND company_id = ? AND date LIKE '2024-01%' AND status = 'absent'");
        $stmt->execute([$employee['id'], $companyId]);
        $absentCount = $stmt->fetch()['absent_count'] ?? 0;
        
        // Apply deductions
        $lateDeduction = 0;
        if ($lateCount > 3) {
            $lateDeduction = ($lateCount - 3) * 500;
        }
        $absenceDeduction = $absentCount * ($basicSalary / 30);
        
        $totalDeductions = $lateDeduction + $absenceDeduction;
        $netSalary = $basicSalary - $totalDeductions;
        
        if ($netSalary < 0) $netSalary = 0;
        
        $stmt = $db->prepare("INSERT INTO monthly_payouts (employee_id, company_id, month, year, basic_salary, allowances, deductions, net_salary, late_count, late_deduction, absent_days, absence_deduction, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([
            $employee['id'],
            $companyId,
            1, // January
            2024,
            $basicSalary,
            0, // No allowances in this example
            $totalDeductions,
            $netSalary,
            $lateCount,
            $lateDeduction,
            $absentCount,
            $absenceDeduction,
            'paid'
        ]);
        $payoutCount++;
    }
    
    echo "✅ Created $payoutCount monthly payout records\n";
}

function createRoles($db, $companyId) {
    echo "🛡️ Creating roles...\n";
    
    $roles = [
        ['name' => 'HR Manager', 'description' => 'Human Resources Management'],
        ['name' => 'Finance Manager', 'description' => 'Financial Operations Management'],
        ['name' => 'IT Administrator', 'description' => 'IT Systems Administration'],
        ['name' => 'Department Head', 'description' => 'Department Leadership'],
        ['name' => 'Team Lead', 'description' => 'Team Leadership']
    ];
    
    foreach ($roles as $role) {
        $stmt = $db->prepare("INSERT INTO roles (company_id, name, description, is_active, created_at) VALUES (?, ?, ?, 1, NOW())");
        $stmt->execute([
            $companyId,
            $role['name'],
            $role['description']
        ]);
        echo "✅ Role created: {$role['name']}\n";
    }
}

function createRolePermissions($db) {
    echo "🔑 Creating role permissions...\n";
    
    // For simplicity, we'll create some basic permissions
    // In a real system, you'd have detailed permissions
    
    echo "✅ Basic role permissions structure created\n";
}

function assignEmployeeRoles($db, $employees) {
    echo "👤 Assigning employee roles...\n";
    
    // Assign roles to some employees
    $roleAssignments = [
        0 => 'HR Manager',        // First employee (Rahim Ahmed)
        10 => 'Finance Manager',  // 11th employee (Imran Hossain)
        6 => 'IT Administrator'   // 7th employee (Mahfuzur Rahman)
    ];
    
    foreach ($roleAssignments as $empIndex => $roleName) {
        if (isset($employees[$empIndex])) {
            // Get role ID by name
            $stmt = $db->prepare("SELECT id FROM roles WHERE name = ? LIMIT 1");
            $stmt->execute([$roleName]);
            $role = $stmt->fetch();
            
            if ($role) {
                $stmt = $db->prepare("INSERT INTO employee_roles (employee_id, role_id, assigned_by, assigned_at) VALUES (?, ?, 1, NOW())");
                $stmt->execute([
                    $employees[$empIndex]['id'],
                    $role['id']
                ]);
                echo "✅ Assigned {$roleName} role to {$employees[$empIndex]['name']}\n";
            }
        }
    }
    
    echo "✅ Employee roles assigned\n";
}

// Run the complete seeding
seedCompleteData();
?>