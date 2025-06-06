// src/__tests__/controllers/event.controller.test.ts

import { Request, Response } from 'express';
import EventController from '../../controllers/event.controller'; // Adjust path if needed
import eventRepository from '../../repositories/event.repository'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the eventRepository module
jest.mock('../../repositories/event.repository');

describe('EventController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockEventRepository: DeepMockProxy<typeof eventRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockEventRepository = eventRepository as DeepMockProxy<typeof eventRepository>;

    jest.clearAllMocks();
  });

  // --- readAllEvents Tests ---
  describe('readAllEvents', () => {
    it('should return all events with status 200', async () => {
      const mockEvents = [{ id: 1, name: 'Concert' }, { id: 2, name: 'Festival' }];
      mockEventRepository.findAllEventDetails.mockResolvedValue(mockEvents as any);

      await EventController.readAllEvents(mockRequest as Request, mockResponse as Response);

      expect(mockEventRepository.findAllEventDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockEventRepository.findAllEventDetails.mockRejectedValue(new Error(errorMessage));

      await EventController.readAllEvents(mockRequest as Request, mockResponse as Response);

      expect(mockEventRepository.findAllEventDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readEventById Tests ---
  describe('readEventById', () => {
    it('should return an event by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockEvent = { id: 1, name: 'Concert Night' };
      mockEventRepository.findEventDetailById.mockResolvedValue(mockEvent as any);

      await EventController.readEventById(mockRequest as Request, mockResponse as Response);

      expect(mockEventRepository.findEventDetailById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEvent);
    });

    it('should return 404 if event not found', async () => {
      mockRequest.params = { id: '999' };
      mockEventRepository.findEventDetailById.mockResolvedValue(null);

      await EventController.readEventById(mockRequest as Request, mockResponse as Response);

      expect(mockEventRepository.findEventDetailById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Event not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Event details error';
      mockEventRepository.findEventDetailById.mockRejectedValue(new Error(errorMessage));

      await EventController.readEventById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createEvent Tests ---
  describe('createEvent', () => {
    it('should create an event with status 201', async () => {
      const createBody = {
        categoryId: 1,
        name: 'New Event',
        price: 50.00,
        capacity: 1000,
        description: 'A new exciting event',
        eventImage: 'image_url_here'
      };
      mockRequest.body = createBody;
      const newEvent = { id: 3, ...createBody };
      mockEventRepository.createEvent.mockResolvedValue(newEvent as any);

      await EventController.createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockEventRepository.createEvent).toHaveBeenCalledWith(createBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newEvent);
    });

    it('should return 500 if an error occurs', async () => {
      const createBody = {
        categoryId: 1,
        name: 'New Event',
        price: 50.00,
        capacity: 1000,
        description: 'A new exciting event',
        eventImage: 'image_url_here'
      };
      mockRequest.body = createBody;
      const errorMessage = 'Creation error';
      mockEventRepository.createEvent.mockRejectedValue(new Error(errorMessage));

      await EventController.createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateEvent Tests ---
  describe('updateEvent', () => {
    const existingEvent = {
      id: 1,
      categoryId: 10,
      name: 'Old Event Name',
      price: 100.00,
      capacity: 500,
      description: 'Old Description',
      eventImage: 'old_image.jpg'
    };

    it('should update an event with status 200 when all fields are provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = {
        categoryId: 11,
        name: 'Updated Event Name',
        price: 150.00,
        capacity: 600,
        description: 'New Description',
        eventImage: 'new_image.jpg'
      };
      mockRequest.body = updateBody;
      const updatedEvent = { ...existingEvent, ...updateBody };
      mockEventRepository.findEventById.mockResolvedValue(existingEvent as any);
      mockEventRepository.updateEvent.mockResolvedValue(updatedEvent as any);

      await EventController.updateEvent(mockRequest as Request, mockResponse as Response);

      expect(mockEventRepository.findEventById).toHaveBeenCalledWith(1);
      expect(mockEventRepository.updateEvent).toHaveBeenCalledWith(1, expect.objectContaining({
        categoryId: updateBody.categoryId,
        name: updateBody.name,
        price: updateBody.price,
        capacity: updateBody.capacity,
        description: updateBody.description,
        eventImage: updateBody.eventImage,
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedEvent);
    });

    it('should update an event using existing values if fields are not provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { name: 'Only Name Changed' }; // Only updating name
      mockRequest.body = updateBody;
      const updatedEvent = { ...existingEvent, ...updateBody };
      mockEventRepository.findEventById.mockResolvedValue(existingEvent as any);
      mockEventRepository.updateEvent.mockResolvedValue(updatedEvent as any);

      await EventController.updateEvent(mockRequest as Request, mockResponse as Response);

      expect(mockEventRepository.updateEvent).toHaveBeenCalledWith(1, {
        categoryId: existingEvent.categoryId,
        name: updateBody.name, // Changed
        price: existingEvent.price,
        capacity: existingEvent.capacity,
        description: existingEvent.description,
        eventImage: existingEvent.eventImage,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedEvent);
    });

    it('should return 404 if event not found during update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Update' };
      mockEventRepository.findEventById.mockResolvedValue(null);

      await EventController.updateEvent(mockRequest as Request, mockResponse as Response);

      expect(mockEventRepository.findEventById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Event not found' });
      expect(mockEventRepository.updateEvent).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Update' };
      const errorMessage = 'Update error';
      mockEventRepository.findEventById.mockResolvedValue(existingEvent as any);
      mockEventRepository.updateEvent.mockRejectedValue(new Error(errorMessage));

      await EventController.updateEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteEvent Tests ---
  describe('deleteEvent', () => {
    it('should delete an event with status 204', async () => {
      mockRequest.params = { id: '1' };
      const existingEvent = { id: 1 };
      mockEventRepository.findEventById.mockResolvedValue(existingEvent as any);
      mockEventRepository.deleteEvent.mockResolvedValue(existingEvent as any);

      await EventController.deleteEvent(mockRequest as Request, mockResponse as Response);

      expect(mockEventRepository.findEventById).toHaveBeenCalledWith(1);
      expect(mockEventRepository.deleteEvent).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if event not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockEventRepository.findEventById.mockResolvedValue(null);

      await EventController.deleteEvent(mockRequest as Request, mockResponse as Response);

      expect(mockEventRepository.findEventById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Event not found' });
      expect(mockEventRepository.deleteEvent).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Deletion error';
      mockEventRepository.findEventById.mockResolvedValue({
        id: 1,
        name: '',
        categoryId: 0,
        price: 0,
        capacity: null,
        description: null,
        eventImage: null,
        isDeleted: false
      });
      mockEventRepository.deleteEvent.mockRejectedValue(new Error(errorMessage));

      await EventController.deleteEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = EventController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(5); // Expecting 5 routes based on your controller
    });
  });
});