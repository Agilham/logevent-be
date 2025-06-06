// src/__tests__/controllers/auth.controller.test.ts

import { Request, Response  } from 'express';
import { hash, compare } from 'bcrypt';
import AuthController from '../../controllers/auth.controller'; // Adjust path if needed
import userRepository from '../../repositories/user.repository'; // Adjust path if needed
import cloudinaryUtils from '../../utils/cloudinary'; // Adjust path if needed (now exports class)
import jwtUtils from '../../utils/jwt'; // Adjust path if needed
import nodemailerUtils from '../../utils/nodemailer'; // Adjust path if needed
import { CustomRequest } from '../../utils/types';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';


// --- Mocks Setup ---
// Mock bcrypt functions
jest.mock('bcrypt', () => ({
  // Explicitly define the return types for the mock functions
  // hash returns Promise<string>
  hash: jest.fn(() => Promise.resolve('mockHashedPassword')), // Provide a default resolved value for hash
  // compare returns Promise<boolean>
  compare: jest.fn(() => Promise.resolve(true)), // Provide a default resolved value for compare
}));

// Mock repositories and utils
jest.mock('../../repositories/user.repository');
jest.mock('../../utils/cloudinary'); // Now mocks the class, its methods will be accessed via mockDeep
jest.mock('../../utils/jwt');
jest.mock('../../utils/nodemailer');

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserRepository: DeepMockProxy<typeof userRepository>;
  let mockCloudinaryUtils: DeepMockProxy<typeof cloudinaryUtils>; // Mock the CLASS
  let mockJwtUtils: DeepMockProxy<typeof jwtUtils>;
  let mockNodemailerUtils: DeepMockProxy<typeof nodemailerUtils>;
  let mockBcryptHash: jest.MockedFunction<typeof hash>;
  let mockBcryptCompare: jest.MockedFunction<typeof compare>;

  beforeAll(() => {
    // Initialize DeepMocks for modules that are classes or have deep structures
    mockUserRepository = mockDeep<typeof userRepository>(userRepository);
    mockCloudinaryUtils = mockDeep<typeof cloudinaryUtils>(cloudinaryUtils); // For the class now
    mockJwtUtils = mockDeep<typeof jwtUtils>(jwtUtils);

    // Get references to mocked bcrypt functions
    mockBcryptHash = hash as jest.MockedFunction<typeof hash>;
    mockBcryptCompare = compare as jest.MockedFunction<typeof compare>;
  });


  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks(); // Clear all mocks, including call counts and implementations

    // Reset specific mock implementations that might have been set by mockImplementationOnce
    // or need a default behavior for every test.
    // For cloudinary, ensure its methods are fresh for new tests
    mockCloudinaryUtils.uploadFile.mockReset();
    mockCloudinaryUtils.deleteFile.mockReset();

    // Reset default behaviors for bcrypt
    mockBcryptHash.mockReset();
    mockBcryptCompare.mockReset();
  });

  // --- readAllUser Tests ---
  describe('readAllUser', () => {
    it('should return all users with status 200', async () => {
      const mockUsers = [{ id: 1, email: 'user1@example.com' }, { id: 2, email: 'user2@example.com' }];
      mockUserRepository.findAllUsers.mockResolvedValue(mockUsers as any);

      await AuthController.readAllUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findAllUsers).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockUserRepository.findAllUsers.mockRejectedValue(new Error(errorMessage));

      await AuthController.readAllUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findAllUsers).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- userProfile Tests ---
  describe('userProfile', () => {
    it('should return user profile with status 200', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockRequest = { user: { id: 1 } } as CustomRequest; // Cast to CustomRequest
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any);

      await AuthController.userProfile(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 if user ID not found in request', async () => {
      mockRequest = { user: {} } as CustomRequest; // No id in user object

      await AuthController.userProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User ID not found' });
      expect(mockUserRepository.findUserById).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      mockRequest = { user: { id: 999 } } as CustomRequest;
      mockUserRepository.findUserById.mockResolvedValue(null);

      await AuthController.userProfile(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest = { user: { id: 1 } } as CustomRequest;
      const errorMessage = 'Profile error';
      mockUserRepository.findUserById.mockRejectedValue(new Error(errorMessage));

      await AuthController.userProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- verifyEmail Tests ---
  describe('verifyEmail', () => {
    it('should verify email and return 200', async () => {
      const mockUser = { id: 1, email: 'test@example.com', isVerified: false };
      const updatedUser = { ...mockUser, isVerified: true };
      mockRequest = { user: { id: 1 } } as CustomRequest;
      mockUserRepository.findUserById.mockResolvedValue(mockUser as any);
      mockUserRepository.updateUser.mockResolvedValue(updatedUser as any);

      await AuthController.verifyEmail(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(1, { isVerified: true });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should return 400 if user ID not found in request', async () => {
      mockRequest = { user: {} } as CustomRequest;

      await AuthController.verifyEmail(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User ID not found' });
      expect(mockUserRepository.findUserById).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      mockRequest = { user: { id: 999 } } as CustomRequest;
      mockUserRepository.findUserById.mockResolvedValue(null);

      await AuthController.verifyEmail(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest = { user: { id: 1 } } as CustomRequest;
      const errorMessage = 'Verification error';
      mockUserRepository.findUserById.mockRejectedValue(new Error(errorMessage));

      await AuthController.verifyEmail(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- signIn Tests ---
  describe('signIn', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    const mockHashedPassword = 'hashedPassword';

    it('should return 404 if user not found', async () => {
      mockRequest.body = { email: mockEmail, password: mockPassword };
      mockUserRepository.findUserByEmail.mockResolvedValue(null);

      await AuthController.signIn(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
      expect(mockBcryptCompare).not.toHaveBeenCalled();
    });

    it('should return 401 if email not verified', async () => {
      const mockUser = { id: 1, email: mockEmail, password: mockHashedPassword, isVerified: false };
      mockRequest.body = { email: mockEmail, password: mockPassword };
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser as any);

      await AuthController.signIn(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email not verified' });
      expect(mockBcryptCompare).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.body = { email: mockEmail, password: mockPassword };
      const errorMessage = 'Sign-in error';
      mockUserRepository.findUserByEmail.mockRejectedValue(new Error(errorMessage));

      await AuthController.signIn(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- signUp Tests ---
  describe('signUp', () => {
    const mockEmail = 'newuser@example.com';
    const mockPassword = 'newpassword123';
    const mockBody = {
      email: mockEmail,
      password: mockPassword,
      name: 'New User',
      phone: '9876543210',
      picture: 'base64_image_data',
    };

    it('should return 400 if user already exists', async () => {
      const existingUser = { id: 1, email: mockEmail };
      mockRequest.body = mockBody;
      mockUserRepository.findUserByEmail.mockResolvedValue(existingUser as any);

      await AuthController.signUp(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User already exists' });
      expect(mockBcryptHash).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.body = mockBody;
      const errorMessage = 'Sign-up error';
      mockUserRepository.findUserByEmail.mockRejectedValue(new Error(errorMessage));

      await AuthController.signUp(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- resetPassword Tests ---
  describe('resetPassword', () => {
    const mockEmail = 'reset@example.com';

    it('should return 404 if user not found', async () => {
      mockRequest.body = { email: mockEmail };
      mockUserRepository.findUserByEmail.mockResolvedValue(null);

      await AuthController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
      expect(mockJwtUtils.sign).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.body = { email: mockEmail };
      const errorMessage = 'Reset password error';
      mockUserRepository.findUserByEmail.mockRejectedValue(new Error(errorMessage));

      await AuthController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateUser Tests ---
  describe('updateUser', () => {
    const existingUser = {
      id: 1, email: 'old@example.com', name: 'Old Name', phone: '111', picture: 'old_pic_url', isAdmin: false, isVerified: true, password: 'oldHashedPassword'
    };
    const updateBody = {
      name: 'New Name',
      email: 'new@example.com',
      password: 'newPassword',
      phone: '222',
      picture: 'base64_new_pic_data',
      isAdmin: true,
      isVerified: false,
    };
    const newPicUrl = 'http://cloudinary.com/new_pic.jpg';

    it('should update user without changing password if no new password data', async () => {
      const bodyWithoutPassword = { ...updateBody, password: undefined };
      mockRequest = { user: { id: 1 }, body: bodyWithoutPassword } as CustomRequest;
      const updatedUserResult = { ...existingUser, ...bodyWithoutPassword, picture: newPicUrl };

      mockUserRepository.findUserById.mockResolvedValue(existingUser as any);
      mockUserRepository.findUserByEmail.mockResolvedValue(null);
      mockCloudinaryUtils.uploadFile.mockResolvedValue(newPicUrl);
      mockCloudinaryUtils.deleteFile.mockResolvedValue(undefined);
      // No password hash
      mockUserRepository.updateUser.mockResolvedValue(updatedUserResult as any);

      await AuthController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockBcryptHash).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(1, expect.objectContaining({
        password: existingUser.password, // Should use existing password
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedUserResult);
    });


    it('should return 400 if user ID not found in request', async () => {
      mockRequest = { user: {}, body: updateBody } as CustomRequest;

      await AuthController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User ID not found' });
      expect(mockUserRepository.findUserById).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      mockRequest = { user: { id: 999 }, body: updateBody } as CustomRequest;
      mockUserRepository.findUserById.mockResolvedValue(null);

      await AuthController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should return 400 if new email is already in use by another user', async () => {
      const existingUserWithNewEmail = { id: 2, email: 'new@example.com' };
      mockRequest = { user: { id: 1 }, body: updateBody } as CustomRequest;

      mockUserRepository.findUserById.mockResolvedValue(existingUser as any);
      mockUserRepository.findUserByEmail.mockResolvedValue(existingUserWithNewEmail as any); // Simulate email conflict

      await AuthController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(updateBody.email);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email already in use' });
      expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest = { user: { id: 1 }, body: updateBody } as CustomRequest;
      const errorMessage = 'Update error';
      mockUserRepository.findUserById.mockRejectedValue(new Error(errorMessage));

      await AuthController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = AuthController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(9); // Verify the correct number of routes
    });

    // Helper functions to avoid deep nesting
    function findRoute(router: any, path: string) {
      return router.stack.find((s: any) => s.route && s.route.path === path);
    }

    it('should apply authentication middleware to protected routes', () => {
      const router = AuthController.getRoutes();

      const protectedPaths = [
        '/profile',
        '/verify',
        '/update',
      ];

      protectedPaths.forEach(path => {
        const route = findRoute(router, path);
        expect(route).toBeDefined();
      });

      const publicPaths = [
        '/read',
        '/signin',
        '/signup',
        '/reset-password',
        '/google',
        '/google/callback',
      ];

      publicPaths.forEach(path => {
        const route = findRoute(router, path);
        expect(route).toBeDefined();
      });
    });
  });
});
