import express from "express";
import request from "supertest";
import visitController from "../../controllers/visit.controller";
import visitRepository from "../../repositories/visit.repository";

const app = express();
app.use(express.json());
app.use("/visits", visitController.getRoutes());

jest.mock("../repositories/visit.repository");

describe("VisitController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /visits/read", () => {
    it("should return all visits", async () => {
      const visits = [
        { id: 1, ipAddress: "123.89.46.72" },
        { id: 2, ipAddress: "172.168.10.1" },
      ];
      (visitRepository.findAllVisits as jest.Mock).mockResolvedValue(visits);

      const res = await request(app).get("/visits/read");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(visits);
    });
  });

  it("should handle errors", async () => {
    (visitRepository.findAllVisits as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    const res = await request(app).get("/visits/read");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "DB error" });
  });
});
