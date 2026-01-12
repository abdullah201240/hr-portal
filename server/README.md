# HR Portal Server API

This is the server-side component of the HR Portal built with PHP using OOP principles. The system provides comprehensive HR management capabilities including company management, employee management, departments, and designations.

## Project Structure

The server follows a Model-View-Controller (MVC) pattern with the following directory structure:

- `config/` - Database configuration
- `controllers/` - Request handling logic for companies, admins, departments, designations, and employees
- `database/` - Database connection class
- `helpers/` - Utility functions
- `migrations/` - Database schema management
- `models/` - Data models and business logic
- `run-migrations.php` - Migration runner script
- `run-admin-seeds.php` - Admin data seeding script
- `index.php` - Main entry point and router

## Features

- Full OOP structure with models, controllers, and migrations
- RESTful API for comprehensive HR management
- Database migrations system
- CRUD operations for companies, admins, departments, designations, and employees
- User authentication and authorization
- Account status management (active/inactive/suspended)
- Admin role management (super_admin, admin)
- Last login tracking for admins
- Company-specific data isolation (each company manages their own departments, designations, and employees)
- File upload functionality for company logos and employee images
- Comprehensive dashboard statistics for admin users
- Pagination and search capabilities for large datasets

## Setup Instructions

1. Make sure you have PHP installed on your system
2. Ensure MySQL is running and accessible
3. Update the database credentials in `config/database.php` if needed
4. Run the migrations to create the database tables:
   ```bash
   cd server
   php run-migrations.php
   ```

## Running the Server

To run the server on port 8000:

```bash
cd server
php -S localhost:8000
```

The server includes CORS support allowing cross-origin requests from any domain. The server handles preflight requests (OPTIONS) automatically and supports GET, POST, PUT, DELETE, and OPTIONS HTTP methods.

## API Endpoints

### Company Endpoints
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create a new company
- `GET /api/companies/{id}` - Get a specific company
- `PUT /api/companies/{id}` - Update a specific company
- `DELETE /api/companies/{id}` - Delete a specific company
- `POST /api/companies/login` - Authenticate company login
- `GET /api/companies/me` - Get current authenticated company profile
- `POST /api/companies/logout` - Logout company
- `POST /api/companies/upload-logo` - Upload company logo
- `GET /api/uploads/logos/{filename}` - Serve company logo image

### Admin Endpoints
- `GET /api/admins` - Get all admins
- `POST /api/admins` - Create a new admin
- `GET /api/admins/{id}` - Get a specific admin
- `PUT /api/admins/{id}` - Update a specific admin
- `DELETE /api/admins/{id}` - Delete a specific admin
- `POST /api/admins/login` - Authenticate admin login
- `POST /api/admins/logout` - Logout admin
- `GET /api/admins/me` - Get current authenticated admin profile
- `GET /api/dashboard/stats` - Get dashboard statistics

### Department Endpoints
- `GET /api/departments` - Get all departments for the authenticated company (supports pagination, search, sorting)
- `POST /api/departments` - Create a new department for the authenticated company
- `GET /api/departments/{id}` - Get a specific department
- `PUT /api/departments/{id}` - Update a specific department
- `DELETE /api/departments/{id}` - Delete a specific department

### Designation Endpoints
- `GET /api/designations` - Get all designations for the authenticated company (supports pagination, search, sorting)
- `POST /api/designations` - Create a new designation for the authenticated company
- `GET /api/designations/{id}` - Get a specific designation
- `PUT /api/designations/{id}` - Update a specific designation
- `DELETE /api/designations/{id}` - Delete a specific designation

### Employee Endpoints
- `GET /api/employees` - Get all employees for the authenticated company (supports pagination, search, sorting)
- `POST /api/employees` - Create a new employee for the authenticated company
- `GET /api/employees/{id}` - Get a specific employee
- `PUT /api/employees/{id}` - Update a specific employee
- `DELETE /api/employees/{id}` - Delete a specific employee

## Company Fields

When creating or updating a company, you can include:

- `name` (required) - Company name
- `email` (required) - Company email
- `password` (required for creation, optional for updates) - Company password (min 6 characters)
- `address` (required) - Company address
- `phone` (optional) - Company phone number
- `website` (optional) - Company website URL
- `description` (optional) - Company description
- `logo` (optional) - Company logo URL/path
- `established_date` (optional) - Company established date (YYYY-MM-DD)
- `industry` (optional) - Industry of the company
- `status` (optional) - Company status (active, inactive, suspended) - defaults to inactive

## Admin Fields

When creating or updating an admin, you can include:

- `name` (required) - Admin name
- `email` (required) - Admin email
- `password` (required for creation, optional for updates) - Admin password (min 6 characters)
- `role` (optional) - Admin role (super_admin, admin) - defaults to admin
- `status` (optional) - Admin status (active, inactive, suspended) - defaults to active

## Department Fields

When creating or updating a department, you can include:

- `name` (required) - Department name
- `description` (optional) - Department description
- `status` (optional) - Department status (active, inactive) - defaults to active

## Designation Fields

When creating or updating a designation, you can include:

- `name` (required) - Designation name
- `department_id` (optional) - Associated department ID
- `description` (optional) - Designation description
- `status` (optional) - Designation status (active, inactive) - defaults to active

## Employee Fields

When creating or updating an employee, you can include:

