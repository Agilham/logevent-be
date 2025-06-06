// src/__tests__/controllers/admin.controller.test.ts (or src/controllers/__tests__/admin.controller.test.ts)

import { Request, Response } from 'express';
import AdminController from '../../controllers/admin.controller'; // Adjust path if needed
import adminRepository from '../../repositories/admin.repository'; // Adjust path if needed
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

// Mock the adminRepository module
jest.mock('../../repositories/admin.repository');

describe('AdminController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockAdminRepository: DeepMockProxy<typeof adminRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockAdminRepository = mockDeep<typeof adminRepository>();

    jest.clearAllMocks();
  });

  // --- readAllAdmins Tests ---
  describe('readAllAdmins', () => {
    it('should return all admins with status 200', async () => {
      const mockAdmins = [{ id: 1, email: 'admin1@example.com' }, { id: 2, email: 'admin2@example.com' }];
      mockAdminRepository.findAllAdmins.mockResolvedValue(mockAdmins as any);

      await AdminController.readAllAdmins(mockRequest as Request, mockResponse as Response);

      expect(mockAdminRepository.findAllAdmins).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAdmins);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockAdminRepository.findAllAdmins.mockRejectedValue(new Error(errorMessage));

      await AdminController.readAllAdmins(mockRequest as Request, mockResponse as Response);

      expect(mockAdminRepository.findAllAdmins).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readAdminById Tests ---
  describe('readAdminById', () => {
    it('should return an admin by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockAdmin = { id: 1, email: 'admin1@example.com' };
      mockAdminRepository.findAdminById.mockResolvedValue(mockAdmin as any);

      await AdminController.readAdminById(mockRequest as Request, mockResponse as Response);

      expect(mockAdminRepository.findAdminById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAdmin);
    });

    it('should return 404 if admin not found', async () => {
      mockRequest.params = { id: '999' };
      mockAdminRepository.findAdminById.mockResolvedValue(null);

      await AdminController.readAdminById(mockRequest as Request, mockResponse as Response);

      expect(mockAdminRepository.findAdminById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Admin not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Admin details error';
      mockAdminRepository.findAdminById.mockRejectedValue(new Error(errorMessage));

      await AdminController.readAdminById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createAdmin Tests ---
  describe('createAdmin', () => {
    it('should create an admin with status 201', async () => {
      const createBody = { email: 'newadmin@example.com' };
      mockRequest.body = createBody;
      const newAdmin = { id: 3, ...createBody };
      mockAdminRepository.createAdmin.mockResolvedValue(newAdmin as any);

      await AdminController.createAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockAdminRepository.createAdmin).toHaveBeenCalledWith({ email: createBody.email });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newAdmin);
    });

    it('should return 500 if an error occurs', async () => {
      const createBody = { email: 'newadmin@example.com' };
      mockRequest.body = createBody;
      const errorMessage = 'Creation error';
      mockAdminRepository.createAdmin.mockRejectedValue(new Error(errorMessage));

      await AdminController.createAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateAdmin Tests ---
  describe('updateAdmin', () => {
    const existingAdmin = { id: 1, email: 'oldadmin@example.com' };

    it('should update an admin with status 200 when email is provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { email: 'updatedadmin@example.com' };
      const updatedAdmin = { ...existingAdmin, email: 'updatedadmin@example.com' };
      mockAdminRepository.findAdminById.mockResolvedValue(existingAdmin as any);
      mockAdminRepository.updateAdmin.mockResolvedValue(updatedAdmin as any);

      await AdminController.updateAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockAdminRepository.findAdminById).toHaveBeenCalledWith(1);
      expect(mockAdminRepository.updateAdmin).toHaveBeenCalledWith(1, { email: 'updatedadmin@example.com' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedAdmin);
    });

    it('should update an admin using existing email if new email is not provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {}; // No email provided in body
      mockAdminRepository.findAdminById.mockResolvedValue(existingAdmin as any);
      // The updateAdmin call should use the existing email due to `email || admin.email`
      mockAdminRepository.updateAdmin.mockResolvedValue(existingAdmin as any); // Result is same as existing if no change

      await AdminController.updateAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockAdminRepository.findAdminById).toHaveBeenCalledWith(1);
      expect(mockAdminRepository.updateAdmin).toHaveBeenCalledWith(1, { email: existingAdmin.email });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(existingAdmin);
    });

    it('should return 404 if admin not found during update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { email: 'updatedadmin@example.com' };
      mockAdminRepository.findAdminById.mockResolvedValue(null);

      await AdminController.updateAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockAdminRepository.findAdminById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Admin not found' });
      expect(mockAdminRepository.updateAdmin).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { email: 'updatedadmin@example.com' };
      const errorMessage = 'Update error';
      mockAdminRepository.findAdminById.mockResolvedValue(existingAdmin as any);
      mockAdminRepository.updateAdmin.mockRejectedValue(new Error(errorMessage));

      await AdminController.updateAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteAdmin Tests ---
  describe('deleteAdmin', () => {
    it('should delete an admin with status 204', async () => {
      mockRequest.params = { id: '1' };
      const existingAdmin = { id: 1, email: 'admin@example.com' };
      mockAdminRepository.findAdminById.mockResolvedValue(existingAdmin as any);
      mockAdminRepository.deleteAdmin.mockResolvedValue(existingAdmin as any); // Mock with any resolved value

      await AdminController.deleteAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockAdminRepository.findAdminById).toHaveBeenCalledWith(1);
      expect(mockAdminRepository.deleteAdmin).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if admin not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockAdminRepository.findAdminById.mockResolvedValue(null);

      await AdminController.deleteAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockAdminRepository.findAdminById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Admin not found' });
      expect(mockAdminRepository.deleteAdmin).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Deletion error';
      mockAdminRepository.findAdminById.mockResolvedValue({ id: 1, email: 'admin@example.com' }); // Mock existing admin
      mockAdminRepository.deleteAdmin.mockRejectedValue(new Error(errorMessage));

      await AdminController.deleteAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = AdminController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(5); // Expecting 5 routes based on your controller
    });
  });
});