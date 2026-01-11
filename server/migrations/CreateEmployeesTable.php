<?php

require_once __DIR__ . '/Migration.php';

class CreateEmployeesTable extends Migration
{
    public function up()
    {
        $sql = "
        CREATE TABLE IF NOT EXISTS employees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employeeId VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255),
            phone VARCHAR(50),
            dob DATE,
            gender ENUM('male', 'female', 'other'),
            bloodGroup ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
            companyId INT NOT NULL,
            designation VARCHAR(255),
            department VARCHAR(255),
            maritalStatus ENUM('single', 'married', 'divorced', 'widowed'),
            currentAddress TEXT,
            joinDate DATE,
            salary DECIMAL(10, 2),
            status ENUM('active', 'inactive') DEFAULT 'active',
            employeeType ENUM('full-time', 'part-time', 'contract', 'intern'),
            personalMobile VARCHAR(50),
            emergencyContactNumber VARCHAR(50),
            bankName VARCHAR(255),
            accountNumber VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

        $this->db->exec($sql);
    }

    public function down()
    {
        $sql = "DROP TABLE IF EXISTS employees";
        $this->db->exec($sql);
    }
}