- `employeeId` (required) - Unique employee ID
- `name` (required) - Employee name
- `email` (required) - Employee email
- `password` (optional) - Employee password (for employee portal access)
- `phone` (optional) - Employee phone number
- `dob` (optional) - Date of birth (YYYY-MM-DD)
- `gender` (optional) - Gender (male, female, other)
- `bloodGroup` (optional) - Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `companyId` (system-generated) - Associated company ID (automatically set from token)
- `designation` (optional) - Employee designation
- `department` (optional) - Employee department
- `maritalStatus` (optional) - Marital status (single, married, divorced, widowed)
- `currentAddress` (optional) - Current address
- `joinDate` (optional) - Joining date (YYYY-MM-DD)
- `salary` (optional) - Salary amount
- `status` (optional) - Employee status (active, inactive) - defaults to active
- `employeeType` (optional) - Type of employment (full-time, part-time, contract, intern)
- `personalMobile` (optional) - Personal mobile number
- `emergencyContactNumber` (optional) - Emergency contact number
- `bankName` (optional) - Bank name
- `accountNumber` (optional) - Bank account number
- `image` (optional) - Employee photo URL/path

## Security Features

- Passwords are securely hashed using PHP's password_hash() function with the PASSWORD_DEFAULT algorithm
- Authentication checks account status before allowing access
- Sensitive fields like passwords are excluded from API responses
- Input validation is performed on all data fields
- SQL injection prevention through prepared statements
- Company data isolation - each company can only access their own departments, designations, and employees
- Token-based authentication for secure access to protected endpoints

Companies can only login if their status is "active". The authentication system will reject login attempts from companies with "inactive" or "suspended" status.

Admins can only login if their status is "active". The authentication system will reject login attempts from admins with "inactive" or "suspended" status. Upon successful admin login, the last_login field is updated and a simple token is generated.

## Example Requests

### Create a Company
```bash
curl -X POST http://localhost:8000/api/companies \
  -H "Content-Type: application/json" \
  -d '{"name":"Sample Company","email":"contact@sample.com","password":"secure123","address":"123 Main St","phone":"+1234567890","website":"https://sample.com","description":"A sample company","status":"active"}'
```

### Get All Companies
```bash
curl http://localhost:8000/api/companies
```

### Update a Company
```bash
curl -X PUT http://localhost:8000/api/companies/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Company","email":"updated@sample.com","address":"456 New St","status":"active"}'
```

### Delete a Company
```bash
curl -X DELETE http://localhost:8000/api/companies/1
```

### Company Login
```bash
curl -X POST http://localhost:8000/api/companies/login \
  -H "Content-Type: application/json" \
  -d '{"email":"contact@sample.com","password":"secure123"}'
```

### Get Current Company Profile
```bash
curl -X GET http://localhost:8000/api/companies/me \
  -H "Authorization: Bearer {company_token}"
```

### Upload Company Logo
```bash
curl -X POST http://localhost:8000/api/companies/upload-logo \
  -H "Authorization: Bearer {company_token}" \
  -F "logo=@/path/to/logo.jpg"
```

### Create an Admin
```bash
curl -X POST http://localhost:8000/api/admins \
  -H "Content-Type: application/json" \
  -d '{"name":"John Admin","email":"john@example.com","password":"secure123","role":"admin","status":"active"}'
```

### Get All Admins
```bash
curl http://localhost:8000/api/admins
```

### Update an Admin
```bash
curl -X PUT http://localhost:8000/api/admins/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Admin","email":"updated@example.com","role":"super_admin","status":"active"}'
```

### Delete an Admin
```bash
curl -X DELETE http://localhost:8000/api/admins/1
```

### Admin Login
```bash
curl -X POST http://localhost:8000/api/admins/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secure123"}'
```

### Get Dashboard Statistics
```bash
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer {admin_token}"
```

### Create a Department
```bash
curl -X POST http://localhost:8000/api/departments \
  -H "Authorization: Bearer {company_token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Engineering","description":"Engineering department","status":"active"}'
```

### Get All Departments
```bash
curl -X GET http://localhost:8000/api/departments \
  -H "Authorization: Bearer {company_token}"
```

### Create an Employee
```bash
curl -X POST http://localhost:8000/api/employees \
  -H "Authorization: Bearer {company_token}" \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"EMP001","name":"John Doe","email":"john@example.com","designation":"Software Engineer","department":"Engineering","status":"active"}'
```

### Get All Employees
```bash
curl -X GET http://localhost:8000/api/employees \
  -H "Authorization: Bearer {company_token}"
```

## Database Schema

The system creates multiple tables to support comprehensive HR management:

- `companies` table: Stores company information including name, email, password, address, contact details, and status
- `admins` table: Stores admin information including name, email, password, role, status, and last login time
- `departments` table: Stores department information linked to companies
- `designations` table: Stores designation information linked to companies and departments
- `employees` table: Stores employee information linked to companies

All tables include timestamps for creation and updates.

## Database Migrations

The system uses a migration system to manage database schema changes:
```bash
php run-migrations.php
```

## Database Seeding

The system includes admin seeding functionality to create sample admin accounts:
```bash
php run-migrations.php --seed
```

Alternatively, you can run the seed file directly:
```bash
php run-admin-seeds.php
```

This will create 5 sample admin accounts with predefined credentials.

## Rollback Migrations

If you need to rollback the migrations:
```bash
php run-migrations.php rollback
```

## Database Configuration

The default database configuration assumes:
- Host: 127.0.0.1
- Database name: HR
- Username: root
- Password: (empty)
- Port: 3306

### For XAMPP Users:
1. Start Apache and MySQL from XAMPP Control Panel
2. Make sure MySQL is running on port 3306
3. Access phpMyAdmin to manually create the HR database if needed

### For Other Environments:
Update `config/database.php` if your setup is different.