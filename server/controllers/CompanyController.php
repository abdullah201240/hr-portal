<?php
// server/controllers/CompanyController.php

require_once __DIR__ . '/../models/Company.php';
require_once __DIR__ . '/../helpers/functions.php';

class CompanyController
{
    private $company;

    public function __construct()
    {
        $this->company = new Company();
    }

    public function index()
    {
        try {
            $companies = $this->company->all();
            // Don't return password in the response
            foreach ($companies as &$company) {
                unset($company['password']);
            }
            jsonResponse(['success' => true, 'data' => $companies]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $company = $this->company->find($id);
            
            if (!$company) {
                jsonResponse(['success' => false, 'message' => 'Company not found'], 404);
            }
            
            // Don't return password in the response
            unset($company['password']);
            jsonResponse(['success' => true, 'data' => $company]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store()
    {
        try {
            $data = getRequestData();
            
            // Validate input
            $errors = $this->company->validate($data);
            if (!empty($errors)) {
                jsonResponse(['success' => false, 'errors' => $errors], 422);
            }
            
            // Set default status to inactive for new companies
            if (!isset($data['status'])) {
                $data['status'] = 'inactive';
            }
            
            $companyId = $this->company->create($data);
            $createdCompany = $this->company->find($companyId);
            
            // Don't return password in the response
            unset($createdCompany['password']);
            
            jsonResponse(['success' => true, 'message' => 'Company created successfully', 'data' => $createdCompany], 201);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update($id)
    {
        try {
            $data = getRequestData();
            
            // Validate input
            $errors = $this->company->validate($data);
            if (!empty($errors)) {
                jsonResponse(['success' => false, 'errors' => $errors], 422);
            }
            
            $result = $this->company->update($id, $data);
            
            if (!$result) {
                jsonResponse(['success' => false, 'message' => 'Company not found'], 404);
            }
            
            $updatedCompany = $this->company->find($id);
            
            // Don't return password in the response
            unset($updatedCompany['password']);
            
            jsonResponse(['success' => true, 'message' => 'Company updated successfully', 'data' => $updatedCompany]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $result = $this->company->delete($id);
            
            if (!$result) {
                jsonResponse(['success' => false, 'message' => 'Company not found'], 404);
            }
            
            jsonResponse(['success' => true, 'message' => 'Company deleted successfully']);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function login()
    {
        try {
            $data = getRequestData();
            
            if (empty($data['email']) || empty($data['password'])) {
                jsonResponse(['success' => false, 'message' => 'Email and password are required'], 400);
            }
            
            $result = $this->company->authenticate($data['email'], $data['password']);
            
            if ($result === false) {
                jsonResponse(['success' => false, 'message' => 'Invalid credentials'], 401);
            }
            
            if (isset($result['error'])) {
                jsonResponse(['success' => false, 'message' => $result['error']], 401);
            }
            
            // Don't return password in the response
            unset($result['password']);
            
            jsonResponse([
                'success' => true, 
                'message' => 'Login successful', 
                'data' => $result
            ]);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}