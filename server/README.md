# HR Portal Server API

This is the server-side component of the HR Portal built with PHP using OOP principles.

## Project Structure

The server follows a Model-View-Controller (MVC) pattern with the following directory structure:

- `config/` - Database configuration
- `controllers/` - Request handling logic for companies and admins
- `database/` - Database connection class
- `helpers/` - Utility functions
- `migrations/` - Database schema management
- `models/` - Data models and business logic
- `run-migrations.php` - Migration runner script
- `run-admin-seeds.php` - Admin data seeding script
- `index.php` - Main entry point and router

## Features

- Full OOP structure with models, controllers, and migrations
- RESTful API for company and admin management
- Database migrations system
- CRUD operations for companies and admins
- User authentication and authorization
- Account status management (active/inactive/suspended)
- Admin role management (super_admin, admin)
- Last login tracking for admins

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

### Admin Endpoints
- `GET /api/admins` - Get all admins
- `POST /api/admins` - Create a new admin
- `GET /api/admins/{id}` - Get a specific admin
- `PUT /api/admins/{id}` - Update a specific admin
- `DELETE /api/admins/{id}` - Delete a specific admin
- `POST /api/admins/login` - Authenticate admin login
- `POST /api/admins/logout` - Logout admin

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
- `status` (optional) - Company status (active, inactive, suspended) - defaults to inactive

## Admin Fields

When creating or updating an admin, you can include:

- `name` (required) - Admin name
- `email` (required) - Admin email
- `password` (required for creation, optional for updates) - Admin password (min 6 characters)
- `role` (optional) - Admin role (super_admin, admin) - defaults to admin
- `status` (optional) - Admin status (active, inactive, suspended) - defaults to active

## Security Features

- Passwords are securely hashed using PHP's password_hash() function with the PASSWORD_DEFAULT algorithm
- Authentication checks account status before allowing access
- Sensitive fields like passwords are excluded from API responses
- Input validation is performed on all data fields
- SQL injection prevention through prepared statements

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

### Login
```bash
curl -X POST http://localhost:8000/api/companies/login \
  -H "Content-Type: application/json" \
  -d '{"email":"contact@sample.com","password":"secure123"}'
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

## Database Schema

The system creates two main tables:

- `companies` table: Stores company information including name, email, password, address, contact details, and status
- `admins` table: Stores admin information including name, email, password, role, status, and last login time

Both tables include timestamps for creation and updates.

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