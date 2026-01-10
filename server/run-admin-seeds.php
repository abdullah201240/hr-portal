<?php
// server/run-admin-seeds.php

require_once __DIR__ . '/models/Admin.php';

function seedAdmins() {
    $adminModel = new Admin();
    
    // Sample admin data
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
        ],
        [
            'name' => 'Michael Brown',
            'email' => 'michael.admin@hrportal.com',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'role' => 'admin',
            'status' => 'active'
        ],
        [
            'name' => 'Emily Davis',
            'email' => 'emily.admin@hrportal.com',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'role' => 'admin',
            'status' => 'active'
        ],
        [
            'name' => 'David Wilson',
            'email' => 'david.admin@hrportal.com',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'role' => 'admin',
            'status' => 'active'
        ]
    ];

    foreach ($admins as $adminData) {
        // Check if admin with email already exists
        $existingAdmin = $adminModel->findByEmail($adminData['email']);
        if (!$existingAdmin) {
            try {
                $adminId = $adminModel->create($adminData);
                echo "Created admin: {$adminData['name']} ({$adminData['email']}) with ID: $adminId\n";
            } catch (Exception $e) {
                echo "Error creating admin {$adminData['email']}: " . $e->getMessage() . "\n";
            }
        } else {
            echo "Admin with email {$adminData['email']} already exists, skipping...\n";
        }
    }
}

// Run the seeding
seedAdmins();