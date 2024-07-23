// src/repositories/product.repository.ts

// dependency modules
import { Product, Vendor } from "@prisma/client";
// self-defined modules
import itemRepository from "./item.repository";
import vendorRepository from "./vendor.repository";
import prisma from "../utils/prisma";
import { ProductDetails } from "../utils/types";

class ProductRepository {
  async findAllProducts(): Promise<ProductDetails[]> {
    const products = await prisma.product.findMany();
    return Promise.all(products.map((product) => this.createProductDetails(product)));
  }

  async findProductById(id: number): Promise<ProductDetails | null> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return null;
    return this.createProductDetails(product);
  }

  async findProductsByCategory(category: string): Promise<Product[]> {
    return prisma.product.findMany({ where: { category } });
  }

  async findTopProducts(): Promise<ProductDetails[]> {
    const products = await prisma.product.findMany();
    const productDetailsPromises = products.map(async (product) => {
      const productDetails = await this.createProductDetails(product);
      const score = productDetails.rating * productDetails.reviewCount; // Step 3: Calculate the score
      return {
        ...productDetails,
        score
      };
    });

    const detailedProducts = await Promise.all(productDetailsPromises);
    const sortedProducts = detailedProducts.sort((a, b) => b.score - a.score);
    return sortedProducts.slice(0, 8);
  }

  async createProduct(data: {
    vendorId: number;
    name: string;
    specification: string;
    category: string;
    price: number;
    description: string | null;
    productImage: string | null;
  }): Promise<Product> {
    return prisma.product.create({ data });
  }

  async updateProduct(id: number, data: Record<string, any>): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: number): Promise<Product> {
    return prisma.product.delete({ where: { id } });
  }

  async createProductDetails(product: Product): Promise<ProductDetails> {
    const vendor = await vendorRepository.findVendorById(product.vendorId) as Vendor;
    const productRating = await itemRepository.getAverageRatingByProductId(product.id);
    const productReviewCount = await itemRepository.getReviewCountByProductId(product.id);
    return {
      id: product.id,
      vendorId: product.vendorId,
      vendorAddress: vendor.address,
      name: product.name,
      specification: product.specification,
      category: product.category,
      price: product.price,
      description: product.description,
      productImage: product.productImage,
      rating: productRating,
      reviewCount: productReviewCount
    };
  }
}

export default new ProductRepository();
