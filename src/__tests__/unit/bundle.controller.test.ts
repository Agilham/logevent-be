// src/__tests__/controllers/bundle.controller.test.ts

import { Request, Response } from 'express';
import BundleController from '../../controllers/bundle.controller'; // Adjust path if needed
import bundleRepository from '../../repositories/bundle.repository'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the bundleRepository module
jest.mock('../../repositories/bundle.repository');

describe('BundleController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockBundleRepository: DeepMockProxy<typeof bundleRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockBundleRepository = bundleRepository as DeepMockProxy<typeof bundleRepository>;

    jest.clearAllMocks();
  });

  // --- readAllBundles Tests ---
  describe('readAllBundles', () => {
    it('should return all bundles with status 200', async () => {
      const mockBundles = [{ id: 1, name: 'Bundle 1' }, { id: 2, name: 'Bundle 2' }];
      mockBundleRepository.findAllBundles.mockResolvedValue(mockBundles as any);

      await BundleController.readAllBundles(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.findAllBundles).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBundles);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockBundleRepository.findAllBundles.mockRejectedValue(new Error(errorMessage));

      await BundleController.readAllBundles(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.findAllBundles).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readBundlesByProductId Tests ---
  describe('readBundlesByProductId', () => {
    it('should return bundles by product ID with status 200', async () => {
      mockRequest.params = { productId: '1' };
      const mockBundles = [{ id: 1, productId: 1 }];
      mockBundleRepository.findBundlesByProductId.mockResolvedValue(mockBundles as any);

      await BundleController.readBundlesByProductId(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.findBundlesByProductId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBundles);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { productId: '1' };
      const errorMessage = 'Database error';
      mockBundleRepository.findBundlesByProductId.mockRejectedValue(new Error(errorMessage));

      await BundleController.readBundlesByProductId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readBundlesByEventId Tests ---
  describe('readBundlesByEventId', () => {
    it('should return bundles by event ID with status 200', async () => {
      mockRequest.params = { eventId: '1' };
      const mockBundles = [{ id: 1, eventId: 1 }];
      mockBundleRepository.findBundlesByEventId.mockResolvedValue(mockBundles as any);

      await BundleController.readBundlesByEventId(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.findBundlesByEventId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBundles);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { eventId: '1' };
      const errorMessage = 'Database error';
      mockBundleRepository.findBundlesByEventId.mockRejectedValue(new Error(errorMessage));

      await BundleController.readBundlesByEventId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readBundleById Tests ---
  describe('readBundleById', () => {
    it('should return a bundle by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockBundle = { id: 1, name: 'Test Bundle' };
      mockBundleRepository.findBundleById.mockResolvedValue(mockBundle as any);

      await BundleController.readBundleById(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.findBundleById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBundle);
    });

    it('should return 404 if bundle not found', async () => {
      mockRequest.params = { id: '999' };
      mockBundleRepository.findBundleById.mockResolvedValue(null);

      await BundleController.readBundleById(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.findBundleById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Bundle not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Bundle details error';
      mockBundleRepository.findBundleById.mockRejectedValue(new Error(errorMessage));

      await BundleController.readBundleById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createBundle Tests ---
  describe('createBundle', () => {
    it('should create a bundle with status 201', async () => {
      const createBody = { eventId: 1, productId: 2 };
      mockRequest.body = createBody;
      const newBundle = { id: 3, ...createBody };
      mockBundleRepository.createBundle.mockResolvedValue(newBundle as any);

      await BundleController.createBundle(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.createBundle).toHaveBeenCalledWith({
        eventId: createBody.eventId,
        productId: createBody.productId
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newBundle);
    });

    it('should return 500 if an error occurs', async () => {
      const createBody = { eventId: 1, productId: 2 };
      mockRequest.body = createBody;
      const errorMessage = 'Creation error';
      mockBundleRepository.createBundle.mockRejectedValue(new Error(errorMessage));

      await BundleController.createBundle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateBundle Tests ---
  describe('updateBundle', () => {
    const existingBundle = { id: 1, eventId: 10, productId: 20 };

    it('should update a bundle with status 200 when both IDs are provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { eventId: 11, productId: 21 };
      const updatedBundle = { ...existingBundle, eventId: 11, productId: 21 };
      mockBundleRepository.findBundleById.mockResolvedValue(existingBundle as any);
      mockBundleRepository.updateBundle.mockResolvedValue(updatedBundle as any);

      await BundleController.updateBundle(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.findBundleById).toHaveBeenCalledWith(1);
      expect(mockBundleRepository.updateBundle).toHaveBeenCalledWith(1, {
        eventId: 11,
        productId: 21
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedBundle);
    });

    it('should update a bundle using existing eventId if new eventId is not provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { productId: 22 }; // Only updating productId
      const updatedBundle = { ...existingBundle, productId: 22 };
      mockBundleRepository.findBundleById.mockResolvedValue(existingBundle as any);
      mockBundleRepository.updateBundle.mockResolvedValue(updatedBundle as any);

      await BundleController.updateBundle(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.updateBundle).toHaveBeenCalledWith(1, {
        eventId: existingBundle.eventId, // Should retain old eventId
        productId: 22
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedBundle);
    });

    it('should update a bundle using existing productId if new productId is not provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { eventId: 12 }; // Only updating eventId
      const updatedBundle = { ...existingBundle, eventId: 12 };
      mockBundleRepository.findBundleById.mockResolvedValue(existingBundle as any);
      mockBundleRepository.updateBundle.mockResolvedValue(updatedBundle as any);

      await BundleController.updateBundle(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.updateBundle).toHaveBeenCalledWith(1, {
        eventId: 12,
        productId: existingBundle.productId // Should retain old productId
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedBundle);
    });

    it('should return 404 if bundle not found during update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { eventId: 11 };
      mockBundleRepository.findBundleById.mockResolvedValue(null);

      await BundleController.updateBundle(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.findBundleById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Bundle not found' });
      expect(mockBundleRepository.updateBundle).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { eventId: 11 };
      const errorMessage = 'Update error';
      mockBundleRepository.findBundleById.mockResolvedValue(existingBundle as any);
      mockBundleRepository.updateBundle.mockRejectedValue(new Error(errorMessage));

      await BundleController.updateBundle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteBundle Tests ---
  describe('deleteBundle', () => {
    it('should delete a bundle with status 204', async () => {
      mockRequest.params = { id: '1' };
      const existingBundle = { id: 1 };
      mockBundleRepository.findBundleById.mockResolvedValue(existingBundle as any);
      mockBundleRepository.deleteBundle.mockResolvedValue(existingBundle as any);

      await BundleController.deleteBundle(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.findBundleById).toHaveBeenCalledWith(1);
      expect(mockBundleRepository.deleteBundle).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if bundle not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockBundleRepository.findBundleById.mockResolvedValue(null);

      await BundleController.deleteBundle(mockRequest as Request, mockResponse as Response);

      expect(mockBundleRepository.findBundleById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Bundle not found' });
      expect(mockBundleRepository.deleteBundle).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Deletion error';
      mockBundleRepository.findBundleById.mockResolvedValue({
        id: 1,
        eventId: 0,
        productId: 0
      });
      mockBundleRepository.deleteBundle.mockRejectedValue(new Error(errorMessage));

      await BundleController.deleteBundle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = BundleController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(7); // Expecting 7 routes based on your controller
    });
  });
});