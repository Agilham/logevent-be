import request from "supertest";
import express from "express";
import authController from "../../controllers/auth.controller";

import userRepository from "../../repositories/user.repository";
import jwtUtils from "../../utils/jwt";
import nodemailerUtils from "../../utils/nodemailer";
import cloudinaryUtils from "../../utils/cloudinary";
import { hash, compare } from "bcrypt";
import middleware from "../../middleware";
import { oauth2Client, authorizationUrl } from "../../utils/oauth";
import { google } from "googleapis";

jest.mock("../src/repositories/user.repository");
jest.mock("../src/utils/jwt");
jest.mock("../src/utils/nodemailer");
jest.mock("../src/utils/cloudinary");
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
jest.mock("../src/middleware", () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 1 };
    next();
  },
}));

jest.mock("../src/utils/oauth", () => ({
  oauth2Client: {
    getToken: jest.fn(),
    setCredentials: jest.fn(),
  },
  authorizationUrl: "http://fake-auth-url.com",
}));

jest.mock("googleapis", () => ({
  google: {
    oauth2: jest.fn().mockReturnValue({
      userinfo: {
        get: jest.fn(),
      },
    }),
  },
}));

const app = express();
app.use(express.json());
app.use("/auth", authController.getRoutes());

describe("AuthController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/signup", () => {
    it("should sign up a new user", async () => {
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue("hashedPassword");
      (userRepository.createUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: "test@example.com",
      });
      (jwtUtils.sign as jest.Mock).mockReturnValue("mockToken");
      (nodemailerUtils.sendVerificationEmail as jest.Mock).mockResolvedValue(
        undefined
      );

      const res = await request(app).post("/auth/signup").send({
        email: "test@example.com",
        password: "123456",
        name: "Test",
        phone: "123",
        picture: null,
      });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe("test@example.com");
      expect(nodemailerUtils.sendVerificationEmail).toHaveBeenCalled();
    });

    it("should return 400 if user already exists", async () => {
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue({
        id: 1,
      });

      const res = await request(app)
        .post("/auth/signup")
        .send({ email: "exists@example.com", password: "123" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("User already exists");
    });
  });

  describe("POST /auth/signin", () => {
    it("should return token for valid credentials", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed",
        isVerified: true,
      };
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);
      (jwtUtils.sign as jest.Mock).mockReturnValue("token");

      const res = await request(app)
        .post("/auth/signin")
        .send({ email: "test@example.com", password: "123456" });

      expect(res.status).toBe(201);
      expect(res.body.token).toBe("token");
    });

    it("should return 401 for unverified email", async () => {
      const mockUser = { id: 1, email: "test@example.com", isVerified: false };
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/auth/signin")
        .send({ email: "test@example.com", password: "123456" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Email not verified");
    });

    it("should return 401 for invalid password", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed",
        isVerified: true,
      };
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .post("/auth/signin")
        .send({ email: "test@example.com", password: "wrongpass" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid password");
    });

    it("should return 404 for non-existent user", async () => {
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/auth/signin")
        .send({ email: "notfound@example.com", password: "123" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  describe("POST /auth/reset-password", () => {
    it("should send reset email if user exists", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (jwtUtils.sign as jest.Mock).mockReturnValue("token");
      (nodemailerUtils.sendPasswordResetEmail as jest.Mock).mockResolvedValue(
        undefined
      );

      const res = await request(app)
        .post("/auth/reset-password")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Reset password email sent");
    });

    it("should return 404 if user not found", async () => {
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/auth/reset-password")
        .send({ email: "missing@example.com" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  // Additional test stubs you can extend:
  describe("GET /auth/read", () => {
    it("should return list of users", async () => {
      (userRepository.findAllUsers as jest.Mock).mockResolvedValue([
        { id: 1, email: "a@b.com" },
      ]);

      const res = await request(app).get("/auth/read");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1, email: "a@b.com" }]);
    });
  });

  describe("GET /auth/profile", () => {
    it("should return user profile", async () => {
      (userRepository.findUserById as jest.Mock).mockResolvedValue({
        id: 1,
        name: "User",
      });

      const res = await request(app).get("/auth/profile");

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("User");
    });

    it("should return 404 if user not found", async () => {
      (userRepository.findUserById as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/auth/profile");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  describe("GET /auth/verify", () => {
    it("should verify the user email", async () => {
      (userRepository.findUserById as jest.Mock).mockResolvedValue({ id: 1 });
      (userRepository.updateUser as jest.Mock).mockResolvedValue({
        id: 1,
        isVerified: true,
      });

      const res = await request(app).get("/auth/verify");

      expect(res.status).toBe(200);
      expect(res.body.isVerified).toBe(true);
    });

    it("should return 404 if user not found", async () => {
      (userRepository.findUserById as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/auth/verify");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  describe("PUT /auth/update", () => {
    it("should update user info", async () => {
      const oldUser = {
        id: 1,
        name: "Old",
        email: "old@example.com",
        password: "oldpass",
        phone: "0000",
        picture: "old-url",
        isAdmin: false,
        isVerified: false,
      };

      const updatedUser = { ...oldUser, name: "New", email: "new@example.com" };

      (userRepository.findUserById as jest.Mock).mockResolvedValue(oldUser);
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (cloudinaryUtils.uploadFile as jest.Mock).mockResolvedValue("new-url");
      (cloudinaryUtils.deleteFile as jest.Mock).mockResolvedValue(undefined);
      (hash as jest.Mock).mockResolvedValue("hashedpass");
      (userRepository.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      const res = await request(app)
        .put("/auth/update")
        .send({ name: "New", email: "new@example.com", password: "123" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("New");
    });

    it("should return 400 if email already used by another user", async () => {
      const user = { id: 1, email: "a@example.com" };
      const otherUser = { id: 2, email: "a@example.com" };

      (userRepository.findUserById as jest.Mock).mockResolvedValue(user);
      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(
        otherUser
      );

      const res = await request(app)
        .put("/auth/update")
        .send({ email: "a@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email already in use");
    });
  });

  describe("GET /auth/google", () => {
    it("should redirect to Google authorization URL", async () => {
      const res = await request(app).get("/auth/google");

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe("http://fake-auth-url.com");
    });
  });

  describe("GET /auth/google/callback", () => {
    it("should redirect to Google callback URL if user is verified", async () => {
      const token = { access_token: "fake-token" };
      const userData = { email: "user@example.com", name: "Test User" };

      (oauth2Client.getToken as jest.Mock).mockResolvedValue({ tokens: token });
      (google.oauth2 as jest.Mock).mockReturnValue({
        userinfo: {
          get: jest.fn().mockResolvedValue({ data: userData }),
        },
      });

      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: "user@example.com",
        isVerified: true,
      });

      (jwtUtils.sign as jest.Mock).mockReturnValue("mockToken");

      const res = await request(app).get(
        "/auth/google/callback?code=fake-code"
      );

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(
        `${process.env.REACT_APP_URL}/google-callback?token=mockToken`
      );
    });

    it("should redirect to signup if user is not verified", async () => {
      const token = { access_token: "fake-token" };
      const userData = { email: "new@example.com", name: "New User" };

      (oauth2Client.getToken as jest.Mock).mockResolvedValue({ tokens: token });
      (google.oauth2 as jest.Mock).mockReturnValue({
        userinfo: {
          get: jest.fn().mockResolvedValue({ data: userData }),
        },
      });

      (userRepository.findUserByEmail as jest.Mock).mockResolvedValue({
        id: 2,
        email: "new@example.com",
        isVerified: false,
      });

      (jwtUtils.sign as jest.Mock).mockReturnValue("mockToken");

      const res = await request(app).get("/auth/google/callback?code=xyz");

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(
        `${process.env.REACT_APP_URL}/signup?token=mockToken`
      );
    });

    it("should return 401 if missing email or name", async () => {
      (oauth2Client.getToken as jest.Mock).mockResolvedValue({ tokens: {} });
      (google.oauth2 as jest.Mock).mockReturnValue({
        userinfo: {
          get: jest
            .fn()
            .mockResolvedValue({ data: { email: null, name: null } }),
        },
      });

      const res = await request(app).get("/auth/google/callback?code=test");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });
  });
});
