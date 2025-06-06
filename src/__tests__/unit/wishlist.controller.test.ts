// src/__tests__/controllers/wishlist.controller.test.ts

import { Request, Response } from 'express';
import WishlistController from '../../controllers/wishlist.controller'; // Adjust path if needed
import WishlistRepository from '../../repositories/wishlist.repository'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the WishlistRepository module
jest.mock('../../src/repositories/wishlist.repository');

describe('WishlistController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockWishlistRepository: DeepMockProxy<typeof WishlistRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockWishlistRepository = WishlistRepository as DeepMockProxy<typeof WishlistRepository>;

    jest.clearAllMocks();
  });

  // --- readAllEventWishlists Tests ---
  describe('readAllEventWishlists', () => {
    it('should return all event wishlists with status 200', async () => {
      const mockWishlists = [{ id: 1, eventId: 101 }, { id: 2, eventId: 102 }];
      mockWishlistRepository.findAllWishlistsEventDetails.mockResolvedValue(mockWishlists as any);

      await WishlistController.readAllEventWishlists(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findAllWishlistsEventDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockWishlists);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockWishlistRepository.findAllWishlistsEventDetails.mockRejectedValue(new Error(errorMessage));

      await WishlistController.readAllEventWishlists(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findAllWishlistsEventDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readAllProductWishlists Tests ---
  describe('readAllProductWishlists', () => {
    it('should return all product wishlists with status 200', async () => {
      const mockWishlists = [{ id: 3, productId: 201 }, { id: 4, productId: 202 }];
      mockWishlistRepository.findAllWishlistProductDetails.mockResolvedValue(mockWishlists as any);

      await WishlistController.readAllProductWishlists(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findAllWishlistProductDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockWishlists);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockWishlistRepository.findAllWishlistProductDetails.mockRejectedValue(new Error(errorMessage));

      await WishlistController.readAllProductWishlists(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findAllWishlistProductDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readEventWishlistsByUserId Tests ---
  describe('readEventWishlistsByUserId', () => {
    it('should return event wishlists by user ID with status 200', async () => {
      mockRequest.params = { userId: '1' };
      const mockWishlists = [{ id: 1, userId: 1, eventId: 101 }];
      mockWishlistRepository.findWishlistsEventDetailsByUserId.mockResolvedValue(mockWishlists as any);

      await WishlistController.readEventWishlistsByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findWishlistsEventDetailsByUserId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockWishlists);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { userId: '1' };
      const errorMessage = 'Database error';
      mockWishlistRepository.findWishlistsEventDetailsByUserId.mockRejectedValue(new Error(errorMessage));

      await WishlistController.readEventWishlistsByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findWishlistsEventDetailsByUserId).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readProductWishlistsByUserId Tests ---
  describe('readProductWishlistsByUserId', () => {
    it('should return product wishlists by user ID with status 200', async () => {
      mockRequest.params = { userId: '1' };
      const mockWishlists = [{ id: 1, userId: 1, productId: 201 }];
      mockWishlistRepository.findWishlistsProductDetailsByUserId.mockResolvedValue(mockWishlists as any);

      await WishlistController.readProductWishlistsByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findWishlistsProductDetailsByUserId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockWishlists);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { userId: '1' };
      const errorMessage = 'Database error';
      mockWishlistRepository.findWishlistsProductDetailsByUserId.mockRejectedValue(new Error(errorMessage));

      await WishlistController.readProductWishlistsByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findWishlistsProductDetailsByUserId).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readWishlistById Tests ---
  describe('readWishlistById', () => {
    it('should return a wishlist by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockWishlist = { id: 1, userId: 1, eventId: 101 };
      mockWishlistRepository.findWishlistById.mockResolvedValue(mockWishlist as any);

      await WishlistController.readWishlistById(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findWishlistById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockWishlist);
    });

    it('should return 404 if wishlist not found', async () => {
      mockRequest.params = { id: '999' };
      mockWishlistRepository.findWishlistById.mockResolvedValue(null);

      await WishlistController.readWishlistById(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findWishlistById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Wishlist not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Database error';
      mockWishlistRepository.findWishlistById.mockRejectedValue(new Error(errorMessage));

      await WishlistController.readWishlistById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createWishlist Tests ---
  describe('createWishlist', () => {
    it('should create a wishlist with status 201', async () => {
      const createBody = { userId: 1, eventId: 101, productId: null };
      mockRequest.body = createBody;
      const newWishlist = { id: 3, ...createBody };
      mockWishlistRepository.createWishlist.mockResolvedValue(newWishlist as any);

      await WishlistController.createWishlist(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.createWishlist).toHaveBeenCalledWith(createBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newWishlist);
    });

    it('should return 500 if an error occurs', async () => {
      const createBody = { userId: 1, eventId: 101, productId: null };
      mockRequest.body = createBody;
      const errorMessage = 'Creation error';
      mockWishlistRepository.createWishlist.mockRejectedValue(new Error(errorMessage));

      await WishlistController.createWishlist(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteWishlist Tests ---
  describe('deleteWishlist', () => {
    it('should delete a wishlist with status 204', async () => {
      mockRequest.params = { id: '1' };
      const existingWishlist = { id: 1 };
      mockWishlistRepository.findWishlistById.mockResolvedValue(existingWishlist as any);
      mockWishlistRepository.deleteWishlist.mockResolvedValue(existingWishlist as any);

      await WishlistController.deleteWishlist(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findWishlistById).toHaveBeenCalledWith(1);
      expect(mockWishlistRepository.deleteWishlist).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if wishlist not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockWishlistRepository.findWishlistById.mockResolvedValue(null);

      await WishlistController.deleteWishlist(mockRequest as Request, mockResponse as Response);

      expect(mockWishlistRepository.findWishlistById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Wishlist not found' });
      expect(mockWishlistRepository.deleteWishlist).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Deletion error';
      mockWishlistRepository.findWishlistById.mockResolvedValue({
        id: 1,
        eventId: null,
        productId: null,
        userId: 0
      });
      mockWishlistRepository.deleteWishlist.mockRejectedValue(new Error(errorMessage));

      await WishlistController.deleteWishlist(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = WishlistController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(7); // Expecting 7 routes based on your controller
    });
  });
});