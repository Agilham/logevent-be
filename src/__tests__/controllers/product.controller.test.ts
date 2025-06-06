// src/__tests__/controllers/product.controller.test.ts

import { Request, Response } from 'express';
import ProductController from '../../controllers/product.controller'; // Adjust path if needed
import productRepository from '../../repositories/product.repository'; // Adjust path if needed
import cloudinaryUtils from '../../utils/cloudinary'; // Adjust path if needed
import { DeepMockProxy } from 'jest-mock-extended';

// Mock the repository and utility modules
jest.mock('../../repositories/product.repository');
jest.mock('../../utils/cloudinary');

describe('ProductController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockProductRepository: DeepMockProxy<typeof productRepository>;
  let mockCloudinaryUtils: DeepMockProxy<typeof cloudinaryUtils>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };

    mockProductRepository = productRepository as DeepMockProxy<typeof productRepository>;
    mockCloudinaryUtils = cloudinaryUtils as DeepMockProxy<typeof cloudinaryUtils>;

    jest.clearAllMocks();
  });

  // --- readAllProducts Tests ---
  describe('readAllProducts', () => {
    it('should return all products with status 200', async () => {
      const mockProducts = [{ id: 1, name: 'Product A' }, { id: 2, name: 'Product B' }];
      mockProductRepository.findAllProductDetails.mockResolvedValue(mockProducts as any);

      await ProductController.readAllProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findAllProductDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockProductRepository.findAllProductDetails.mockRejectedValue(new Error(errorMessage));

      await ProductController.readAllProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findAllProductDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readTopProducts Tests ---
  describe('readTopProducts', () => {
    it('should return top products with status 200', async () => {
      const mockProducts = [{ id: 1, name: 'Top Product' }];
      mockProductRepository.getTopProductDetails.mockResolvedValue(mockProducts as any);

      await ProductController.readTopProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.getTopProductDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockProductRepository.getTopProductDetails.mockRejectedValue(new Error(errorMessage));

      await ProductController.readTopProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.getTopProductDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readAdminProducts Tests ---
  describe('readAdminProducts', () => {
    it('should return admin products with status 200', async () => {
      const mockProducts = [{ id: 1, name: 'Admin Product' }];
      mockProductRepository.findAllAdminProductDetails.mockResolvedValue(mockProducts as any);

      await ProductController.readAdminProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findAllAdminProductDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should return 500 if an error occurs', async () => {
      const errorMessage = 'Database error';
      mockProductRepository.findAllAdminProductDetails.mockRejectedValue(new Error(errorMessage));

      await ProductController.readAdminProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findAllAdminProductDetails).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readProductsByVendorId Tests ---
  describe('readProductsByVendorId', () => {
    it('should return products by vendor ID with status 200', async () => {
      mockRequest.params = { vendorId: '1' };
      const mockProducts = [{ id: 1, vendorId: 1 }];
      mockProductRepository.findProductDetailsByVendorId.mockResolvedValue(mockProducts as any);

      await ProductController.readProductsByVendorId(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findProductDetailsByVendorId).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { vendorId: '1' };
      const errorMessage = 'Database error';
      mockProductRepository.findProductDetailsByVendorId.mockRejectedValue(new Error(errorMessage));

      await ProductController.readProductsByVendorId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- readProductById Tests ---
  describe('readProductById', () => {
    it('should return a product by ID with status 200', async () => {
      mockRequest.params = { id: '1' };
      const mockProduct = { id: 1, name: 'Test Product' };
      mockProductRepository.findProductDetailById.mockResolvedValue(mockProduct as any);

      await ProductController.readProductById(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findProductDetailById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should return 404 if product not found', async () => {
      mockRequest.params = { id: '999' };
      mockProductRepository.findProductDetailById.mockResolvedValue(null);

      await ProductController.readProductById(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findProductDetailById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });

    it('should return 500 if an error occurs', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Product details error';
      mockProductRepository.findProductDetailById.mockRejectedValue(new Error(errorMessage));

      await ProductController.readProductById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- createProduct Tests ---
  describe('createProduct', () => {
    const createBody = {
      vendorId: 1, categoryId: 1, name: 'New Product', specification: 'Spec',
      rate: 4.5, price: 100, capacity: 50, description: 'Desc', productImage: 'base64_image'
    };

    it('should create a product with an image and return 201', async () => {
      mockRequest.body = createBody;
      const productImageUrl = 'http://cloudinary.com/new_product_image.jpg';
      const newProduct = { id: 1, ...createBody, productImage: productImageUrl };

      mockCloudinaryUtils.uploadFile.mockResolvedValue(productImageUrl);
      mockProductRepository.createProduct.mockResolvedValue(newProduct as any);

      await ProductController.createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockCloudinaryUtils.uploadFile).toHaveBeenCalledWith(createBody.productImage);
      expect(mockProductRepository.createProduct).toHaveBeenCalledWith(expect.objectContaining({
        productImage: productImageUrl,
        name: createBody.name,
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newProduct);
    });

    it('should create a product without an image and return 201', async () => {
      const bodyWithoutImage = { ...createBody, productImage: null };
      mockRequest.body = bodyWithoutImage;
      const newProduct = { id: 1, ...bodyWithoutImage, productImage: null };

      mockCloudinaryUtils.uploadFile.mockResolvedValue(null as any);
      mockProductRepository.createProduct.mockResolvedValue(newProduct as any);

      await ProductController.createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockCloudinaryUtils.uploadFile).not.toHaveBeenCalled();
      expect(mockProductRepository.createProduct).toHaveBeenCalledWith(expect.objectContaining({
        productImage: null,
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newProduct);
    });

    it('should return 500 if an error occurs during image upload', async () => {
      mockRequest.body = createBody;
      const errorMessage = 'Upload failed';
      mockCloudinaryUtils.uploadFile.mockRejectedValue(new Error(errorMessage));

      await ProductController.createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
      expect(mockProductRepository.createProduct).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during product creation', async () => {
      mockRequest.body = createBody;
      const productImageUrl = 'http://cloudinary.com/new_product_image.jpg';
      const errorMessage = 'Repository error';

      mockCloudinaryUtils.uploadFile.mockResolvedValue(productImageUrl);
      mockProductRepository.createProduct.mockRejectedValue(new Error(errorMessage));

      await ProductController.createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- updateProduct Tests ---
  describe('updateProduct', () => {
    const existingProductWithImage = {
      id: 1, vendorId: 10, categoryId: 20, name: 'Old Product',
      specification: 'Old Spec', rate: 3, price: 50, capacity: 10,
      description: 'Old Desc', productImage: 'http://cloudinary.com/old_product_image.jpg'
    };
    const existingProductWithoutImage = {
      id: 2, vendorId: 10, categoryId: 20, name: 'No Image Product',
      specification: 'Spec', rate: 3, price: 50, capacity: 10,
      description: 'Desc', productImage: null
    };

    it('should update product and delete old image if new image is provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { productImage: 'new_base64_image', name: 'Updated Name' };
      const newImageUrl = 'http://cloudinary.com/updated_product_image.jpg';
      const updatedProductResult = { ...existingProductWithImage, productImage: newImageUrl, name: 'Updated Name' };

      mockProductRepository.findProductById.mockResolvedValue(existingProductWithImage as any);
      mockCloudinaryUtils.uploadFile.mockResolvedValue(newImageUrl);
      mockCloudinaryUtils.deleteFile.mockResolvedValue(undefined); // Mock delete to succeed
      mockProductRepository.updateProduct.mockResolvedValue(updatedProductResult as any);

      await ProductController.updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findProductById).toHaveBeenCalledWith(1);
      expect(mockCloudinaryUtils.uploadFile).toHaveBeenCalledWith('new_base64_image');
      expect(mockCloudinaryUtils.deleteFile).toHaveBeenCalledWith(existingProductWithImage.productImage); // Old image deleted
      expect(mockProductRepository.updateProduct).toHaveBeenCalledWith(1, expect.objectContaining({
        productImage: newImageUrl,
        name: 'Updated Name',
        // Ensure other fields default to existing if not provided
        vendorId: existingProductWithImage.vendorId
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedProductResult);
    });

    it('should not delete old image if existing product has no image and no new image is provided', async () => {
      mockRequest.params = { id: '2' };
      mockRequest.body = { name: 'No Image Update' };
      const updatedProductResult = { ...existingProductWithoutImage, name: 'No Image Update' };

      mockProductRepository.findProductById.mockResolvedValue(existingProductWithoutImage as any);
      mockCloudinaryUtils.uploadFile.mockResolvedValue(null as any);
      mockProductRepository.updateProduct.mockResolvedValue(updatedProductResult as any);

      await ProductController.updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockCloudinaryUtils.deleteFile).not.toHaveBeenCalled(); // No image to delete
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedProductResult);
    });

    it('should return 404 if product not found during update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Update' };
      mockProductRepository.findProductById.mockResolvedValue(null);

      await ProductController.updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findProductById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Product not found' });
      expect(mockCloudinaryUtils.uploadFile).not.toHaveBeenCalled();
      expect(mockCloudinaryUtils.deleteFile).not.toHaveBeenCalled();
      expect(mockProductRepository.updateProduct).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during image upload', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { productImage: 'new_base64_image' };
      const errorMessage = 'Upload failed';
      mockProductRepository.findProductById.mockResolvedValue(existingProductWithImage as any);
      mockCloudinaryUtils.uploadFile.mockRejectedValue(new Error(errorMessage));

      await ProductController.updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
      expect(mockCloudinaryUtils.deleteFile).not.toHaveBeenCalled();
      expect(mockProductRepository.updateProduct).not.toHaveBeenCalled();
    });
  });

  // --- deleteProduct Tests ---
  describe('deleteProduct', () => {
    const existingProductWithImage = { id: 1, productImage: 'http://cloudinary.com/product_image.jpg' };
    const existingProductWithoutImage = { id: 2, productImage: null };

    it('should delete a product with an image and return 204', async () => {
      mockRequest.params = { id: '1' };
      mockProductRepository.findProductById.mockResolvedValue(existingProductWithImage as any);
      mockCloudinaryUtils.deleteFile.mockResolvedValue(undefined);
      mockProductRepository.deleteProduct.mockResolvedValue(undefined as any);

      await ProductController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findProductById).toHaveBeenCalledWith(1);
      expect(mockCloudinaryUtils.deleteFile).toHaveBeenCalledWith(existingProductWithImage.productImage);
      expect(mockProductRepository.deleteProduct).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should delete a product without an image and return 204', async () => {
      mockRequest.params = { id: '2' };
      mockProductRepository.findProductById.mockResolvedValue(existingProductWithoutImage as any);
      mockProductRepository.deleteProduct.mockResolvedValue(undefined as any);

      await ProductController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findProductById).toHaveBeenCalledWith(2);
      expect(mockCloudinaryUtils.deleteFile).not.toHaveBeenCalled(); // No image to delete
      expect(mockProductRepository.deleteProduct).toHaveBeenCalledWith(2);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 404 if product not found during deletion', async () => {
      mockRequest.params = { id: '999' };
      mockProductRepository.findProductById.mockResolvedValue(null);

      await ProductController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockProductRepository.findProductById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Product not found' });
      expect(mockCloudinaryUtils.deleteFile).not.toHaveBeenCalled();
      expect(mockProductRepository.deleteProduct).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs during image deletion', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Cloudinary delete error';
      mockProductRepository.findProductById.mockResolvedValue(existingProductWithImage as any);
      mockCloudinaryUtils.deleteFile.mockRejectedValue(new Error(errorMessage));

      await ProductController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
      expect(mockProductRepository.deleteProduct).not.toHaveBeenCalled(); // Should not proceed if image delete fails
    });

    it('should return 500 if an error occurs during product deletion in repository', async () => {
      mockRequest.params = { id: '1' };
      const errorMessage = 'Repository delete error';
      mockProductRepository.findProductById.mockResolvedValue(existingProductWithImage as any);
      mockCloudinaryUtils.deleteFile.mockResolvedValue(undefined);
      mockProductRepository.deleteProduct.mockRejectedValue(new Error(errorMessage));

      await ProductController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  // --- getRoutes Tests ---
  describe('getRoutes', () => {
    it('should return an Express Router instance with all routes defined', () => {
      const router = ProductController.getRoutes();
      expect(router).toBeInstanceOf(Function); // Express Router is a function
      expect(router.stack.length).toBeGreaterThan(0); // Ensure some routes are registered
      expect(router.stack.length).toBe(8); // Expecting 8 routes based on your controller
    });
  });
});