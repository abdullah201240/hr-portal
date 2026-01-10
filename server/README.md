# HR Portal Server API

This is the server-side component of the HR Portal built with PHP using OOP principles.

## Features

- Full OOP structure with models, controllers, and migrations
- RESTful API for company management
- Database migrations system
- CRUD operations for companies
- User authentication and authorization
- Account status management (active/inactive/suspended)

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

## API Endpoints

- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create a new company
- `GET /api/companies/{id}` - Get a specific company
- `PUT /api/companies/{id}` - Update a specific company
- `DELETE /api/companies/{id}` - Delete a specific company
- `POST /api/companies/login` - Authenticate company login

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

## Authentication

Companies can only login if their status is "active". The authentication system will reject login attempts from companies with "inactive" or "suspended" status.

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