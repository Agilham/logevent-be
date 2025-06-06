// src/__tests__/controllers/setting.controller.test.ts

import { Request, Response } from 'express';
import SettingController from '../../controllers/setting.controller'; // Adjust path if needed
import settingRepository from '../../repositories/setting.repository'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the settingRepository module
jest.mock('../../repositories/setting.repository');

describe('SettingController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockSettingRepository: DeepMockProxy<typeof settingRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockSettingRepository = settingRepository as DeepMockProxy<typeof settingRepository>;

    jest.clearAllMocks();
  });

  // --- readSetting Tests ---
  describe('readSetting', () => {
    it('should return the setting with status 200', async () => {
      const mockSetting = { id: 1, description: 'App desc', youtubeUrl: 'old_youtube_url', vendorCount: 10 };
      mockSettingRepository.readSetting.mockResolvedValue(mockSetting as any);

      await SettingController.readSetting(mockRequest as Request, mockResponse as Response);

      expect(mockSettingRepository.readSetting).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSetting);
    });

    it('should return 404 if setting not found', async () => {
      mockSettingRepository.readSetting.mockResolvedValue(null);

      await SettingController.readSetting(mockRequest as Request, mockResponse as Response);

      expect(mockSettingRepository.readSetting).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Setting not found' });
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockSettingRepository.readSetting.mockRejectedValue(new Error(errorMessage));

      await SettingController.readSetting(mockRequest as Request, mockResponse as Response);

      expect(mockSettingRepository.readSetting).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateSetting Tests ---
  describe('updateSetting', () => {
    const existingSetting = {
      id: 1,
      description: 'Old Description',
      youtubeUrl: 'http://old.youtube.com/embed/abc',
      vendorCount: 10,
      productCount: 20,
      orderCount: 30
    };

    it('should update setting with new data and correctly transform youtubeUrl', async () => {
      mockRequest.body = {
        description: 'New Description',
        youtubeUrl: 'https://www.youtube.com/watch?v=VIDEOID123',
        vendorCount: 15,
        productCount: 25,
        orderCount: 35
      };
      const expectedYoutubeUrl = 'https://www.youtube.com/embed/VIDEOID123'; // The expected transformed URL
      const updatedSetting = { ...existingSetting, ...mockRequest.body, youtubeUrl: expectedYoutubeUrl };

      mockSettingRepository.readSetting.mockResolvedValue(existingSetting as any);
      mockSettingRepository.updateSetting.mockResolvedValue(updatedSetting);

      await SettingController.updateSetting(mockRequest as Request, mockResponse as Response);

      expect(mockSettingRepository.readSetting).toHaveBeenCalledTimes(1);
      expect(mockSettingRepository.updateSetting).toHaveBeenCalledWith(existingSetting.id, {
        description: 'New Description',
        youtubeUrl: expectedYoutubeUrl,
        vendorCount: 15,
        productCount: 25,
        orderCount: 35
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedSetting);
    });

    it('should update setting and retain old youtubeUrl if new one is not provided', async () => {
      mockRequest.body = { description: 'Only description changed' }; // youtubeUrl not provided
      const updatedSetting = { ...existingSetting, description: 'Only description changed' };

      mockSettingRepository.readSetting.mockResolvedValue(existingSetting as any);
      mockSettingRepository.updateSetting.mockResolvedValue(updatedSetting as any);

      await SettingController.updateSetting(mockRequest as Request, mockResponse as Response);

      expect(mockSettingRepository.updateSetting).toHaveBeenCalledWith(existingSetting.id, {
        description: 'Only description changed',
        youtubeUrl: existingSetting.youtubeUrl, // Should retain old URL
        vendorCount: existingSetting.vendorCount,
        productCount: existingSetting.productCount,
        orderCount: existingSetting.orderCount
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedSetting);
    });

    it('should update setting and set youtubeUrl to null if provided as null', async () => {
      const existingSettingWithYoutube = { ...existingSetting, youtubeUrl: 'http://some.youtube.url/old' };
      mockRequest.body = { youtubeUrl: null }; // Explicitly setting to null
      const updatedSetting = { ...existingSettingWithYoutube, youtubeUrl: null };

      mockSettingRepository.readSetting.mockResolvedValue(existingSettingWithYoutube as any);
      mockSettingRepository.updateSetting.mockResolvedValue(updatedSetting as any);

      await SettingController.updateSetting(mockRequest as Request, mockResponse as Response);

      expect(mockSettingRepository.updateSetting).toHaveBeenCalledWith(existingSettingWithYoutube.id, {
        description: existingSettingWithYoutube.description, // Retained
        youtubeUrl: null, // Set to null
        vendorCount: existingSettingWithYoutube.vendorCount,
        productCount: existingSettingWithYoutube.productCount,
        orderCount: existingSettingWithYoutube.orderCount
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedSetting);
    });

    it('should update setting and not transform youtubeUrl if it does not include "/watch?v="', async () => {
      mockRequest.body = {
        youtubeUrl: 'http://youtube.com/embed/ANOTHERID', // Already embed format or different URL
      };
      const expectedYoutubeUrl = 'http://youtube.com/embed/ANOTHERID';
      const updatedSetting = { ...existingSetting, youtubeUrl: expectedYoutubeUrl };

      mockSettingRepository.readSetting.mockResolvedValue(existingSetting as any);
      mockSettingRepository.updateSetting.mockResolvedValue(updatedSetting as any);

      await SettingController.updateSetting(mockRequest as Request, mockResponse as Response);

      expect(mockSettingRepository.updateSetting).toHaveBeenCalledWith(existingSetting.id, expect.objectContaining({
        youtubeUrl: expectedYoutubeUrl, // Should not be transformed
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedSetting);
    });


    it('should return 404 if setting not found during update', async () => {
      mockSettingRepository.readSetting.mockResolvedValue(null);
      mockRequest.body = { description: 'New' };

      await SettingController.updateSetting(mockRequest as Request, mockResponse as Response);

      expect(mockSettingRepository.readSetting).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Setting not found' });
      expect(mockSettingRepository.updateSetting).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during update', async () => {
      const errorMessage = 'Update error';
      mockSettingRepository.readSetting.mockResolvedValue(existingSetting as any);
      mockSettingRepository.updateSetting.mockRejectedValue(new Error(errorMessage));
      mockRequest.body = { description: 'New' };

      await SettingController.updateSetting(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = SettingController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(2); // Expecting 2 routes based on your controller
    });
  });
});