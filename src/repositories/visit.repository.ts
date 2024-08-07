// src/repositories/visit.repository.ts

// dependency modules
import { Visit } from "@prisma/client";
// self-defined modules
import prisma from "../utils/prisma";

class VisitRepository {
  async findAllVisits(): Promise<Visit[]> {
    return prisma.visit.findMany();
  }

  async findPastWeekVisits(chosenDate: Date): Promise<Visit[]> {  
    const today = new Date(chosenDate.getFullYear(), chosenDate.getMonth(), chosenDate.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    return prisma.visit.findMany({
      where: {
        visitDate: {
          gte: new Date(tomorrow.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
  }

  async createVisit(data: {
    ipAddress: string | null;
  }): Promise<Visit> {
    return prisma.visit.create({ data });
  }
}

export default new VisitRepository();
