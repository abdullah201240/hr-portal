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
            sisterConcernId INT NULL,
            photo VARCHAR(500),
            nid VARCHAR(50),
            nidPhoto VARCHAR(500),
            tinNumber VARCHAR(50),
            designation VARCHAR(255),
            department VARCHAR(255),
            maritalStatus ENUM('single', 'married', 'divorced', 'widowed'),
            spouseName VARCHAR(255),
            spouseNid VARCHAR(50),
            spouseNidPhoto VARCHAR(500),
            marriageCertificate VARCHAR(500),
            children JSON,
            nominee JSON,
            lineManager JSON,
            currentAddress TEXT,
            permanentAddress TEXT,
            joinDate DATE,
            salary DECIMAL(10, 2),
            status ENUM('active', 'inactive') DEFAULT 'active',
            employeeType ENUM('full-time', 'part-time', 'contract', 'intern'),
            employeeTypeChangeDate DATE,
            employeeTypeHistory JSON,
            isFreedomFighter BOOLEAN DEFAULT FALSE,
            freedomFighterDoc VARCHAR(500),
            isThirdGender BOOLEAN DEFAULT FALSE,
            thirdGenderDoc VARCHAR(500),
            hasPF BOOLEAN DEFAULT FALSE,
            nameBangla VARCHAR(255),
            fatherName VARCHAR(255),
            fatherNameBangla VARCHAR(255),
            motherName VARCHAR(255),
            motherNameBangla VARCHAR(255),
            religion ENUM('Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other'),
            personalMobile VARCHAR(50),
            personalEmail VARCHAR(255),
            emergencyContactName VARCHAR(255),
            emergencyContactRelation VARCHAR(100),
            emergencyContactNumber VARCHAR(50),
            bankName VARCHAR(255),
            bankBranch VARCHAR(255),
            accountNumber VARCHAR(255),
            accountType ENUM('savings', 'current', 'fixed'),
            routingNumber VARCHAR(50),
            swiftCode VARCHAR(20),
            ibanNumber VARCHAR(50),
            bankStatement VARCHAR(500),
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