import { User } from "@prisma/client";
import prisma from "../utils/prisma";

class UserRepository {
  async findAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async findUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
  
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: {
    email: string;
    password: string | null;
    name: string | null;
    phone: string | null;
    picture: string | null;
  }): Promise<User> {
    return prisma.user.create({data})
  }

  async updateUser(id: number, data: Record<string, any> ): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
}

export default new UserRepository();
