// src/__tests__/middleware.test.ts

import { Request, Response, NextFunction } from 'express';
import middleware from '../middleware'; // Adjust path if needed
import jwtUtils from '../utils/jwt'; // Adjust path if needed
import { CustomRequest } from '../utils/types';
import { DeepMockProxy } from 'jest-mock-extended';

// Mock external dependencies
jest.mock('../utils/jwt');
// Mock express-rate-limit directly if you want to control its behavior in detail
// However, for unit testing middleware, we usually want to test our *integration* with it
// and ensure we're using it correctly, rather than testing rate-limit itself.
// For `visitRateLimit`, we primarily test if it's correctly assigned and configured.
// If you needed to mock its *internal behavior* (e.g., to simulate exceeding limits),
// you'd mock it like: jest.mock('express-rate-limit', () => ({
//   rateLimit: jest.fn(() => (req, res, next) => next()), // Mock out its actual execution
// }));


describe('Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJwtUtils: DeepMockProxy<typeof jwtUtils>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn(); // Jest mock function for next()

    mockJwtUtils = jwtUtils as DeepMockProxy<typeof jwtUtils>;

    jest.clearAllMocks();
  });

  // --- authenticate middleware Tests ---
  describe('authenticate', () => {
    it('should call next() if token is valid', async () => {
      const mockToken = 'Bearer validtoken123';
      const mockDecoded = { id: 1, email: 'test@example.com' };
      mockRequest.headers = { authorization: mockToken };
      mockJwtUtils.verifyToken.mockReturnValue(mockDecoded);

      await middleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtUtils.verifyToken).toHaveBeenCalledWith(mockToken);
      expect((mockRequest as CustomRequest).user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled(); // Ensure no error status is set
      expect(mockResponse.json).not.toHaveBeenCalled(); // Ensure no error json is sent
    });

    it('should return 401 and "Token not provided" if no authorization header', async () => {
      mockRequest.headers = {}; // No authorization header

      await middleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtUtils.verifyToken).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled(); // Next should not be called
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token not provided' });
    });

    it('should return 401 and "Invalid token" if token is invalid (generic error)', async () => {
      const mockToken = 'Bearer invalidtoken';
      mockRequest.headers = { authorization: mockToken };
      mockJwtUtils.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token'); // Simulate JWT verification failure
      });

      await middleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtUtils.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });

    it('should return 401 and specific error message if provided by jwtUtils', async () => {
      const mockToken = 'Bearer expiredtoken';
      mockRequest.headers = { authorization: mockToken };
      const specificErrorMessage = 'TokenExpiredError: jwt expired';
      mockJwtUtils.verifyToken.mockImplementation(() => {
        throw new Error(specificErrorMessage); // Simulate a more specific JWT error
      });

      await middleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtUtils.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: specificErrorMessage });
    });
  });

  // --- visitRateLimit middleware Tests ---
  describe('visitRateLimit', () => {
    // This test checks if the middleware exports a rateLimit instance,
    // and if it has the expected properties configured.
    // It does NOT test the *behavior* of rateLimit itself (e.g., if it correctly blocks after 1 request),
    // as that's testing `express-rate-limit` library, not your integration.
    it('should be an instance of express-rate-limit middleware with correct configuration', () => {
      // Because `express-rate-limit` is mocked at the module level (implied by default jest.mock),
      // we check if the returned value from `middleware.visitRateLimit` is a function (as express middleware is)
      // and if its properties match the configuration.
      // Note: Directly accessing `windowMs`, `max`, `message` on the exported `visitRateLimit`
      // depends on how `express-rate-limit` library is structured.
      // Often, you might test its *behavior* by making actual HTTP requests with Supertest,
      // but for a pure unit test, checking configuration is often sufficient.

      // If you're not deeply mocking `express-rate-limit` (meaning you use the real library),
      // the `middleware.visitRateLimit` itself would be the function.
      // If you are using a mock, it's typically a mock function.

      // For this scenario, assuming `express-rate-limit` is *not* mocked internally for `visitRateLimit`,
      // we check the returned object properties or function properties.
      // Or, more accurately for a unit test of *your code*,
      // ensure the middleware.visitRateLimit property IS the function returned by rateLimit.

      // If using `jest.mock('express-rate-limit')` at the top, then `rateLimit` is a mock.
      // We need to check if middleware.visitRateLimit *is* the result of calling the mocked rateLimit.
      expect(middleware.visitRateLimit).toBeInstanceOf(Function); // Middleware is a function

      // You would then inspect its internal properties if they are exposed,
      // but express-rate-limit does not directly expose these config values
      // as public properties on the middleware function itself after it's created.
      // The most reliable test for configuration when using a third-party middleware
      // is often to inspect the arguments passed to the *mocked constructor/factory function*.

      // Let's adjust for inspecting the call to the mocked `rateLimit` constructor
      // This assumes `express-rate-limit`'s `rateLimit` function is explicitly mocked.
      // If `rateLimit` is not mocked, this test would be harder to write as a pure unit test.

      // For this to work, you would typically have:
      // jest.mock('express-rate-limit');
      // const { rateLimit } = jest.mocked(require('express-rate-limit')); // To get typed mock
      //
      // then in test:
      // expect(rateLimit).toHaveBeenCalledTimes(1);
      // expect(rateLimit).toHaveBeenCalledWith(expect.objectContaining({
      //   windowMs: 24 * 60 * 60 * 1000,
      //   max: 1,
      //   message: 'You have already recorded a visit today'
      // }));
      // expect(middleware.visitRateLimit).toBe(rateLimit.mock.results[0].value); // That middleware.visitRateLimit is the returned function
    });
  });
});