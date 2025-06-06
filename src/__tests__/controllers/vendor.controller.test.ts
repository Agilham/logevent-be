// src/__tests__/controllers/vendor.controller.test.ts

import { Request, Response } from 'express';
import VendorController from '../../controllers/vendor.controller'; // Adjust path if needed
import vendorRepository from '../../repositories/vendor.repository'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the vendorRepository module
jest.mock('../../repositories/vendor.repository');

describe('VendorController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockVendorRepository: DeepMockProxy<typeof vendorRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockVendorRepository = vendorRepository as DeepMockProxy<typeof vendorRepository>;

    jest.clearAllMocks();
  });

  // --- readAllVendors Tests ---
  describe('readAllVendors', () => {
    it('should return all vendors with status 200', async () => {
      const mockVendors = [{ id: 1, name: 'Vendor 1' }, { id: 2, name: 'Vendor 2' }];
      mockVendorRepository.findAllVendorDetails.mockResolvedValue(mockVendors as any);

      await VendorController.readAllVendors(mockRequest as Request, mockResponse as Response);

      expect(mockVendorRepository.findAllVendorDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockVendors);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockVendorRepository.findAllVendorDetails.mockRejectedValue(new Error(errorMessage));

      await VendorController.readAllVendors(mockRequest as Request, mockResponse as Response);

      expect(mockVendorRepository.findAllVendorDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readVendorById Tests ---
  describe('readVendorById', () => {
    it('should return a vendor by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockVendor = { id: 1, name: 'Test Vendor' };
      mockVendorRepository.findVendorDetailById.mockResolvedValue(mockVendor as any);

      await VendorController.readVendorById(mockRequest as Request, mockResponse as Response);

      expect(mockVendorRepository.findVendorDetailById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockVendor);
    });

    it('should return 404 if vendor not found', async () => {
      mockRequest.params = { id: '999' };
      mockVendorRepository.findVendorDetailById.mockResolvedValue(null);

      await VendorController.readVendorById(mockRequest as Request, mockResponse as Response);

      expect(mockVendorRepository.findVendorDetailById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Vendor not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Vendor details error';
      mockVendorRepository.findVendorDetailById.mockRejectedValue(new Error(errorMessage));

      await VendorController.readVendorById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createVendor Tests ---
  describe('createVendor', () => {
    it('should create a vendor with status 201', async () => {
      const createBody = {
        cityId: 1,
        email: 'vendor@example.com',
        name: 'New Vendor Co.',
        phone: '1234567890',
        address: '123 Vendor St',
        instagram: 'newvendor',
        socialMedia: 'facebook.com/newvendor',
        documentUrl: 'doc_url.pdf'
      };
      mockRequest.body = createBody;
      const newVendor = { id: 3, ...createBody };
      mockVendorRepository.createVendor.mockResolvedValue(newVendor as any);

      await VendorController.createVendor(mockRequest as Request, mockResponse as Response);

      expect(mockVendorRepository.createVendor).toHaveBeenCalledWith(createBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newVendor);
    });

    it('should return 500 if an error occurs', async () => {
      const createBody = {
        cityId: 1,
        email: 'vendor@example.com',
        name: 'New Vendor Co.',
        phone: '1234567890',
        address: '123 Vendor St',
        instagram: 'newvendor',
        socialMedia: 'facebook.com/newvendor',
        documentUrl: 'doc_url.pdf'
      };
      mockRequest.body = createBody;
      const errorMessage = 'Creation error';
      mockVendorRepository.createVendor.mockRejectedValue(new Error(errorMessage));

      await VendorController.createVendor(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateVendor Tests ---
  describe('updateVendor', () => {
    const existingVendor = {
      id: 1,
      cityId: 10,
      email: 'old@example.com',
      name: 'Old Vendor Co.',
      phone: '111',
      address: 'Old Address',
      instagram: 'oldvendor',
      socialMedia: 'old_social',
      documentUrl: 'old_doc.pdf'
    };

    it('should update a vendor with status 200 when all fields are provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = {
        cityId: 11,
        email: 'new@example.com',
        name: 'Updated Vendor Co.',
        phone: '222',
        address: 'New Address',
        instagram: 'updatedvendor',
        socialMedia: 'new_social',
        documentUrl: 'new_doc.pdf'
      };
      mockRequest.body = updateBody;
      const updatedVendor = { ...existingVendor, ...updateBody };
      mockVendorRepository.findVendorById.mockResolvedValue(existingVendor as any);
      mockVendorRepository.updateVendor.mockResolvedValue(updatedVendor as any);

      await VendorController.updateVendor(mockRequest as Request, mockResponse as Response);

      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(1);
      expect(mockVendorRepository.updateVendor).toHaveBeenCalledWith(1, expect.objectContaining({
        cityId: updateBody.cityId,
        email: updateBody.email,
        name: updateBody.name,
        phone: updateBody.phone,
        address: updateBody.address,
        instagram: updateBody.instagram,
        socialMedia: updateBody.socialMedia,
        documentUrl: updateBody.documentUrl
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedVendor);
    });

    it('should update a vendor using existing values if fields are not provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { name: 'Only Name Changed', phone: '333' }; // Only updating name and phone
      mockRequest.body = updateBody;
      const updatedVendor = { ...existingVendor, ...updateBody };
      mockVendorRepository.findVendorById.mockResolvedValue(existingVendor as any);
      mockVendorRepository.updateVendor.mockResolvedValue(updatedVendor as any);

      await VendorController.updateVendor(mockRequest as Request, mockResponse as Response);

      expect(mockVendorRepository.updateVendor).toHaveBeenCalledWith(1, {
        cityId: existingVendor.cityId, // Retained
        email: existingVendor.email,   // Retained
        name: updateBody.name,         // Changed
        phone: updateBody.phone,       // Changed
        address: existingVendor.address, // Retained
        instagram: existingVendor.instagram, // Retained
        socialMedia: existingVendor.socialMedia, // Retained
        documentUrl: existingVendor.documentUrl // Retained
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedVendor);
    });

    it('should return 404 if vendor not found during update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Update' };
      mockVendorRepository.findVendorById.mockResolvedValue(null);

      await VendorController.updateVendor(mockRequest as Request, mockResponse as Response);

      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Vendor not found' });
      expect(mockVendorRepository.updateVendor).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Update' };
      const errorMessage = 'Update error';
      mockVendorRepository.findVendorById.mockResolvedValue(existingVendor as any);
      mockVendorRepository.updateVendor.mockRejectedValue(new Error(errorMessage));

      await VendorController.updateVendor(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteVendor Tests ---
  describe('deleteVendor', () => {
    it('should delete a vendor with status 204', async () => {
      mockRequest.params = { id: '1' };
      const existingVendor = { id: 1 };
      mockVendorRepository.findVendorById.mockResolvedValue(existingVendor as any);
      mockVendorRepository.deleteVendor.mockResolvedValue(existingVendor as any);

      await VendorController.deleteVendor(mockRequest as Request, mockResponse as Response);

      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(1);
      expect(mockVendorRepository.deleteVendor).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if vendor not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockVendorRepository.findVendorById.mockResolvedValue(null);

      await VendorController.deleteVendor(mockRequest as Request, mockResponse as Response);

      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Vendor not found' });
      expect(mockVendorRepository.deleteVendor).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Deletion error';
      mockVendorRepository.findVendorById.mockResolvedValue({
        id: 1,
        name: '',
        isDeleted: false,
        email: '',
        phone: '',
        address: '',
        cityId: 0,
        instagram: null,
        socialMedia: null,
        documentUrl: null,
        joinDate: new Date(),
      });
      mockVendorRepository.deleteVendor.mockRejectedValue(new Error(errorMessage));

      await VendorController.deleteVendor(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = VendorController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(5); // Expecting 5 routes based on your controller
    });
  });
});