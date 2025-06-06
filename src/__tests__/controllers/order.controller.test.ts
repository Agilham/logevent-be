import { Request, Response } from 'express';
import OrderController from '../../controllers/order.controller';
import cartRepository from '../../repositories/cart.repository';
import itemRepository from '../../repositories/item.repository';
import orderRepository from '../../repositories/order.repository';
import userRepository from '../../repositories/user.repository';
import nodemailerUtils from '../../utils/nodemailer';
import { DeepMockProxy } from 'jest-mock-extended'; // For type-safe mocking

// Mock the entire repository and utility modules
// This tells Jest to replace the actual implementations with mock versions
jest.mock('../../repositories/cart.repository');
jest.mock('../../repositories/item.repository');
jest.mock('../../repositories/order.repository');
jest.mock('../../repositories/user.repository');
jest.mock('../../utils/nodemailer');

describe('OrderController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCartRepository: DeepMockProxy<typeof cartRepository>;
  let mockItemRepository: DeepMockProxy<typeof itemRepository>;
  let mockOrderRepository: DeepMockProxy<typeof orderRepository>;
  let mockUserRepository: DeepMockProxy<typeof userRepository>;
  let mockNodemailerUtils: DeepMockProxy<typeof nodemailerUtils>;

  // Before each test, reset mocks and set up common response methods
  beforeEach(() => {
    mockRequest = {}; // Initialize request as empty for each test
    mockResponse = {
      status: jest.fn().mockReturnThis(), // Mock .status() to return `this` for chaining
      json: jest.fn(),
      end: jest.fn(), // For 204 status
    };

    // Cast the mocked modules to DeepMockProxy for type safety and better mocking
    mockCartRepository = cartRepository as DeepMockProxy<typeof cartRepository>;
    mockItemRepository = itemRepository as DeepMockProxy<typeof itemRepository>;
    mockOrderRepository = orderRepository as DeepMockProxy<typeof orderRepository>;
    mockUserRepository = userRepository as DeepMockProxy<typeof userRepository>;
    mockNodemailerUtils = nodemailerUtils as DeepMockProxy<typeof nodemailerUtils>;

    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  // --- readAllOrders Tests ---
  describe('readAllOrders', () => {
    it('should return all orders with status 200', async () => {
      const mockOrders = [{ id: 1, name: 'Order 1' }, { id: 2, name: 'Order 2' }];
      mockOrderRepository.findAllOrderDetails.mockResolvedValue(mockOrders as any); //

      await OrderController.readAllOrders(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findAllOrderDetails).toHaveBeenCalledTimes(1); //
      expect(mockResponse.status).toHaveBeenCalledWith(200); //
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrders); //
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockOrderRepository.findAllOrderDetails.mockRejectedValue(new Error(errorMessage)); //

      await OrderController.readAllOrders(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findAllOrderDetails).toHaveBeenCalledTimes(1); //
      expect(mockResponse.status).toHaveBeenCalledWith(500); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage }); //
    });
  });

  // --- readPastTwoMonthOrders Tests ---
  describe('readPastTwoMonthOrders', () => {
    it('should return orders for the past two months with status 200', async () => {
      mockRequest.params = { date: '2023-03-15T10:00:00.000Z' }; //
      const mockOrders = [{ id: 10, date: new Date('2023-03-01') }];
      mockOrderRepository.findPastTwoMonthOrderDetails.mockResolvedValue(mockOrders as any); //

      await OrderController.readPastTwoMonthOrders(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findPastTwoMonthOrderDetails).toHaveBeenCalledWith(expect.any(Date)); //
      expect(mockResponse.status).toHaveBeenCalledWith(200); //
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrders); //
    });

    it('should return 400 if no date is provided', async () => {
      mockRequest.params = {}; // No date provided //

      await OrderController.readPastTwoMonthOrders(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(400); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Please provide a date' }); //
      expect(mockOrderRepository.findPastTwoMonthOrderDetails).not.toHaveBeenCalled(); //
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { date: '2023-03-15T10:00:00.000Z' }; //
      const errorMessage = 'Date parsing error';
      mockOrderRepository.findPastTwoMonthOrderDetails.mockRejectedValue(new Error(errorMessage)); //

      await OrderController.readPastTwoMonthOrders(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(500); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage }); //
    });
  });

  // --- readOrdersByUserId Tests ---
  describe('readOrdersByUserId', () => {
    it('should return orders by user ID with status 200', async () => {
      mockRequest.params = { userId: '1' }; //
      const mockOrders = [{ id: 1, userId: 1 }];
      mockOrderRepository.findOrderDetailsByUserId.mockResolvedValue(mockOrders as any); //

      await OrderController.readOrdersByUserId(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findOrderDetailsByUserId).toHaveBeenCalledWith(1); //
      expect(mockResponse.status).toHaveBeenCalledWith(200); //
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrders); //
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { userId: '1' }; //
      const errorMessage = 'User orders error';
      mockOrderRepository.findOrderDetailsByUserId.mockRejectedValue(new Error(errorMessage)); //

      await OrderController.readOrdersByUserId(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(500); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage }); //
    });
  });

  // --- readOrderById Tests ---
  describe('readOrderById', () => {
    it('should return an order by ID with status 200', async () => {
      mockRequest.params = { id: '1' }; //
      const mockOrder = { id: 1, name: 'Test Order' };
      mockOrderRepository.findOrderDetailById.mockResolvedValue(mockOrder as any); //

      await OrderController.readOrderById(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findOrderDetailById).toHaveBeenCalledWith(1); //
      expect(mockResponse.status).toHaveBeenCalledWith(200); //
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrder); //
    });

    it('should return 404 if order not found', async () => {
      mockRequest.params = { id: '999' }; //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(null); //

      await OrderController.readOrderById(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findOrderDetailById).toHaveBeenCalledWith(999); //
      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order not found' }); //
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' }; //
      const errorMessage = 'Order details error';
      mockOrderRepository.findOrderDetailById.mockRejectedValue(new Error(errorMessage)); //

      await OrderController.readOrderById(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(500); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage }); //
    });
  });

  // --- readOrderAvailabilityByCartId Tests ---
  describe('readOrderAvailabilityByCartId', () => {
    it('should return booked dates for a cart ID with status 200', async () => {
      mockRequest.params = { cartId: '1' }; //
      const mockBookedDates = [{ date: new Date(), count: 1 }];
      mockOrderRepository.findOrderAvailabilityByCartId.mockResolvedValue(mockBookedDates as any); //

      await OrderController.readOrderAvailabilityByCartId(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findOrderAvailabilityByCartId).toHaveBeenCalledWith(1); //
      expect(mockResponse.status).toHaveBeenCalledWith(200); //
      expect(mockResponse.json).toHaveBeenCalledWith(mockBookedDates); //
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { cartId: '1' }; //
      const errorMessage = 'Availability error';
      mockOrderRepository.findOrderAvailabilityByCartId.mockRejectedValue(new Error(errorMessage)); //

      await OrderController.readOrderAvailabilityByCartId(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(500); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage }); //
    });
  });

  // --- createOrder Tests ---
  describe('createOrder', () => {
    const mockCreateOrderBody = {
      cartId: 1,
      name: 'John Doe',
      phone: '1234567890',
      address: '123 Main St',
      notes: 'Some notes',
      startDateString: '2025-06-01T10:00:00.000Z',
      endDateString: '2025-06-05T10:00:00.000Z',
    };
    const mockOrderTotal = 1500;
    const mockNewOrder = { id: 1, ...mockCreateOrderBody, orderTotal: mockOrderTotal, startDate: new Date(mockCreateOrderBody.startDateString), endDate: new Date(mockCreateOrderBody.endDateString) };
    const mockCart = { id: 1, userId: 1, type: 'Product' };
    const mockUser = { id: 1, email: 'user@example.com' };
    const mockOrderDetail = { ...mockNewOrder, items: [] }; // Mocked order detail for email

    it('should create an order and send email for Product cart type', async () => {
      mockRequest.body = mockCreateOrderBody; //
      mockOrderRepository.calculateOrderTotal.mockResolvedValue(mockOrderTotal); //
      mockOrderRepository.createOrder.mockResolvedValue(mockNewOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(mockOrderDetail as any); //
      mockItemRepository.findItemsProductDetailsByCartId.mockResolvedValue([]); //
      mockNodemailerUtils.sendNewOrderEmail.mockResolvedValue(undefined); //

      await OrderController.createOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.calculateOrderTotal).toHaveBeenCalledWith(mockCreateOrderBody.cartId, expect.any(Date), expect.any(Date)); //
      expect(mockOrderRepository.createOrder).toHaveBeenCalledWith(expect.objectContaining({
        cartId: mockCreateOrderBody.cartId,
        orderTotal: mockOrderTotal,
      })); //
      expect(mockCartRepository.findCartById).toHaveBeenCalledWith(mockCreateOrderBody.cartId); //
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(mockCart.userId); //
      expect(mockOrderRepository.findOrderDetailById).toHaveBeenCalledWith(mockNewOrder.id); //
      expect(mockItemRepository.findItemsProductDetailsByCartId).toHaveBeenCalledWith(mockCart.id); //
      expect(mockNodemailerUtils.sendNewOrderEmail).toHaveBeenCalledWith(mockUser.email, mockOrderDetail, []); //
      expect(mockResponse.status).toHaveBeenCalledWith(201); //
      expect(mockResponse.json).toHaveBeenCalledWith(mockNewOrder); //
    });

    it('should create an order and send email for Event cart type', async () => {
      mockRequest.body = mockCreateOrderBody; //
      mockOrderRepository.calculateOrderTotal.mockResolvedValue(mockOrderTotal); //
      mockOrderRepository.createOrder.mockResolvedValue(mockNewOrder as any); //
      const eventCart = { ...mockCart, type: 'Event' }; //
      mockCartRepository.findCartById.mockResolvedValue(eventCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(mockOrderDetail as any); //
      mockItemRepository.findItemsEventDetailsByCartId.mockResolvedValue([]); //
      mockNodemailerUtils.sendNewOrderEmail.mockResolvedValue(undefined); //

      await OrderController.createOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockItemRepository.findItemsEventDetailsByCartId).toHaveBeenCalledWith(eventCart.id); //
      expect(mockItemRepository.findItemsProductDetailsByCartId).not.toHaveBeenCalled(); //
      expect(mockResponse.status).toHaveBeenCalledWith(201); //
    });

    it('should create an order and send email for Event Organizer cart type', async () => {
      mockRequest.body = mockCreateOrderBody; //
      mockOrderRepository.calculateOrderTotal.mockResolvedValue(mockOrderTotal); //
      mockOrderRepository.createOrder.mockResolvedValue(mockNewOrder as any); //
      const eoCart = { ...mockCart, type: 'Event Organizer' }; //
      mockCartRepository.findCartById.mockResolvedValue(eoCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(mockOrderDetail as any); //
      mockItemRepository.findItemsProductDetailsByCartId.mockResolvedValue([]); //
      mockNodemailerUtils.sendNewOrderEmail.mockResolvedValue(undefined); //

      await OrderController.createOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockItemRepository.findItemsProductDetailsByCartId).toHaveBeenCalledWith(eoCart.id); //
      expect(mockItemRepository.findItemsEventDetailsByCartId).not.toHaveBeenCalled(); //
      expect(mockResponse.status).toHaveBeenCalledWith(201); //
    });

    it('should return 404 if cart not found during order creation', async () => {
      mockRequest.body = mockCreateOrderBody; //
      mockOrderRepository.calculateOrderTotal.mockResolvedValue(mockOrderTotal); //
      mockOrderRepository.createOrder.mockResolvedValue(mockNewOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(null); // Simulate cart not found //

      await OrderController.createOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cart not found' }); //
      expect(mockUserRepository.findUserById).not.toHaveBeenCalled(); //
    });

    it('should return 404 if user not found during order creation', async () => {
      mockRequest.body = mockCreateOrderBody; //
      mockOrderRepository.calculateOrderTotal.mockResolvedValue(mockOrderTotal); //
      mockOrderRepository.createOrder.mockResolvedValue(mockNewOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(null); // Simulate user not found //

      await OrderController.createOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' }); //
      expect(mockOrderRepository.findOrderDetailById).not.toHaveBeenCalled(); //
    });

    it('should return 404 if order detail not found after creation (unlikely but good for coverage)', async () => {
      mockRequest.body = mockCreateOrderBody; //
      mockOrderRepository.calculateOrderTotal.mockResolvedValue(mockOrderTotal); //
      mockOrderRepository.createOrder.mockResolvedValue(mockNewOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(null); // Simulate order detail not found //

      await OrderController.createOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order not found' }); //
      expect(mockNodemailerUtils.sendNewOrderEmail).not.toHaveBeenCalled(); //
    });

    it('should return 500 if an error occurs during order creation', async () => {
      mockRequest.body = mockCreateOrderBody; //
      const errorMessage = 'Calculation error';
      mockOrderRepository.calculateOrderTotal.mockRejectedValue(new Error(errorMessage)); //

      await OrderController.createOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(500); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage }); //
      expect(mockOrderRepository.createOrder).not.toHaveBeenCalled(); //
    });
  });

  // --- updateOrder Tests ---
  describe('updateOrder', () => {
    const existingOrder = {
      id: 1, cartId: 1, name: 'Old Name', phone: '111', address: 'Old Address',
      notes: 'Old Notes', startDate: new Date(), endDate: new Date(),
      orderDate: new Date(), orderTotal: 100, orderStatus: 'Pending'
    };
    const updateBody = {
      name: 'New Name',
      orderStatus: 'Completed'
    };
    const updatedOrderResult = { ...existingOrder, ...updateBody };

    it('should update an order with status 200', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = updateBody; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrderResult as any); //

      await OrderController.updateOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findOrderById).toHaveBeenCalledWith(1); //
      expect(mockOrderRepository.updateOrder).toHaveBeenCalledWith(1, expect.objectContaining({
        name: updateBody.name,
        orderStatus: updateBody.orderStatus,
        // Ensure other fields default to existing if not provided
        address: existingOrder.address,
      })); //
      expect(mockResponse.status).toHaveBeenCalledWith(200); //
      expect(mockResponse.json).toHaveBeenCalledWith(updatedOrderResult); //
    });

    it('should return 404 if order not found during update', async () => {
      mockRequest.params = { id: '999' }; //
      mockRequest.body = updateBody; //
      mockOrderRepository.findOrderById.mockResolvedValue(null); //

      await OrderController.updateOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findOrderById).toHaveBeenCalledWith(999); //
      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order not found' }); //
      expect(mockOrderRepository.updateOrder).not.toHaveBeenCalled(); //
    });

    it('should return 500 if an error occurs during update', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = updateBody; //
      const errorMessage = 'Update error';
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockRejectedValue(new Error(errorMessage)); //

      await OrderController.updateOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(500); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage }); //
    });
  });

  // --- confirmEventOrganizer Tests ---
  describe('confirmEventOrganizer', () => {
    const existingOrder = { id: 1, cartId: 1, orderTotal: 500, orderStatus: 'Pending' };
    const updatedOrder = { ...existingOrder, orderTotal: 1000, orderStatus: 'Pending' };
    const mockCart = { id: 1, userId: 1, type: 'Event Organizer' };
    const mockUser = { id: 1, email: 'user@example.com' };
    const mockOrderDetail = { ...updatedOrder, items: [] };

    it('should confirm event organizer order and send email with status 200', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = { newOrderTotal: 1000 }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(mockOrderDetail as any); //
      mockItemRepository.findItemsProductDetailsByCartId.mockResolvedValue([]); //
      mockNodemailerUtils.sendNewOrderEmail.mockResolvedValue(undefined); //

      await OrderController.confirmEventOrganizer(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findOrderById).toHaveBeenCalledWith(1); //
      expect(mockOrderRepository.updateOrder).toHaveBeenCalledWith(1, {
        orderTotal: 1000,
        orderStatus: 'Pending'
      }); //
      expect(mockCartRepository.findCartById).toHaveBeenCalledWith(mockCart.id); //
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(mockUser.id); //
      expect(mockOrderRepository.findOrderDetailById).toHaveBeenCalledWith(updatedOrder.id); //
      expect(mockItemRepository.findItemsProductDetailsByCartId).toHaveBeenCalledWith(mockCart.id); //
      expect(mockNodemailerUtils.sendNewOrderEmail).toHaveBeenCalledWith(mockUser.email, mockOrderDetail, []); //
      expect(mockResponse.status).toHaveBeenCalledWith(200); //
      expect(mockResponse.json).toHaveBeenCalledWith(updatedOrder); //
    });

    it('should return 404 if order not found during confirmation', async () => {
      mockRequest.params = { id: '999' }; //
      mockRequest.body = { newOrderTotal: 1000 }; //
      mockOrderRepository.findOrderById.mockResolvedValue(null); //

      await OrderController.confirmEventOrganizer(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order not found' }); //
      expect(mockOrderRepository.updateOrder).not.toHaveBeenCalled(); //
    });

    it('should return 404 if cart not found during confirmation', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = { newOrderTotal: 1000 }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(null); //

      await OrderController.confirmEventOrganizer(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cart not found' }); //
      expect(mockUserRepository.findUserById).not.toHaveBeenCalled(); //
    });

    it('should return 404 if user not found during confirmation', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = { newOrderTotal: 1000 }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(null); //

      await OrderController.confirmEventOrganizer(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' }); //
      expect(mockOrderRepository.findOrderDetailById).not.toHaveBeenCalled(); //
    });

    it('should return 404 if order detail not found during confirmation', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = { newOrderTotal: 1000 }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(null); //

      await OrderController.confirmEventOrganizer(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order not found' }); //
      expect(mockNodemailerUtils.sendNewOrderEmail).not.toHaveBeenCalled(); //
    });

    it('should return 500 if an error occurs during confirmation', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = { newOrderTotal: 1000 }; //
      const errorMessage = 'Confirmation error';
      mockOrderRepository.findOrderById.mockRejectedValue(new Error(errorMessage)); //

      await OrderController.confirmEventOrganizer(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(500); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage }); //
    });
  });

  // --- confirmOrderPayment Tests ---
  describe('confirmOrderPayment', () => {
    const existingOrder = { id: 1, cartId: 1, orderStatus: 'Pending' };
    const updatedOrder = { ...existingOrder, orderStatus: 'Completed' };
    const mockCart = { id: 1, userId: 1, type: 'Product' };
    const mockEventCart = { id: 1, userId: 1, type: 'Event' };
    const mockUser = { id: 1, email: 'user@example.com' };
    const mockOrderDetail = { ...updatedOrder, items: [] };

    it('should confirm order payment for Product cart type and send email with status 200', async () => {
      mockRequest.params = { id: '1' }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(mockOrderDetail as any); //
      mockItemRepository.findItemsProductDetailsByCartId.mockResolvedValue([]); //
      mockNodemailerUtils.sendPaidOrderEmail.mockResolvedValue({ messageId: 'mock-message-id' } as any); //

      await OrderController.confirmOrderPayment(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findOrderById).toHaveBeenCalledWith(1); //
      expect(mockOrderRepository.updateOrder).toHaveBeenCalledWith(1, { orderStatus: 'Completed' }); //
      expect(mockCartRepository.findCartById).toHaveBeenCalledWith(mockCart.id); //
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(mockUser.id); //
      expect(mockOrderRepository.findOrderDetailById).toHaveBeenCalledWith(updatedOrder.id); //
      expect(mockItemRepository.findItemsProductDetailsByCartId).toHaveBeenCalledWith(mockCart.id); //
      expect(mockNodemailerUtils.sendPaidOrderEmail).toHaveBeenCalledWith(mockUser.email, mockOrderDetail, []); //
      expect(mockResponse.status).toHaveBeenCalledWith(200); //
      expect(mockResponse.json).toHaveBeenCalledWith(updatedOrder); //
    });

    it('should confirm order payment for Event cart type and send email with status 200', async () => {
      mockRequest.params = { id: '1' }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockEventCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(mockOrderDetail as any); //
      mockItemRepository.findItemsEventDetailsByCartId.mockResolvedValue([]); //
      mockNodemailerUtils.sendPaidOrderEmail.mockResolvedValue({ messageId: 'mock-message-id' } as any); //

      await OrderController.confirmOrderPayment(mockRequest as Request, mockResponse as Response); //

      expect(mockItemRepository.findItemsEventDetailsByCartId).toHaveBeenCalledWith(mockEventCart.id); //
      expect(mockItemRepository.findItemsProductDetailsByCartId).not.toHaveBeenCalled(); //
      expect(mockResponse.status).toHaveBeenCalledWith(200); //
    });

    it('should confirm order payment for Event Organizer cart type and send email with status 200', async () => {
      mockRequest.params = { id: '1' }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      const mockEventOrganizerCart = { id: 1, userId: 1, type: 'Event Organizer' }; //
      mockCartRepository.findCartById.mockResolvedValue(mockEventOrganizerCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(mockOrderDetail as any); //
      mockItemRepository.findItemsProductDetailsByCartId.mockResolvedValue([]); //
      mockNodemailerUtils.sendPaidOrderEmail.mockResolvedValue({ messageId: 'mock-message-id' } as any); //

      await OrderController.confirmOrderPayment(mockRequest as Request, mockResponse as Response); //

      expect(mockItemRepository.findItemsProductDetailsByCartId).toHaveBeenCalledWith(mockEventOrganizerCart.id); //
      expect(mockItemRepository.findItemsEventDetailsByCartId).not.toHaveBeenCalled(); //
      expect(mockResponse.status).toHaveBeenCalledWith(200); //
    });


    it('should return 404 if order not found during payment confirmation', async () => {
      mockRequest.params = { id: '999' }; //
      mockOrderRepository.findOrderById.mockResolvedValue(null); //

      await OrderController.confirmOrderPayment(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order not found' }); //
      expect(mockOrderRepository.updateOrder).not.toHaveBeenCalled(); //
    });

    it('should return 404 if cart not found during payment confirmation', async () => {
      mockRequest.params = { id: '1' }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(null); //

      await OrderController.confirmOrderPayment(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cart not found' }); //
      expect(mockUserRepository.findUserById).not.toHaveBeenCalled(); //
    });

    it('should return 404 if user not found during payment confirmation', async () => {
      mockRequest.params = { id: '1' }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(null); //

      await OrderController.confirmOrderPayment(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' }); //
      expect(mockOrderRepository.findOrderDetailById).not.toHaveBeenCalled(); //
    });

    it('should return 404 if order detail not found during payment confirmation', async () => {
      mockRequest.params = { id: '1' }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(null); //

      await OrderController.confirmOrderPayment(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order not found' }); //
      expect(mockNodemailerUtils.sendPaidOrderEmail).not.toHaveBeenCalled(); //
    });

    it('should return 500 if an error occurs during payment confirmation', async () => {
      mockRequest.params = { id: '1' }; //
      const errorMessage = 'Payment confirmation error';
      mockOrderRepository.findOrderById.mockRejectedValue(new Error(errorMessage)); //

      await OrderController.confirmOrderPayment(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(500); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage }); //
    });
  });

  // --- cancelOrder Tests ---
  describe('cancelOrder', () => {
    const existingOrder = { id: 1, cartId: 1, orderStatus: 'Pending' };
    const updatedOrder = { ...existingOrder, orderStatus: 'Cancelled' };
    const mockCart = { id: 1, userId: 1 };
    const mockUser = { id: 1, email: 'user@example.com' };
    const mockOrderDetail = { ...updatedOrder };
    const cancelMessage = 'Customer changed mind';

    it('should cancel an order and send email with status 200', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = { cancelMessage }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(mockOrderDetail as any); //
      mockNodemailerUtils.sendCancelOrderEmail.mockResolvedValue({ messageId: 'mock-message-id' } as any); //

      await OrderController.cancelOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findOrderById).toHaveBeenCalledWith(1); //
      expect(mockOrderRepository.updateOrder).toHaveBeenCalledWith(1, { orderStatus: 'Cancelled' }); //
      expect(mockCartRepository.findCartById).toHaveBeenCalledWith(mockCart.id); //
      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(mockUser.id); //
      expect(mockOrderRepository.findOrderDetailById).toHaveBeenCalledWith(updatedOrder.id); //
      expect(mockNodemailerUtils.sendCancelOrderEmail).toHaveBeenCalledWith(mockUser.email, mockOrderDetail, cancelMessage); //
      expect(mockResponse.status).toHaveBeenCalledWith(200); //
      expect(mockResponse.json).toHaveBeenCalledWith(updatedOrder); //
    });

    it('should return 404 if order not found during cancellation', async () => {
      mockRequest.params = { id: '999' }; //
      mockRequest.body = { cancelMessage }; //
      mockOrderRepository.findOrderById.mockResolvedValue(null); //

      await OrderController.cancelOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order not found' }); //
      expect(mockOrderRepository.updateOrder).not.toHaveBeenCalled(); //
    });

    it('should return 404 if cart not found during cancellation', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = { cancelMessage }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(null); //

      await OrderController.cancelOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cart not found' }); //
      expect(mockUserRepository.findUserById).not.toHaveBeenCalled(); //
    });

    it('should return 404 if user not found during cancellation', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = { cancelMessage }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(null); //

      await OrderController.cancelOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' }); //
      expect(mockOrderRepository.findOrderDetailById).not.toHaveBeenCalled(); //
    });

    it('should return 404 if order detail not found during cancellation', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = { cancelMessage }; //
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder as any); //
      mockCartRepository.findCartById.mockResolvedValue(mockCart as any); //
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any); //
      mockOrderRepository.findOrderDetailById.mockResolvedValue(null); //

      await OrderController.cancelOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order not found' }); //
      expect(mockNodemailerUtils.sendCancelOrderEmail).not.toHaveBeenCalled(); //
    });

    it('should return 500 if an error occurs during cancellation', async () => {
      mockRequest.params = { id: '1' }; //
      mockRequest.body = { cancelMessage }; //
      const errorMessage = 'Cancellation error';
      mockOrderRepository.findOrderById.mockRejectedValue(new Error(errorMessage)); //

      await OrderController.cancelOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(500); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage }); //
    });
  });

  // --- deleteOrder Tests ---
  describe('deleteOrder', () => {
    it('should delete an order with status 204', async () => {
      mockRequest.params = { id: '1' }; //
      const existingOrder = { id: 1 };
      mockOrderRepository.findOrderById.mockResolvedValue(existingOrder as any); //
      mockOrderRepository.deleteOrder.mockResolvedValue(existingOrder as any); //

      await OrderController.deleteOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockOrderRepository.findOrderById).toHaveBeenCalledWith(1); //
      expect(mockOrderRepository.deleteOrder).toHaveBeenCalledWith(1); //
      expect(mockResponse.status).toHaveBeenCalledWith(204); //
      expect(mockResponse.end).toHaveBeenCalled(); //
    });

    it('should return 404 if order not found during deletion', async () => {
      mockRequest.params = { id: '999' }; //
      mockOrderRepository.findOrderById.mockResolvedValue(null); //

      await OrderController.deleteOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(404); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order not found' }); //
      expect(mockOrderRepository.deleteOrder).not.toHaveBeenCalled(); //
    });

    it('should return 500 if an error occurs during deletion', async () => {
      mockRequest.params = { id: '1' }; //
      const errorMessage = 'Deletion error';
      mockOrderRepository.findOrderById.mockResolvedValue({
        id: 1,
        name: '',
        cartId: 0,
        phone: '',
        address: '',
        notes: null,
        startDate: new Date(),
        endDate: new Date(),
        orderDate: new Date(),
        orderTotal: 0,
        orderStatus: ''
      }); //
      mockOrderRepository.deleteOrder.mockRejectedValue(new Error(errorMessage)); //

      await OrderController.deleteOrder(mockRequest as Request, mockResponse as Response); //

      expect(mockResponse.status).toHaveBeenCalledWith(500); //
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage }); //
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = OrderController.getRoutes(); //
      // This is a basic check to ensure it returns a Router instance.
      // More advanced tests might inspect the router's stack for specific routes and methods.
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // // Ensure some routes are registered
      expect(router.stack.length).toBe(11); // Expecting 10 routes based on your controller
    });
  });
});