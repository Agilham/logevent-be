// src/__tests__/controllers/faq.controller.test.ts

import { Request, Response } from 'express';
import FaqController from '../../controllers/faq.controller'; // Adjust path if needed
import faqRepository from '../../repositories/faq.repository'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the faqRepository module
jest.mock('../../src/repositories/faq.repository');

describe('FaqController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockFaqRepository: DeepMockProxy<typeof faqRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockFaqRepository = faqRepository as DeepMockProxy<typeof faqRepository>;

    jest.clearAllMocks();
  });

  // --- readAllFaqs Tests ---
  describe('readAllFaqs', () => {
    it('should return all FAQs with status 200', async () => {
      const mockFaqs = [{ id: 1, question: 'Q1', answer: 'A1' }, { id: 2, question: 'Q2', answer: 'A2' }];
      mockFaqRepository.findAllFaqs.mockResolvedValue(mockFaqs as any);

      await FaqController.readAllFaqs(mockRequest as Request, mockResponse as Response);

      expect(mockFaqRepository.findAllFaqs).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockFaqs);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockFaqRepository.findAllFaqs.mockRejectedValue(new Error(errorMessage));

      await FaqController.readAllFaqs(mockRequest as Request, mockResponse as Response);

      expect(mockFaqRepository.findAllFaqs).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readFaqById Tests ---
  describe('readFaqById', () => {
    it('should return an FAQ by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockFaq = { id: 1, question: 'Test Q', answer: 'Test A' };
      mockFaqRepository.findFaqById.mockResolvedValue(mockFaq as any);

      await FaqController.readFaqById(mockRequest as Request, mockResponse as Response);

      expect(mockFaqRepository.findFaqById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockFaq);
    });

    it('should return 404 if FAQ not found', async () => {
      mockRequest.params = { id: '999' };
      mockFaqRepository.findFaqById.mockResolvedValue(null);

      await FaqController.readFaqById(mockRequest as Request, mockResponse as Response);

      expect(mockFaqRepository.findFaqById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Faq not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'FAQ details error';
      mockFaqRepository.findFaqById.mockRejectedValue(new Error(errorMessage));

      await FaqController.readFaqById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createFaq Tests ---
  describe('createFaq', () => {
    it('should create an FAQ with status 201', async () => {
      const createBody = { question: 'New Q', answer: 'New A' };
      mockRequest.body = createBody;
      const newFaq = { id: 3, ...createBody };
      mockFaqRepository.createFaq.mockResolvedValue(newFaq as any);

      await FaqController.createFaq(mockRequest as Request, mockResponse as Response);

      expect(mockFaqRepository.createFaq).toHaveBeenCalledWith(createBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newFaq);
    });

    it('should return 500 if an error occurs', async () => {
      const createBody = { question: 'New Q', answer: 'New A' };
      mockRequest.body = createBody;
      const errorMessage = 'Creation error';
      mockFaqRepository.createFaq.mockRejectedValue(new Error(errorMessage));

      await FaqController.createFaq(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateFaq Tests ---
  describe('updateFaq', () => {
    const existingFaq = { id: 1, question: 'Old Q', answer: 'Old A' };

    it('should update an FAQ with status 200 when both fields are provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { question: 'Updated Q', answer: 'Updated A' };
      mockRequest.body = updateBody;
      const updatedFaq = { ...existingFaq, ...updateBody };
      mockFaqRepository.findFaqById.mockResolvedValue(existingFaq as any);
      mockFaqRepository.updateFaq.mockResolvedValue(updatedFaq as any);

      await FaqController.updateFaq(mockRequest as Request, mockResponse as Response);

      expect(mockFaqRepository.findFaqById).toHaveBeenCalledWith(1);
      expect(mockFaqRepository.updateFaq).toHaveBeenCalledWith(1, {
        question: updateBody.question,
        answer: updateBody.answer
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedFaq);
    });

    it('should update an FAQ using existing question if new question is not provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { answer: 'Only Answer Changed' }; // Only updating answer
      mockRequest.body = updateBody;
      const updatedFaq = { ...existingFaq, ...updateBody, question: existingFaq.question };
      mockFaqRepository.findFaqById.mockResolvedValue(existingFaq as any);
      mockFaqRepository.updateFaq.mockResolvedValue(updatedFaq as any);

      await FaqController.updateFaq(mockRequest as Request, mockResponse as Response);

      expect(mockFaqRepository.updateFaq).toHaveBeenCalledWith(1, {
        question: existingFaq.question, // Should retain old question
        answer: updateBody.answer
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedFaq);
    });

    it('should update an FAQ using existing answer if new answer is not provided', async () => {
      mockRequest.params = { id: '1' };
      const updateBody = { question: 'Only Question Changed' }; // Only updating question
      mockRequest.body = updateBody;
      const updatedFaq = { ...existingFaq, ...updateBody, answer: existingFaq.answer };
      mockFaqRepository.findFaqById.mockResolvedValue(existingFaq as any);
      mockFaqRepository.updateFaq.mockResolvedValue(updatedFaq as any);

      await FaqController.updateFaq(mockRequest as Request, mockResponse as Response);

      expect(mockFaqRepository.updateFaq).toHaveBeenCalledWith(1, {
        question: updateBody.question,
        answer: existingFaq.answer // Should retain old answer
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedFaq);
    });


    it('should return 404 if FAQ not found during update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { question: 'Update' };
      mockFaqRepository.findFaqById.mockResolvedValue(null);

      await FaqController.updateFaq(mockRequest as Request, mockResponse as Response);

      expect(mockFaqRepository.findFaqById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Faq not found' });
      expect(mockFaqRepository.updateFaq).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { question: 'Update' };
      const errorMessage = 'Update error';
      mockFaqRepository.findFaqById.mockResolvedValue(existingFaq as any);
      mockFaqRepository.updateFaq.mockRejectedValue(new Error(errorMessage));

      await FaqController.updateFaq(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteFaq Tests ---
  describe('deleteFaq', () => {
    it('should delete an FAQ with status 204', async () => {
      mockRequest.params = { id: '1' };
      const existingFaq = { id: 1 };
      mockFaqRepository.findFaqById.mockResolvedValue(existingFaq as any);
      mockFaqRepository.deleteFaq.mockResolvedValue(existingFaq as any);

      await FaqController.deleteFaq(mockRequest as Request, mockResponse as Response);

      expect(mockFaqRepository.findFaqById).toHaveBeenCalledWith(1);
      expect(mockFaqRepository.deleteFaq).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if FAQ not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockFaqRepository.findFaqById.mockResolvedValue(null);

      await FaqController.deleteFaq(mockRequest as Request, mockResponse as Response);

      expect(mockFaqRepository.findFaqById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Faq not found' });
      expect(mockFaqRepository.deleteFaq).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Deletion error';
      mockFaqRepository.findFaqById.mockResolvedValue({
        id: 1,
        question: '',
        answer: ''
      });
      mockFaqRepository.deleteFaq.mockRejectedValue(new Error(errorMessage));

      await FaqController.deleteFaq(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = FaqController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(5); // Expecting 5 routes based on your controller
    });
  });
});