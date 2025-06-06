// src/__tests__/controllers/album.controller.test.ts

import { Request, Response } from 'express';
import AlbumController from '../../controllers/album.controller'; // Adjust path if needed
import albumRepository from '../../repositories/album.repository'; // Adjust path if needed
import cloudinaryUtils from '../../utils/cloudinary'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the repository and utility modules
jest.mock('../../src/repositories/album.repository');
jest.mock('../../src/utils/cloudinary');

describe('AlbumController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockAlbumRepository: DeepMockProxy<typeof albumRepository>;
  let mockCloudinaryUtils: DeepMockProxy<typeof cloudinaryUtils>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockAlbumRepository = albumRepository as DeepMockProxy<typeof albumRepository>;
    mockCloudinaryUtils = cloudinaryUtils as DeepMockProxy<typeof cloudinaryUtils>;

    jest.clearAllMocks();
  });

  // --- readAllAlbums Tests ---
  describe('readAllAlbums', () => {
    it('should return all albums with status 200', async () => {
      const mockAlbums = [{ id: 1, name: 'Album 1' }, { id: 2, name: 'Album 2' }];
      mockAlbumRepository.findAllAlbums.mockResolvedValue(mockAlbums as any);

      await AlbumController.readAllAlbums(mockRequest as Request, mockResponse as Response);

      expect(mockAlbumRepository.findAllAlbums).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAlbums);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockAlbumRepository.findAllAlbums.mockRejectedValue(new Error(errorMessage));

      await AlbumController.readAllAlbums(mockRequest as Request, mockResponse as Response);

      expect(mockAlbumRepository.findAllAlbums).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readAlbumsByEventId Tests ---
  describe('readAlbumsByEventId', () => {
    it('should return albums by event ID with status 200', async () => {
      mockRequest.params = { eventId: '1' };
      const mockAlbums = [{ id: 1, eventId: 1 }];
      mockAlbumRepository.findAlbumsByEventId.mockResolvedValue(mockAlbums as any);

      await AlbumController.readAlbumsByEventId(mockRequest as Request, mockResponse as Response);

      expect(mockAlbumRepository.findAlbumsByEventId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAlbums);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { eventId: '1' };
      const errorMessage = 'Database error';
      mockAlbumRepository.findAlbumsByEventId.mockRejectedValue(new Error(errorMessage));

      await AlbumController.readAlbumsByEventId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readAlbumsByProductId Tests ---
  describe('readAlbumsByProductId', () => {
    it('should return albums by product ID with status 200', async () => {
      mockRequest.params = { productId: '1' };
      const mockAlbums = [{ id: 1, productId: 1 }];
      mockAlbumRepository.findAlbumsByProductId.mockResolvedValue(mockAlbums as any);

      await AlbumController.readAlbumsByProductId(mockRequest as Request, mockResponse as Response);

      expect(mockAlbumRepository.findAlbumsByProductId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAlbums);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { productId: '1' };
      const errorMessage = 'Database error';
      mockAlbumRepository.findAlbumsByProductId.mockRejectedValue(new Error(errorMessage));

      await AlbumController.readAlbumsByProductId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readAlbumById Tests ---
  describe('readAlbumById', () => {
    it('should return an album by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockAlbum = { id: 1, albumImage: 'image_url' };
      mockAlbumRepository.findAlbumById.mockResolvedValue(mockAlbum as any);

      await AlbumController.readAlbumById(mockRequest as Request, mockResponse as Response);

      expect(mockAlbumRepository.findAlbumById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAlbum);
    });

    it('should return 404 if album not found', async () => {
      mockRequest.params = { id: '999' };
      mockAlbumRepository.findAlbumById.mockResolvedValue(null);

      await AlbumController.readAlbumById(mockRequest as Request, mockResponse as Response);

      expect(mockAlbumRepository.findAlbumById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Album not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Album details error';
      mockAlbumRepository.findAlbumById.mockRejectedValue(new Error(errorMessage));

      await AlbumController.readAlbumById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createAlbum Tests ---
  describe('createAlbum', () => {
    it('should create an album with an image and return 201', async () => {
      const createBody = { eventId: 1, albumImage: 'base64_image_data' };
      mockRequest.body = createBody;
      const uploadedUrl = 'http://cloudinary.com/new_image.jpg';
      const newAlbum = { id: 1, eventId: 1, albumImage: uploadedUrl };

      mockCloudinaryUtils.uploadFile.mockResolvedValue(uploadedUrl);
      mockAlbumRepository.createAlbum.mockResolvedValue(newAlbum as any);

      await AlbumController.createAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockCloudinaryUtils.uploadFile).toHaveBeenCalledWith(createBody.albumImage);
      expect(mockAlbumRepository.createAlbum).toHaveBeenCalledWith({
        eventId: createBody.eventId,
        productId: undefined, // ensure productId is undefined if not provided
        albumImage: uploadedUrl
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newAlbum);
    });

    it('should create an album without an image and return 201', async () => {
      const createBody = { productId: 2, albumImage: null }; // or albumImage: undefined
      mockRequest.body = createBody;
      const newAlbum = { id: 1, productId: 2, albumImage: null };

      mockCloudinaryUtils.uploadFile.mockResolvedValue(''); // Explicitly return null if no image
      mockAlbumRepository.createAlbum.mockResolvedValue(newAlbum as any);

      await AlbumController.createAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockCloudinaryUtils.uploadFile).not.toHaveBeenCalled(); // Should not call upload if albumImage is null/undefined
      expect(mockAlbumRepository.createAlbum).toHaveBeenCalledWith({
        eventId: undefined,
        productId: createBody.productId,
        albumImage: null
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newAlbum);
    });

    it('should return 500 if an error occurs during creation', async () => {
      const createBody = { eventId: 1, albumImage: 'base64_image_data' };
      mockRequest.body = createBody;
      const errorMessage = 'Upload error';
      mockCloudinaryUtils.uploadFile.mockRejectedValue(new Error(errorMessage));

      await AlbumController.createAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
      expect(mockAlbumRepository.createAlbum).not.toHaveBeenCalled(); // Should not try to create album
    });

    it('should return 500 if album creation fails', async () => {
      const createBody = { eventId: 1, albumImage: 'base64_image_data' };
      mockRequest.body = createBody;
      const uploadedUrl = 'http://cloudinary.com/new_image.jpg';
      const errorMessage = 'Repository error';

      mockCloudinaryUtils.uploadFile.mockResolvedValue(uploadedUrl);
      mockAlbumRepository.createAlbum.mockRejectedValue(new Error(errorMessage));

      await AlbumController.createAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateAlbum Tests ---
  describe('updateAlbum', () => {
    const existingAlbumWithImage = { id: 1, eventId: 1, albumImage: 'http://cloudinary.com/old_image.jpg' };
    const existingAlbumWithoutImage = { id: 2, productId: 2, albumImage: null };

    it('should update album and delete old image if new image is provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { albumImage: 'new_base64_image' };
      const newImageUrl = 'http://cloudinary.com/updated_image.jpg';
      const updatedAlbumResult = { ...existingAlbumWithImage, albumImage: newImageUrl };

      mockAlbumRepository.findAlbumById.mockResolvedValue(existingAlbumWithImage as any);
      mockCloudinaryUtils.uploadFile.mockResolvedValue(newImageUrl);
      mockCloudinaryUtils.deleteFile.mockResolvedValue(undefined); // Mock delete to succeed
      mockAlbumRepository.updateAlbum.mockResolvedValue(updatedAlbumResult as any);

      await AlbumController.updateAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockAlbumRepository.findAlbumById).toHaveBeenCalledWith(1);
      expect(mockCloudinaryUtils.uploadFile).toHaveBeenCalledWith('new_base64_image');
      expect(mockCloudinaryUtils.deleteFile).toHaveBeenCalledWith(existingAlbumWithImage.albumImage); // Old image deleted
      expect(mockAlbumRepository.updateAlbum).toHaveBeenCalledWith(1, expect.objectContaining({
        albumImage: newImageUrl,
        eventId: existingAlbumWithImage.eventId // Should retain old eventId if not provided
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedAlbumResult);
    });

    it('should delete old image if albumImage is explicitly set to null/empty in body', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { albumImage: null }; // Explicitly clearing image
      const updatedAlbumResult = { ...existingAlbumWithImage, albumImage: null };

      mockAlbumRepository.findAlbumById.mockResolvedValue(existingAlbumWithImage as any);
      mockCloudinaryUtils.uploadFile.mockResolvedValue(''); // No new image to upload
      mockCloudinaryUtils.deleteFile.mockResolvedValue(undefined); // Old image deleted
      mockAlbumRepository.updateAlbum.mockResolvedValue(updatedAlbumResult as any);

      await AlbumController.updateAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockAlbumRepository.findAlbumById).toHaveBeenCalledWith(1);
      expect(mockCloudinaryUtils.uploadFile).not.toHaveBeenCalled(); // No upload for null
      expect(mockCloudinaryUtils.deleteFile).toHaveBeenCalledWith(existingAlbumWithImage.albumImage); // Old image deleted
      expect(mockAlbumRepository.updateAlbum).toHaveBeenCalledWith(1, expect.objectContaining({
        albumImage: null,
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedAlbumResult);
    });

    it('should not delete old image if no new image is provided and no explicit null/empty', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { eventId: 99 }; // Only updating eventId, no albumImage
      const updatedAlbumResult = { ...existingAlbumWithImage, eventId: 99 };

      mockAlbumRepository.findAlbumById.mockResolvedValue(existingAlbumWithImage as any);
      mockCloudinaryUtils.uploadFile.mockResolvedValue(''); // No new image to upload
      mockCloudinaryUtils.deleteFile.mockResolvedValue(undefined); // Mocks are cleared, so this won't be called unless explicitly told
      mockAlbumRepository.updateAlbum.mockResolvedValue(updatedAlbumResult as any);

      await AlbumController.updateAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockCloudinaryUtils.uploadFile).not.toHaveBeenCalled();
      expect(mockCloudinaryUtils.deleteFile).not.toHaveBeenCalled(); // Should NOT delete old image
      expect(mockAlbumRepository.updateAlbum).toHaveBeenCalledWith(1, expect.objectContaining({
        eventId: 99,
        albumImage: existingAlbumWithImage.albumImage // Should retain old image if not provided
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedAlbumResult);
    });


    it('should not delete old image if existing album has no image and no new image is provided', async () => {
      mockRequest.params = { id: '2' };
      mockRequest.body = { eventId: 100 }; // Only updating eventId
      const updatedAlbumResult = { ...existingAlbumWithoutImage, eventId: 100 };

      mockAlbumRepository.findAlbumById.mockResolvedValue(existingAlbumWithoutImage as any);
      mockCloudinaryUtils.uploadFile.mockResolvedValue('');
      mockAlbumRepository.updateAlbum.mockResolvedValue(updatedAlbumResult as any);

      await AlbumController.updateAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockCloudinaryUtils.deleteFile).not.toHaveBeenCalled(); // No image to delete
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedAlbumResult);
    });

    it('should return 404 if album not found during update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { albumImage: 'new_image' };
      mockAlbumRepository.findAlbumById.mockResolvedValue(null);

      await AlbumController.updateAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Album not found' });
      expect(mockCloudinaryUtils.uploadFile).not.toHaveBeenCalled();
      expect(mockCloudinaryUtils.deleteFile).not.toHaveBeenCalled();
      expect(mockAlbumRepository.updateAlbum).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during image upload', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { albumImage: 'new_base64_image' };
      const errorMessage = 'Upload failed';
      mockAlbumRepository.findAlbumById.mockResolvedValue(existingAlbumWithImage as any);
      mockCloudinaryUtils.uploadFile.mockRejectedValue(new Error(errorMessage));

      await AlbumController.updateAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
      expect(mockCloudinaryUtils.deleteFile).not.toHaveBeenCalled(); // Delete should not be called
      expect(mockAlbumRepository.updateAlbum).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during old image deletion', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { albumImage: 'new_base64_image' };
      const newImageUrl = 'http://cloudinary.com/updated_image.jpg';
      const errorMessage = 'Delete failed';

      mockAlbumRepository.findAlbumById.mockResolvedValue(existingAlbumWithImage as any);
      mockCloudinaryUtils.uploadFile.mockResolvedValue(newImageUrl);
      mockCloudinaryUtils.deleteFile.mockRejectedValue(new Error(errorMessage)); // Simulate delete error
      mockAlbumRepository.updateAlbum.mockResolvedValue({} as any); // Still expect update to be called

      await AlbumController.updateAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
      // Depending on how you want to handle this in real app, updateAlbum might still be called or not.
      // For this test, assuming it proceeds if delete fails, but error caught by outer try/catch.
      expect(mockAlbumRepository.updateAlbum).toHaveBeenCalled(); // It should proceed
    });

    it('should return 500 if an error occurs during album update in repository', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { albumImage: 'new_base64_image' };
      const newImageUrl = 'http://cloudinary.com/updated_image.jpg';
      const errorMessage = 'Repository update failed';

      mockAlbumRepository.findAlbumById.mockResolvedValue(existingAlbumWithImage as any);
      mockCloudinaryUtils.uploadFile.mockResolvedValue(newImageUrl);
      mockCloudinaryUtils.deleteFile.mockResolvedValue(undefined);
      mockAlbumRepository.updateAlbum.mockRejectedValue(new Error(errorMessage)); // Simulate update error

      await AlbumController.updateAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- deleteAlbum Tests ---
  describe('deleteAlbum', () => {
    const existingAlbumWithImage = { id: 1, albumImage: 'http://cloudinary.com/old_image.jpg' };
    const existingAlbumWithoutImage = { id: 2, albumImage: null };

    it('should delete an album with an image and return 204', async () => {
      mockRequest.params = { id: '1' };
      mockAlbumRepository.findAlbumById.mockResolvedValue(existingAlbumWithImage as any);
      mockCloudinaryUtils.deleteFile.mockResolvedValue(undefined); // Mock delete to succeed
      mockAlbumRepository.deleteAlbum.mockResolvedValue(undefined as any); // Mock delete to succeed

      await AlbumController.deleteAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockAlbumRepository.findAlbumById).toHaveBeenCalledWith(1);
      expect(mockCloudinaryUtils.deleteFile).toHaveBeenCalledWith(existingAlbumWithImage.albumImage);
      expect(mockAlbumRepository.deleteAlbum).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should delete an album without an image and return 204', async () => {
      mockRequest.params = { id: '2' };
      mockAlbumRepository.findAlbumById.mockResolvedValue(existingAlbumWithoutImage as any);
      mockAlbumRepository.deleteAlbum.mockResolvedValue(undefined as any);

      await AlbumController.deleteAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockAlbumRepository.findAlbumById).toHaveBeenCalledWith(2);
      expect(mockCloudinaryUtils.deleteFile).not.toHaveBeenCalled(); // No image to delete
      expect(mockAlbumRepository.deleteAlbum).toHaveBeenCalledWith(2);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if album not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockAlbumRepository.findAlbumById.mockResolvedValue(null);

      await AlbumController.deleteAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockAlbumRepository.findAlbumById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Album not found' });
      expect(mockCloudinaryUtils.deleteFile).not.toHaveBeenCalled();
      expect(mockAlbumRepository.deleteAlbum).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during image deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Cloudinary delete error';
      mockAlbumRepository.findAlbumById.mockResolvedValue(existingAlbumWithImage as any);
      mockCloudinaryUtils.deleteFile.mockRejectedValue(new Error(errorMessage));

      await AlbumController.deleteAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
      expect(mockAlbumRepository.deleteAlbum).not.toHaveBeenCalled(); // Should not proceed to delete album if image delete fails
    });

    it('should return 500 if an error occurs during album deletion in repository', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Repository delete error';
      mockAlbumRepository.findAlbumById.mockResolvedValue(existingAlbumWithImage as any);
      mockCloudinaryUtils.deleteFile.mockResolvedValue(undefined);
      mockAlbumRepository.deleteAlbum.mockRejectedValue(new Error(errorMessage));

      await AlbumController.deleteAlbum(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = AlbumController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(7); // Expecting 7 routes based on your controller
    });
  });
});