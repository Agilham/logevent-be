// src/__tests__/controllers/review.controller.test.ts

import { Request, Response } from 'express';
import ReviewController from '../../controllers/review.controller'; // Adjust path if needed
import reviewRepository from '../../repositories/review.repository'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the reviewRepository module
jest.mock('../../repositories/review.repository');

describe('ReviewController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockReviewRepository: DeepMockProxy<typeof reviewRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockReviewRepository = reviewRepository as DeepMockProxy<typeof reviewRepository>;

    jest.clearAllMocks();
  });

  // --- readAllReviews Tests ---
  describe('readAllReviews', () => {
    it('should return all reviews with status 200', async () => {
      const mockReviews = [{ id: 1, comment: 'Good' }, { id: 2, comment: 'Great' }];
      mockReviewRepository.findAllReviewDetails.mockResolvedValue(mockReviews as any);

      await ReviewController.readAllReviews(mockRequest as Request, mockResponse as Response);

      expect(mockReviewRepository.findAllReviewDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockReviews);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockReviewRepository.findAllReviewDetails.mockRejectedValue(new Error(errorMessage));

      await ReviewController.readAllReviews(mockRequest as Request, mockResponse as Response);

      expect(mockReviewRepository.findAllReviewDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readReviewsByEventId Tests ---
  describe('readReviewsByEventId', () => {
    it('should return reviews by event ID with status 200', async () => {
      mockRequest.params = { eventId: '1' };
      const mockReviews = [{ id: 1, eventId: 1 }];
      mockReviewRepository.findReviewDetailsByEventId.mockResolvedValue(mockReviews as any);

      await ReviewController.readReviewsByEventId(mockRequest as Request, mockResponse as Response);

      expect(mockReviewRepository.findReviewDetailsByEventId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockReviews);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { eventId: '1' };
      const errorMessage = 'Database error';
      mockReviewRepository.findReviewDetailsByEventId.mockRejectedValue(new Error(errorMessage));

      await ReviewController.readReviewsByEventId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readReviewsByProductId Tests ---
  describe('readReviewsByProductId', () => {
    it('should return reviews by product ID with status 200', async () => {
      mockRequest.params = { productId: '1' };
      const mockReviews = [{ id: 1, productId: 1 }];
      mockReviewRepository.findReviewDetailsByProductId.mockResolvedValue(mockReviews as any);

      await ReviewController.readReviewsByProductId(mockRequest as Request, mockResponse as Response);

      expect(mockReviewRepository.findReviewDetailsByProductId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockReviews);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { productId: '1' };
      const errorMessage = 'Database error';
      mockReviewRepository.findReviewDetailsByProductId.mockRejectedValue(new Error(errorMessage));

      await ReviewController.readReviewsByProductId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readReviewByItemId Tests ---
  describe('readReviewByItemId', () => {
    it('should return a review by item ID with status 200', async () => {
      mockRequest.params = { itemId: '1' };
      const mockReview = { id: 1, itemId: 1, rating: 5, comment: 'Fantastic!' };
      mockReviewRepository.findReviewDetailByItemId.mockResolvedValue(mockReview as any);

      await ReviewController.readReviewByItemId(mockRequest as Request, mockResponse as Response);

      expect(mockReviewRepository.findReviewDetailByItemId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockReview);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { itemId: '1' };
      const errorMessage = 'Database error';
      mockReviewRepository.findReviewDetailByItemId.mockRejectedValue(new Error(errorMessage));

      await ReviewController.readReviewByItemId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createReview Tests ---
  describe('createReview', () => {
    it('should create a review with status 201', async () => {
      const createBody = { itemId: 1, rating: 4, comment: 'Good service', tag: 'helpful' };
      mockRequest.body = createBody;
      const newReview = { id: 3, ...createBody };
      mockReviewRepository.createReview.mockResolvedValue(newReview as any);

      await ReviewController.createReview(mockRequest as Request, mockResponse as Response);

      expect(mockReviewRepository.createReview).toHaveBeenCalledWith(createBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newReview);
    });

    it('should return 500 if an error occurs', async () => {
      const createBody = { itemId: 1, rating: 4, comment: 'Good service', tag: 'helpful' };
      mockRequest.body = createBody;
      const errorMessage = 'Creation error';
      mockReviewRepository.createReview.mockRejectedValue(new Error(errorMessage));

      await ReviewController.createReview(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = ReviewController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(5); // Expecting 5 routes based on your controller
    });
  });
});