// src/__tests__/controllers/cart.controller.test.ts

import { Request, Response } from 'express';
import CartController from '../../controllers/cart.controller'; // Adjust path if needed
import cartRepository from '../../repositories/cart.repository'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the cartRepository module
jest.mock('../../repositories/cart.repository');

describe('CartController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCartRepository: DeepMockProxy<typeof cartRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockCartRepository = cartRepository as DeepMockProxy<typeof cartRepository>;

    jest.clearAllMocks();
  });

  // --- readAllCarts Tests ---
  describe('readAllCarts', () => {
    it('should return all carts with status 200', async () => {
      const mockCarts = [{ id: 1, userId: 1, type: 'Product' }, { id: 2, userId: 2, type: 'Event' }];
      mockCartRepository.findAllCarts.mockResolvedValue(mockCarts as any);

      await CartController.readAllCarts(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findAllCarts).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCarts);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockCartRepository.findAllCarts.mockRejectedValue(new Error(errorMessage));

      await CartController.readAllCarts(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findAllCarts).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readCartsByUserId Tests ---
  describe('readCartsByUserId', () => {
    it('should return carts by user ID with status 200', async () => {
      mockRequest.params = { userId: '1' };
      const mockCart = [{ id: 1, userId: 1, type: 'Product' }];
      mockCartRepository.findCartsByUserId.mockResolvedValue(mockCart as any);

      await CartController.readCartsByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findCartsByUserId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCart);
    });

    it('should return 404 if cart not found for user ID', async () => {
      mockRequest.params = { userId: '999' };
      mockCartRepository.findCartsByUserId.mockResolvedValue(null as any);

      await CartController.readCartsByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findCartsByUserId).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cart not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { userId: '1' };
      const errorMessage = 'Database error';
      mockCartRepository.findCartsByUserId.mockRejectedValue(new Error(errorMessage));

      await CartController.readCartsByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readActiveEventCartByUserId Tests ---
  describe('readActiveEventCartByUserId', () => {
    it('should return active event cart by user ID with status 200', async () => {
      mockRequest.params = { userId: '1' };
      const mockCart = { id: 1, userId: 1, type: 'Event' };
      mockCartRepository.findActiveEventCartByUserId.mockResolvedValue(mockCart as any);

      await CartController.readActiveEventCartByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findActiveEventCartByUserId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCart);
    });

    it('should return 404 if active event cart not found for user ID', async () => {
      mockRequest.params = { userId: '999' };
      mockCartRepository.findActiveEventCartByUserId.mockResolvedValue(null);

      await CartController.readActiveEventCartByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findActiveEventCartByUserId).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Active Event Cart not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { userId: '1' };
      const errorMessage = 'Database error';
      mockCartRepository.findActiveEventCartByUserId.mockRejectedValue(new Error(errorMessage));

      await CartController.readActiveEventCartByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readActiveProductCartByUserId Tests ---
  describe('readActiveProductCartByUserId', () => {
    it('should return active product cart by user ID with status 200', async () => {
      mockRequest.params = { userId: '1' };
      const mockCart = { id: 1, userId: 1, type: 'Product' };
      mockCartRepository.findActiveProductCartByUserId.mockResolvedValue(mockCart as any);

      await CartController.readActiveProductCartByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findActiveProductCartByUserId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCart);
    });

    it('should return 404 if active product cart not found for user ID', async () => {
      mockRequest.params = { userId: '999' };
      mockCartRepository.findActiveProductCartByUserId.mockResolvedValue(null);

      await CartController.readActiveProductCartByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findActiveProductCartByUserId).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Active Product Cart not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { userId: '1' };
      const errorMessage = 'Database error';
      mockCartRepository.findActiveProductCartByUserId.mockRejectedValue(new Error(errorMessage));

      await CartController.readActiveProductCartByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readActiveEventOrganizerCartByUserId Tests ---
  describe('readActiveEventOrganizerCartByUserId', () => {
    it('should return active event organizer cart by user ID with status 200', async () => {
      mockRequest.params = { userId: '1' };
      const mockCart = { id: 1, userId: 1, type: 'Event Organizer' };
      mockCartRepository.findActiveEventOrganizerCartByUserId.mockResolvedValue(mockCart as any);

      await CartController.readActiveEventOrganizerCartByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findActiveEventOrganizerCartByUserId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCart);
    });

    it('should return 404 if active event organizer cart not found for user ID', async () => {
      mockRequest.params = { userId: '999' };
      mockCartRepository.findActiveEventOrganizerCartByUserId.mockResolvedValue(null);

      await CartController.readActiveEventOrganizerCartByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findActiveEventOrganizerCartByUserId).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Active Event Organizer Cart not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { userId: '1' };
      const errorMessage = 'Database error';
      mockCartRepository.findActiveEventOrganizerCartByUserId.mockRejectedValue(new Error(errorMessage));

      await CartController.readActiveEventOrganizerCartByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readCartById Tests ---
  describe('readCartById', () => {
    it('should return a cart by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockCart = { id: 1, userId: 1, type: 'Product' };
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any);

      await CartController.readCartById(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findCartById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCart);
    });

    it('should return 404 if cart not found', async () => {
      mockRequest.params = { id: '999' };
      mockCartRepository.findCartById.mockResolvedValue(null);

      await CartController.readCartById(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findCartById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cart not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Database error';
      mockCartRepository.findCartById.mockRejectedValue(new Error(errorMessage));

      await CartController.readCartById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createCart Tests ---
  describe('createCart', () => {
    it('should create a cart with status 201', async () => {
      const createBody = { userId: 1, type: 'Product' };
      mockRequest.body = createBody;
      const newCart = { id: 3, ...createBody };
      mockCartRepository.createCart.mockResolvedValue(newCart as any);

      await CartController.createCart(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.createCart).toHaveBeenCalledWith({
        userId: createBody.userId,
        type: createBody.type
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newCart);
    });

    it('should return 500 if an error occurs', async () => {
      const createBody = { userId: 1, type: 'Product' };
      mockRequest.body = createBody;
      const errorMessage = 'Creation error';
      mockCartRepository.createCart.mockRejectedValue(new Error(errorMessage));

      await CartController.createCart(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateCart Tests ---
  describe('updateCart', () => {
    const existingCart = { id: 1, userId: 10, type: 'Product', cartDate: new Date(), cartStatus: 'Active' };

    it('should update a cart with status 200 when all fields are provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { userId: 11, type: 'Event', cartDate: new Date('2025-01-01'), cartStatus: 'Closed' };
      mockRequest.body = updateBody;
      const updatedCart = { ...existingCart, ...updateBody };
      mockCartRepository.findCartById.mockResolvedValue(existingCart as any);
      mockCartRepository.updateCart.mockResolvedValue(updatedCart as any);

      await CartController.updateCart(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findCartById).toHaveBeenCalledWith(1);
      expect(mockCartRepository.updateCart).toHaveBeenCalledWith(1, expect.objectContaining({
        userId: updateBody.userId,
        type: updateBody.type,
        cartDate: updateBody.cartDate,
        cartStatus: updateBody.cartStatus,
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedCart);
    });

    it('should update a cart using existing userId if new userId is not provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { type: 'Event' }; // Only updating type
      mockRequest.body = updateBody;
      const updatedCart = { ...existingCart, ...updateBody, userId: existingCart.userId };
      mockCartRepository.findCartById.mockResolvedValue(existingCart as any);
      mockCartRepository.updateCart.mockResolvedValue(updatedCart as any);

      await CartController.updateCart(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.updateCart).toHaveBeenCalledWith(1, expect.objectContaining({
        userId: existingCart.userId, // Should retain old userId
        type: updateBody.type,
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedCart);
    });

    it('should update a cart using existing type if new type is not provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { userId: 11 }; // Only updating userId
      mockRequest.body = updateBody;
      const updatedCart = { ...existingCart, ...updateBody, type: existingCart.type };
      mockCartRepository.findCartById.mockResolvedValue(existingCart as any);
      mockCartRepository.updateCart.mockResolvedValue(updatedCart as any);

      await CartController.updateCart(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.updateCart).toHaveBeenCalledWith(1, expect.objectContaining({
        userId: updateBody.userId,
        type: existingCart.type, // Should retain old type
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedCart);
    });

    it('should return 404 if cart not found during update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { userId: 11 };
      mockCartRepository.findCartById.mockResolvedValue(null);

      await CartController.updateCart(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findCartById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cart not found' });
      expect(mockCartRepository.updateCart).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { userId: 11 };
      const errorMessage = 'Update error';
      mockCartRepository.findCartById.mockResolvedValue(existingCart as any);
      mockCartRepository.updateCart.mockRejectedValue(new Error(errorMessage));

      await CartController.updateCart(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteCart Tests ---
  describe('deleteCart', () => {
    it('should delete a cart with status 204', async () => {
      mockRequest.params = { id: '1' };
      const existingCart = { id: 1 };
      mockCartRepository.findCartById.mockResolvedValue(existingCart as any);
      mockCartRepository.deleteCart.mockResolvedValue(existingCart as any);

      await CartController.deleteCart(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findCartById).toHaveBeenCalledWith(1);
      expect(mockCartRepository.deleteCart).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if cart not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockCartRepository.findCartById.mockResolvedValue(null);

      await CartController.deleteCart(mockRequest as Request, mockResponse as Response);

      expect(mockCartRepository.findCartById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cart not found' });
      expect(mockCartRepository.deleteCart).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Deletion error';
      mockCartRepository.findCartById.mockResolvedValue({
        id: 1,
        type: '',
        userId: 0,
        cartDate: new Date(),
        cartStatus: ''
      });
      mockCartRepository.deleteCart.mockRejectedValue(new Error(errorMessage));

      await CartController.deleteCart(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = CartController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(9); // Expecting 9 routes based on your controller
    });
  });
});