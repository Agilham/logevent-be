// src/repositories/product.repository.ts

// dependency modules
import { Category, Product, Vendor } from "@prisma/client";
// self-defined modules
import categoryRepository from "./category.repository";
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
    return product ? this.createProductDetails(product) : null;
  }

  async findProductsByVendorId(vendorId: number): Promise<Product[]> {
    return prisma.product.findMany({ where: { vendorId } });
  }

  async findTopProducts(): Promise<ProductDetails[]> {
    const products = await prisma.product.findMany();
    const productDetailsPromises = products.map(async (product) => {
      const productDetails = await this.createProductDetails(product);
      const score = productDetails.rating * productDetails.reviewCount;
      return {
        ...productDetails,
        score
      };
    });

    const detailedProducts = await Promise.all(productDetailsPromises);
    const filteredProducts = detailedProducts.filter(product => product.rating > 4.0);
    const sortedProducts = filteredProducts.sort((a, b) => b.score - a.score);
    return sortedProducts.slice(0, 8);
  }
  

  async createProduct(data: {
    vendorId: number;
    categoryId: number;
    name: string;
    specification: string;
    rate: string;
    price: number;
    capacity: number | null;
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
    const category = await categoryRepository.findCategoryById(product.categoryId) as Category;
    const productRating = await itemRepository.getAverageRatingByProductId(product.id);
    const productReviewCount = await itemRepository.getReviewCountByProductId(product.id);
    return {
      id: product.id,
      vendorId: product.vendorId,
      vendorPhone: vendor.phone,
      vendorAddress: vendor.address,
      categoryId: product.categoryId,
      categoryName: category.name,
      name: product.name,
      specification: product.specification,
      price: product.price,
      description: product.description,
      productImage: product.productImage,
      rating: productRating,
      reviewCount: productReviewCount
    };
  }
}

export default new ProductRepository();
