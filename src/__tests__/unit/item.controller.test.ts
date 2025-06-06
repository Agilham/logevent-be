// src/__tests__/controllers/item.controller.test.ts

import { Request, Response } from 'express';
import ItemController from '../../controllers/item.controller'; // Adjust path if needed
import itemRepository from '../../repositories/item.repository'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the itemRepository module
jest.mock('../../repositories/item.repository');

describe('ItemController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockItemRepository: DeepMockProxy<typeof itemRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockItemRepository = itemRepository as DeepMockProxy<typeof itemRepository>;

    jest.clearAllMocks();
  });

  // --- readAllEventItems Tests ---
  describe('readAllEventItems', () => {
    it('should return all event items with status 200', async () => {
      const mockItems = [{ id: 1, eventId: 101 }, { id: 2, eventId: 102 }];
      mockItemRepository.findAllItemsEventDetails.mockResolvedValue(mockItems as any);

      await ItemController.readAllEventItems(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findAllItemsEventDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockItems);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockItemRepository.findAllItemsEventDetails.mockRejectedValue(new Error(errorMessage));

      await ItemController.readAllEventItems(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findAllItemsEventDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readAllProductItems Tests ---
  describe('readAllProductItems', () => {
    it('should return all product items with status 200', async () => {
      const mockItems = [{ id: 3, productId: 201 }, { id: 4, productId: 202 }];
      mockItemRepository.findAllItemsProductDetails.mockResolvedValue(mockItems as any);

      await ItemController.readAllProductItems(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findAllItemsProductDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockItems);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockItemRepository.findAllItemsProductDetails.mockRejectedValue(new Error(errorMessage));

      await ItemController.readAllProductItems(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findAllItemsProductDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readEventItemsByCartId Tests ---
  describe('readEventItemsByCartId', () => {
    it('should return event items by cart ID with status 200', async () => {
      mockRequest.params = { cartId: '1' };
      const mockItems = [{ id: 1, cartId: 1, eventId: 101 }];
      mockItemRepository.findItemsEventDetailsByCartId.mockResolvedValue(mockItems as any);

      await ItemController.readEventItemsByCartId(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findItemsEventDetailsByCartId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockItems);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { cartId: '1' };
      const errorMessage = 'Database error';
      mockItemRepository.findItemsEventDetailsByCartId.mockRejectedValue(new Error(errorMessage));

      await ItemController.readEventItemsByCartId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readProductItemsByCartId Tests ---
  describe('readProductItemsByCartId', () => {
    it('should return product items by cart ID with status 200', async () => {
      mockRequest.params = { cartId: '1' };
      const mockItems = [{ id: 1, cartId: 1, productId: 201 }];
      mockItemRepository.findItemsProductDetailsByCartId.mockResolvedValue(mockItems as any);

      await ItemController.readProductItemsByCartId(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findItemsProductDetailsByCartId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockItems);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { cartId: '1' };
      const errorMessage = 'Database error';
      mockItemRepository.findItemsProductDetailsByCartId.mockRejectedValue(new Error(errorMessage));

      await ItemController.readProductItemsByCartId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readItemById Tests ---
  describe('readItemById', () => {
    it('should return an item by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockItem = { id: 1, cartId: 1, quantity: 2 };
      mockItemRepository.findItemById.mockResolvedValue(mockItem as any);

      await ItemController.readItemById(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findItemById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockItem);
    });

    it('should return 404 if item not found', async () => {
      mockRequest.params = { id: '999' };
      mockItemRepository.findItemById.mockResolvedValue(null);

      await ItemController.readItemById(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findItemById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Item not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Item details error';
      mockItemRepository.findItemById.mockRejectedValue(new Error(errorMessage));

      await ItemController.readItemById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createItem Tests ---
  describe('createItem', () => {
    it('should create an item with status 201', async () => {
      const createBody = { cartId: 1, eventId: 101, duration: 5, quantity: 1 };
      mockRequest.body = createBody;
      const newItem = { id: 3, ...createBody };
      mockItemRepository.createItem.mockResolvedValue(newItem as any);

      await ItemController.createItem(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.createItem).toHaveBeenCalledWith(createBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newItem);
    });

    it('should return 500 if an error occurs', async () => {
      const createBody = { cartId: 1, eventId: 101, duration: 5, quantity: 1 };
      mockRequest.body = createBody;
      const errorMessage = 'Creation error';
      mockItemRepository.createItem.mockRejectedValue(new Error(errorMessage));

      await ItemController.createItem(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateItem Tests ---
  describe('updateItem', () => {
    const existingItem = {
      id: 1, cartId: 10, eventId: 100, productId: null, duration: 3, quantity: 1
    };

    it('should update an item with status 200 when all fields are provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { cartId: 11, eventId: null, productId: 200, duration: 7, quantity: 2 };
      mockRequest.body = updateBody;
      const updatedItem = { ...existingItem, ...updateBody };
      mockItemRepository.findItemById.mockResolvedValue(existingItem as any);
      mockItemRepository.updateItem.mockResolvedValue(updatedItem as any);

      await ItemController.updateItem(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findItemById).toHaveBeenCalledWith(1);
      expect(mockItemRepository.updateItem).toHaveBeenCalledWith(1, expect.objectContaining({
        cartId: updateBody.cartId,
        eventId: updateBody.eventId,
        productId: updateBody.productId,
        duration: updateBody.duration,
        quantity: updateBody.quantity,
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedItem);
    });

    it('should update an item using existing cartId if new cartId is not provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { quantity: 5 }; // Only updating quantity
      mockRequest.body = updateBody;
      const updatedItem = { ...existingItem, ...updateBody, cartId: existingItem.cartId };
      mockItemRepository.findItemById.mockResolvedValue(existingItem as any);
      mockItemRepository.updateItem.mockResolvedValue(updatedItem as any);

      await ItemController.updateItem(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.updateItem).toHaveBeenCalledWith(1, expect.objectContaining({
        cartId: existingItem.cartId,
        quantity: updateBody.quantity,
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedItem);
    });

    it('should return 404 if item not found during update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { quantity: 5 };
      mockItemRepository.findItemById.mockResolvedValue(null);

      await ItemController.updateItem(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findItemById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Item not found' });
      expect(mockItemRepository.updateItem).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { quantity: 5 };
      const errorMessage = 'Update error';
      mockItemRepository.findItemById.mockResolvedValue(existingItem as any);
      mockItemRepository.updateItem.mockRejectedValue(new Error(errorMessage));

      await ItemController.updateItem(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteItemsByCartId Tests ---
  describe('deleteItemsByCartId', () => {
    it('should delete items by cart ID with status 204', async () => {
      mockRequest.params = { cartId: '1' };
      mockItemRepository.deleteItemsByCartId.mockResolvedValue(undefined as any); // Mock delete to succeed

      await ItemController.deleteItemsByCartId(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.deleteItemsByCartId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { cartId: '1' };
      const errorMessage = 'Deletion by cartId error';
      mockItemRepository.deleteItemsByCartId.mockRejectedValue(new Error(errorMessage));

      await ItemController.deleteItemsByCartId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteItem Tests ---
  describe('deleteItem', () => {
    it('should delete an item by ID with status 204', async () => {
      mockRequest.params = { id: '1' };
      const existingItem = { id: 1 };
      mockItemRepository.findItemById.mockResolvedValue(existingItem as any);
      mockItemRepository.deleteItem.mockResolvedValue(existingItem as any);

      await ItemController.deleteItem(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findItemById).toHaveBeenCalledWith(1);
      expect(mockItemRepository.deleteItem).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if item not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockItemRepository.findItemById.mockResolvedValue(null);

      await ItemController.deleteItem(mockRequest as Request, mockResponse as Response);

      expect(mockItemRepository.findItemById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Item not found' });
      expect(mockItemRepository.deleteItem).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Deletion error';
      mockItemRepository.findItemById.mockResolvedValue({
        id: 1,
        eventId: null,
        productId: null,
        cartId: 0,
        duration: null,
        quantity: null
      });
      mockItemRepository.deleteItem.mockRejectedValue(new Error(errorMessage));

      await ItemController.deleteItem(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = ItemController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(9); // Expecting 9 routes based on your controller
    });
  });
});