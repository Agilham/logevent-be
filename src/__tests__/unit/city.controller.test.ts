// src/__tests__/controllers/city.controller.test.ts

import { Request, Response } from 'express';
import CityController from '../../controllers/city.controller'; // Adjust path if needed
import cityRepository from '../../repositories/city.repository'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the cityRepository module
jest.mock('../../src/repositories/city.repository');

describe('CityController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCityRepository: DeepMockProxy<typeof cityRepository>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockCityRepository = cityRepository as DeepMockProxy<typeof cityRepository>;

    jest.clearAllMocks();
  });

  // --- readAllCities Tests ---
  describe('readAllCities', () => {
    it('should return all cities with status 200', async () => {
      const mockCities = [{ id: 1, name: 'Bandung' }, { id: 2, name: 'Jakarta' }];
      mockCityRepository.findAllCities.mockResolvedValue(mockCities as any);

      await CityController.readAllCities(mockRequest as Request, mockResponse as Response);

      expect(mockCityRepository.findAllCities).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCities);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockCityRepository.findAllCities.mockRejectedValue(new Error(errorMessage));

      await CityController.readAllCities(mockRequest as Request, mockResponse as Response);

      expect(mockCityRepository.findAllCities).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readCityById Tests ---
  describe('readCityById', () => {
    it('should return a city by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockCity = { id: 1, name: 'Bandung' };
      mockCityRepository.findCityById.mockResolvedValue(mockCity as any);

      await CityController.readCityById(mockRequest as Request, mockResponse as Response);

      expect(mockCityRepository.findCityById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCity);
    });

    it('should return 404 if city not found', async () => {
      mockRequest.params = { id: '999' };
      mockCityRepository.findCityById.mockResolvedValue(null);

      await CityController.readCityById(mockRequest as Request, mockResponse as Response);

      expect(mockCityRepository.findCityById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'City not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'City details error';
      mockCityRepository.findCityById.mockRejectedValue(new Error(errorMessage));

      await CityController.readCityById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createCity Tests ---
  describe('createCity', () => {
    it('should create a city with status 201', async () => {
      const createBody = { name: 'Surabaya' };
      mockRequest.body = createBody;
      const newCity = { id: 3, ...createBody };
      mockCityRepository.createCity.mockResolvedValue(newCity as any);

      await CityController.createCity(mockRequest as Request, mockResponse as Response);

      expect(mockCityRepository.createCity).toHaveBeenCalledWith(createBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newCity);
    });

    it('should return 500 if an error occurs', async () => {
      const createBody = { name: 'Surabaya' };
      mockRequest.body = createBody;
      const errorMessage = 'Creation error';
      mockCityRepository.createCity.mockRejectedValue(new Error(errorMessage));

      await CityController.createCity(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateCity Tests ---
  describe('updateCity', () => {
    const existingCity = { id: 1, name: 'Old City Name' };

    it('should update a city with status 200 when name is provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated City Name' };
      const updatedCity = { ...existingCity, name: 'Updated City Name' };
      mockCityRepository.findCityById.mockResolvedValue(existingCity as any);
      mockCityRepository.updateCity.mockResolvedValue(updatedCity as any);

      await CityController.updateCity(mockRequest as Request, mockResponse as Response);

      expect(mockCityRepository.findCityById).toHaveBeenCalledWith(1);
      expect(mockCityRepository.updateCity).toHaveBeenCalledWith(1, { name: 'Updated City Name' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedCity);
    });

    it('should update a city using existing name if new name is not provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {}; // No name provided
      mockCityRepository.findCityById.mockResolvedValue(existingCity as any);
      mockCityRepository.updateCity.mockResolvedValue(existingCity as any); // Result is same if no change

      await CityController.updateCity(mockRequest as Request, mockResponse as Response);

      expect(mockCityRepository.findCityById).toHaveBeenCalledWith(1);
      expect(mockCityRepository.updateCity).toHaveBeenCalledWith(1, { name: existingCity.name });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(existingCity);
    });

    it('should return 404 if city not found during update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Update' };
      mockCityRepository.findCityById.mockResolvedValue(null);

      await CityController.updateCity(mockRequest as Request, mockResponse as Response);

      expect(mockCityRepository.findCityById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'City not found' });
      expect(mockCityRepository.updateCity).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Update' };
      const errorMessage = 'Update error';
      mockCityRepository.findCityById.mockResolvedValue(existingCity as any);
      mockCityRepository.updateCity.mockRejectedValue(new Error(errorMessage));

      await CityController.updateCity(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteCity Tests ---
  describe('deleteCity', () => {
    it('should delete a city with status 204', async () => {
      mockRequest.params = { id: '1' };
      const existingCity = { id: 1, name: 'City to Delete' };
      mockCityRepository.findCityById.mockResolvedValue(existingCity as any);
      mockCityRepository.deleteCity.mockResolvedValue(existingCity as any);

      await CityController.deleteCity(mockRequest as Request, mockResponse as Response);

      expect(mockCityRepository.findCityById).toHaveBeenCalledWith(1);
      expect(mockCityRepository.deleteCity).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if city not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockCityRepository.findCityById.mockResolvedValue(null);

      await CityController.deleteCity(mockRequest as Request, mockResponse as Response);

      expect(mockCityRepository.findCityById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'City not found' });
      expect(mockCityRepository.deleteCity).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Deletion error';
      mockCityRepository.findCityById.mockResolvedValue({ id: 1, name: 'City to Delete' });
      mockCityRepository.deleteCity.mockRejectedValue(new Error(errorMessage));

      await CityController.deleteCity(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = CityController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(5); // Expecting 5 routes based on your controller
    });
  });
});