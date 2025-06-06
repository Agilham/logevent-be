// src/__tests__/controllers/visit.controller.test.ts

import { Request, Response, NextFunction } from 'express';
import VisitController from '../../controllers/visit.controller'; // Adjust path if needed
import visitRepository from '../../repositories/visit.repository'; // Adjust path if needed
import middleware from '../../middleware'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the repository and middleware modules
jest.mock('../../repositories/visit.repository');
jest.mock('../../middleware');

describe('VisitController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockVisitRepository: DeepMockProxy<typeof visitRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    

    mockVisitRepository = visitRepository as DeepMockProxy<typeof visitRepository>;

    jest.clearAllMocks();
    // Ensure middleware.visitRateLimit calls next() by default unless explicitly mocked
    (middleware.visitRateLimit as unknown as jest.Mock).mockImplementation((req, res, next) => next());
  });

  // --- readAllVisits Tests ---
  describe('readAllVisits', () => {
    it('should return all visits with status 200', async () => {
      const mockVisits = [{ id: 1, ipAddress: '192.168.1.1' }, { id: 2, ipAddress: '10.0.0.1' }];
      mockVisitRepository.findAllVisits.mockResolvedValue(mockVisits as any);

      await VisitController.readAllVisits(mockRequest as Request, mockResponse as Response);

      expect(mockVisitRepository.findAllVisits).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockVisits);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockVisitRepository.findAllVisits.mockRejectedValue(new Error(errorMessage));

      await VisitController.readAllVisits(mockRequest as Request, mockResponse as Response);

      expect(mockVisitRepository.findAllVisits).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readPastWeekVisits Tests ---
  describe('readPastWeekVisits', () => {
    it('should return past week visits with status 200', async () => {
      mockRequest.params = { date: '2023-06-01T10:00:00.000Z' };
      const mockVisits = [{ id: 10, visitDate: new Date('2023-05-28') }];
      mockVisitRepository.findPastWeekVisits.mockResolvedValue(mockVisits as any);

      await VisitController.readPastWeekVisits(mockRequest as Request, mockResponse as Response);

      expect(mockVisitRepository.findPastWeekVisits).toHaveBeenCalledWith(expect.any(Date));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockVisits);
    });

    it('should return 400 if no date is provided', async () => {
      mockRequest.params = {}; // No date provided

      await VisitController.readPastWeekVisits(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Please provide a date' });
      expect(mockVisitRepository.findPastWeekVisits).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { date: '2023-06-01T10:00:00.000Z' };
      const errorMessage = 'Date parsing error';
      mockVisitRepository.findPastWeekVisits.mockRejectedValue(new Error(errorMessage));

      await VisitController.readPastWeekVisits(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createVisit Tests ---
  describe('createVisit', () => {
    it('should create a visit with IP address and return 201', async () => {
      (mockRequest as any).ip = '192.168.1.50';
      const newVisit = { id: 3, ipAddress: '192.168.1.50' };
      mockVisitRepository.createVisit.mockResolvedValue(newVisit as any);

      await VisitController.createVisit(mockRequest as Request, mockResponse as Response);

      expect(mockVisitRepository.createVisit).toHaveBeenCalledWith({ ipAddress: '192.168.1.50' });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newVisit);
    });

    it('should create a visit with null IP address if req.ip is not available', async () => {
      (mockRequest as any).ip = undefined; // Simulate req.ip being undefined
      const newVisit = { id: 4, ipAddress: null };
      mockVisitRepository.createVisit.mockResolvedValue(newVisit as any);

      await VisitController.createVisit(mockRequest as Request, mockResponse as Response);

      expect(mockVisitRepository.createVisit).toHaveBeenCalledWith({ ipAddress: null });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newVisit);
    });

    it('should return 500 if an error occurs', async () => {
      (mockRequest as any).ip = '192.168.1.50';
      const errorMessage = 'Creation error';
      mockVisitRepository.createVisit.mockRejectedValue(new Error(errorMessage));

      await VisitController.createVisit(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = VisitController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(3); // Expecting 3 routes based on your controller
    });

    it('should apply visitRateLimit middleware to the create route', () => {
      const router = VisitController.getRoutes();
      const createRoute = router.stack.find(s => s.route && s.route.path === '/create' && (s.route as any).methods?.post);

      expect(createRoute).toBeDefined();
      expect(createRoute?.route?.stack.some(handler => handler.handle === middleware.visitRateLimit)).toBe(true);

      // Ensure it's not applied to other routes
      const readAllVisitsRoute = router.stack.find(s => s.route && s.route.path === '/read' && (s.route as any).methods.get);
      expect(readAllVisitsRoute?.route?.stack.some(handler => handler.handle === middleware.visitRateLimit)).toBe(false);
    });
  });
});