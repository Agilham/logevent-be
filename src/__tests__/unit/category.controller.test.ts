// src/__tests__/controllers/category.controller.test.ts

import { Request, Response } from 'express';
import CategoryController from '../../controllers/category.controller'; // Adjust path if needed
import categoryRepository from '../../repositories/category.repository'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the categoryRepository module
jest.mock('../../src/repositories/category.repository');

describe('CategoryController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCategoryRepository: DeepMockProxy<typeof categoryRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockCategoryRepository = categoryRepository as DeepMockProxy<typeof categoryRepository>;

    jest.clearAllMocks();
  });

  // --- readAllCategories Tests ---
  describe('readAllCategories', () => {
    it('should return all categories with status 200', async () => {
      const mockCategories = [{ id: 1, name: 'Cat 1' }, { id: 2, name: 'Cat 2' }];
      mockCategoryRepository.findAllCategories.mockResolvedValue(mockCategories as any);

      await CategoryController.readAllCategories(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findAllCategories).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCategories);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockCategoryRepository.findAllCategories.mockRejectedValue(new Error(errorMessage));

      await CategoryController.readAllCategories(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findAllCategories).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readProductCategories Tests ---
  describe('readProductCategories', () => {
    it('should return product categories with status 200', async () => {
      const mockCategories = [{ id: 1, name: 'Product Cat', type: 'Product' }];
      mockCategoryRepository.findProductCategories.mockResolvedValue(mockCategories as any);

      await CategoryController.readProductCategories(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findProductCategories).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCategories);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockCategoryRepository.findProductCategories.mockRejectedValue(new Error(errorMessage));

      await CategoryController.readProductCategories(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findProductCategories).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readEventCategories Tests ---
  describe('readEventCategories', () => {
    it('should return event categories with status 200', async () => {
      const mockCategories = [{ id: 1, name: 'Event Cat', type: 'Event' }];
      mockCategoryRepository.findEventCategories.mockResolvedValue(mockCategories as any);

      await CategoryController.readEventCategories(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findEventCategories).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCategories);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockCategoryRepository.findEventCategories.mockRejectedValue(new Error(errorMessage));

      await CategoryController.readEventCategories(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findEventCategories).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readCategoryById Tests ---
  describe('readCategoryById', () => {
    it('should return a category by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockCategory = { id: 1, name: 'Test Category' };
      mockCategoryRepository.findCategoryById.mockResolvedValue(mockCategory as any);

      await CategoryController.readCategoryById(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findCategoryById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCategory);
    });

    it('should return 404 if category not found', async () => {
      mockRequest.params = { id: '999' };
      mockCategoryRepository.findCategoryById.mockResolvedValue(null);

      await CategoryController.readCategoryById(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findCategoryById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Category not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Category details error';
      mockCategoryRepository.findCategoryById.mockRejectedValue(new Error(errorMessage));

      await CategoryController.readCategoryById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createCategory Tests ---
  describe('createCategory', () => {
    it('should create a category with status 201', async () => {
      const createBody = { name: 'New Category', fee: 50, type: 'Product' };
      mockRequest.body = createBody;
      const newCategory = { id: 3, ...createBody };
      mockCategoryRepository.createCategory.mockResolvedValue(newCategory as any);

      await CategoryController.createCategory(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.createCategory).toHaveBeenCalledWith(createBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newCategory);
    });

    it('should return 500 if an error occurs', async () => {
      const createBody = { name: 'New Category', fee: 50, type: 'Product' };
      mockRequest.body = createBody;
      const errorMessage = 'Creation error';
      mockCategoryRepository.createCategory.mockRejectedValue(new Error(errorMessage));

      await CategoryController.createCategory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateCategory Tests ---
  describe('updateCategory', () => {
    const existingCategory = { id: 1, name: 'Old Name', fee: 100, type: 'Product' };

    it('should update a category with status 200 when all fields are provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { name: 'Updated Name', fee: 150, type: 'Event' };
      mockRequest.body = updateBody;
      const updatedCategory = { ...existingCategory, ...updateBody };
      mockCategoryRepository.findCategoryById.mockResolvedValue(existingCategory as any);
      mockCategoryRepository.updateCategory.mockResolvedValue(updatedCategory as any);

      await CategoryController.updateCategory(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findCategoryById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.updateCategory).toHaveBeenCalledWith(1, {
        name: updateBody.name,
        fee: updateBody.fee,
        type: updateBody.type
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedCategory);
    });

    it('should update a category using existing name if new name is not provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { fee: 120 }; // Only updating fee
      mockRequest.body = updateBody;
      const updatedCategory = { ...existingCategory, ...updateBody, name: existingCategory.name };
      mockCategoryRepository.findCategoryById.mockResolvedValue(existingCategory as any);
      mockCategoryRepository.updateCategory.mockResolvedValue(updatedCategory as any);

      await CategoryController.updateCategory(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.updateCategory).toHaveBeenCalledWith(1, {
        name: existingCategory.name, // Should retain old name
        fee: updateBody.fee,
        type: existingCategory.type
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedCategory);
    });

    it('should update a category using existing fee if new fee is not provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { name: 'Only Name Update' }; // Only updating name
      mockRequest.body = updateBody;
      const updatedCategory = { ...existingCategory, ...updateBody, fee: existingCategory.fee };
      mockCategoryRepository.findCategoryById.mockResolvedValue(existingCategory as any);
      mockCategoryRepository.updateCategory.mockResolvedValue(updatedCategory as any);

      await CategoryController.updateCategory(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.updateCategory).toHaveBeenCalledWith(1, {
        name: updateBody.name,
        fee: existingCategory.fee, // Should retain old fee
        type: existingCategory.type
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedCategory);
    });

    it('should update a category using existing type if new type is not provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { fee: 200, name: 'Changed Name' }; // Updating fee and name
      mockRequest.body = updateBody;
      const updatedCategory = { ...existingCategory, ...updateBody, type: existingCategory.type };
      mockCategoryRepository.findCategoryById.mockResolvedValue(existingCategory as any);
      mockCategoryRepository.updateCategory.mockResolvedValue(updatedCategory as any);

      await CategoryController.updateCategory(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.updateCategory).toHaveBeenCalledWith(1, {
        name: updateBody.name,
        fee: updateBody.fee,
        type: existingCategory.type // Should retain old type
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedCategory);
    });

    it('should return 404 if category not found during update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Update' };
      mockCategoryRepository.findCategoryById.mockResolvedValue(null);

      await CategoryController.updateCategory(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findCategoryById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Category not found' });
      expect(mockCategoryRepository.updateCategory).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Update' };
      const errorMessage = 'Update error';
      mockCategoryRepository.findCategoryById.mockResolvedValue(existingCategory as any);
      mockCategoryRepository.updateCategory.mockRejectedValue(new Error(errorMessage));

      await CategoryController.updateCategory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteCategory Tests ---
  describe('deleteCategory', () => {
    it('should delete a category with status 204', async () => {
      mockRequest.params = { id: '1' };
      const existingCategory = { id: 1 };
      mockCategoryRepository.findCategoryById.mockResolvedValue(existingCategory as any);
      mockCategoryRepository.deleteCategory.mockResolvedValue(existingCategory as any);

      await CategoryController.deleteCategory(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findCategoryById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.deleteCategory).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if category not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockCategoryRepository.findCategoryById.mockResolvedValue(null);

      await CategoryController.deleteCategory(mockRequest as Request, mockResponse as Response);

      expect(mockCategoryRepository.findCategoryById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Category not found' });
      expect(mockCategoryRepository.deleteCategory).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Deletion error';
      mockCategoryRepository.findCategoryById.mockResolvedValue({
        id: 1,
        type: '',
        name: '',
        fee: 0
      });
      mockCategoryRepository.deleteCategory.mockRejectedValue(new Error(errorMessage));

      await CategoryController.deleteCategory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = CategoryController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(7); // Expecting 7 routes based on your controller
    });
  });
});