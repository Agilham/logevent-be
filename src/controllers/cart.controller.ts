// src/controllers/cart.controller.ts

// dependency modules
import { Request, Response, Router } from "express";
// self-defined modules
import cartRepository from "../repositories/cart.repository";

class CartController {
  async readAllCarts(req: Request, res: Response) {
    try {
      const carts = await cartRepository.findAllCarts();
      res.status(200).json(carts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async readCartsByUserId(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);
      const cart = await cartRepository.findCartsByUserId(userId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      res.status(200).json(cart);
    }
    catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async readActiveEventCartByUserId(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);
      const cart = await cartRepository.findActiveEventCartByUserId(userId);
      if (!cart) {
        return res.status(404).json({ message: "Active Event Cart not found" });
      }

      res.status(200).json(cart);
    }
    catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async readActiveProductCartByUserId(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);
      const cart = await cartRepository.findActiveProductCartByUserId(userId);
      if (!cart) {
        return res.status(404).json({ message: "Active Product Cart not found" });
      }

      res.status(200).json(cart);
    }
    catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async readActiveEventOrganizerCartByUserId(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);
      const cart = await cartRepository.findActiveEventOrganizerCartByUserId(userId);
      if (!cart) {
        return res.status(404).json({ message: "Active Event Organizer Cart not found" });
      }

      res.status(200).json(cart);
    }
    catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async readCartById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const cart = await cartRepository.findCartById(id);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      res.status(200).json(cart);
    }
    catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async createCart(req: Request, res: Response) {
    try {
      const { userId, type } = req.body;
      const newCart = await cartRepository.createCart({
        userId,
        type
      });

      res.status(201).json(newCart);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateCart(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const cart = await cartRepository.findCartById(id);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const { userId, type, cartDate, cartStatus } = req.body;
      const updatedCart = await cartRepository.updateCart(id, {
        userId: userId || cart.userId,
        type: type || cart.type,
        cartDate: cartDate || cart.cartDate,
        cartStatus: cartStatus || cart.cartStatus
      });

      res.status(200).json(updatedCart);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteCart(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const cart = await cartRepository.findCartById(id);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      await cartRepository.deleteCart(id);
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  getRoutes() {
    return Router()
      .get("/read", this.readAllCarts)
      .get("/read/user/:userId", this.readCartsByUserId)
      .get("/read/event/:userId", this.readActiveEventCartByUserId)
      .get("/read/product/:userId", this.readActiveProductCartByUserId)
      .get("/read/event-organizer/:userId", this.readActiveEventOrganizerCartByUserId)
      .get("/read/:id", this.readCartById)
      .post("/create", this.createCart)
      .put("/update/:id", this.updateCart)
      .delete("/delete/:id", this.deleteCart);
  }
}

export default new CartController();
