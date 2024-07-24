// src/repositories/category.repository.ts

// dependency modules
import { Category } from "@prisma/client";
// self-defined modules
import prisma from "../utils/prisma";

class CategoryRepository {
  async findAllCategories(): Promise<Category[]> {
    return prisma.category.findMany();
  }

  async findCategoryById(id: number): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async createCategory(data: {
    name: string;
    type: string;
  }): Promise<Category> {
    return prisma.category.create({ data });
  }

  async updateCategory(id: number, data: Record<string, any>): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: number): Promise<Category> {
    return prisma.category.delete({ where: { id } });
  }
}

export default new CategoryRepository();
