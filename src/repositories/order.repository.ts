// src/repositories/order.repository.ts

// dependency modules
import { Order } from "@prisma/client";
import { toZonedTime, format } from 'date-fns-tz';
// self-defined modules
import prisma from "../utils/prisma";
import { OrderDetail } from "../utils/types";

class OrderRepository {
  async findAllOrders(): Promise<Order[]> {
    return prisma.order.findMany();
  }

  async findAllOrderDetails(): Promise<OrderDetail[]> {
    const orders = await prisma.order.findMany();
    return Promise.all(orders.map((order) => this.createOrderDetail(order)));
  }

  async findOrdersByUserId(userId: number): Promise<Order[]> {
    const carts = await prisma.cart.findMany({ where: { userId } });
    return prisma.order.findMany({ where: { cartId: { in: carts.map((cart) => cart.id) } } });
  }

  async findOrderDetailsByUserId(userId: number): Promise<OrderDetail[]> {
    const carts = await prisma.cart.findMany({ where: { userId } });
    const orders = await prisma.order.findMany({ where: { cartId: { in: carts.map((cart) => cart.id) } } });
    return Promise.all(orders.map((order) => this.createOrderDetail(order)));
  }

  async findPastTwoMonthOrderDetails(chosenDate: Date): Promise<OrderDetail[]> {
    const orders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: new Date(chosenDate.getTime() - 60 * 24 * 60 * 60 * 1000),
        },
      },
    });
    return Promise.all(orders.map((order) => this.createOrderDetail(order)));
  }

  async findOrderById(id: number): Promise<Order | null> {
    return prisma.order.findUnique({ where: { id } });
  }

  async findOrderAvailabilityByCartId(cartId: number): Promise<string[]> {
    const cart = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) {
      throw new Error("Cart not found");
    }

    const productIds = await this.getProductIdsFromCart(cart);

    const upcomingOrders = await prisma.order.findMany({
      where: {
        endDate: {
          gte: new Date(),
        },
        orderStatus: {
          not: 'Cancelled',
        },
      },
      include: {
        cart: {
          include: { items: true },
        },
      },
    });

    const bookedDates = await this.getBookedDatesFromOrders(upcomingOrders, productIds);

    return Array.from(bookedDates);
  }

  private async getProductIdsFromCart(cart: any): Promise<Set<number>> {
    const productIds: Set<number> = new Set();
    if (cart.type === 'Event') {
      const items = await prisma.item.findMany({
        where: { cartId: cart.id, eventId: { not: null } },
        include: { event: true },
      });
      for (const item of items) {
        if (item.eventId) {
          const bundles = await prisma.bundle.findMany({ where: { eventId: item.eventId } });
          bundles.forEach(bundle => productIds.add(bundle.productId));
        }
      }
    } else if (cart.type === 'Product' || cart.type === 'Event Organizer') {
      const items = await prisma.item.findMany({
        where: { cartId: cart.id, productId: { not: null } },
        include: { product: true },
      });
      for (const item of items) {
        if (item.productId) {
          productIds.add(item.productId);
        }
      }
    }
    return productIds;
  }

  private async getBundleProductIds(eventId: number): Promise<Set<number>> {
    const bundles = await prisma.bundle.findMany({ where: { eventId } });
    return new Set(bundles.map(bundle => bundle.productId));
  }

  private async getBookedDatesFromOrders(upcomingOrders: any[], productIds: Set<number>): Promise<Set<string>> {
    const bookedDates: Set<string> = new Set();
    for (const order of upcomingOrders) {
      for (const orderItem of order.cart.items) {
        let bundleProductIds = new Set<number>();
        if (orderItem.eventId) {
          bundleProductIds = await this.getBundleProductIds(orderItem.eventId);
        }

        if (
          (orderItem.productId && productIds.has(orderItem.productId)) ||
          [...bundleProductIds].some(id => productIds.has(id))
        ) {
          this.addBookedDates(bookedDates, order.startDate, order.endDate);
        }
      }
    }
    return bookedDates;
  }

  private addBookedDates(bookedDates: Set<string>, startDate: Date, endDate: Date) {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      bookedDates.add(format(toZonedTime(currentDate, 'Asia/Jakarta'), 'yyyy-MM-dd'));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  async findOrderDetailById(id: number): Promise<OrderDetail | null> {
    const order = await prisma.order.findUnique({ where: { id } });
    return order ? this.createOrderDetail(order) : null;
  }

  async createOrder(data: {
    cartId: number;
    name: string;
    phone: string;
    address: string;
    notes: string | null;
    startDate: Date;
    endDate: Date;
    orderTotal: number;
  }): Promise<Order> {
    return prisma.order.create({ data });
  }

  async updateOrder(id: number, data: Record<string, any>): Promise<Order> {
    return prisma.order.update({ where: { id }, data });
  }

  async deleteOrder(id: number): Promise<Order> {
    return prisma.order.delete({ where: { id } });
  }

  async createOrderDetail(order: Order): Promise<OrderDetail> {
    const cart = await prisma.cart.findUnique({ where: { id: order.cartId } });
    if (!cart) {
      throw new Error("Cart not found");
    }

    const user = await prisma.user.findUnique({ where: { id: cart.userId } });
    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: order.id,
      cartId: order.cartId,
      cartType: cart.type,
      userId: cart.userId,
      userEmail: user.email,
      userName: user.name,
      userPhone: user.phone,
      name: order.name,
      phone: order.phone,
      address: order.address,
      notes: order.notes,
      startDate: order.startDate,
      endDate: order.endDate,
      orderDate: order.orderDate,
      orderStatus: order.orderStatus,
      orderTotal: order.orderTotal,
    };
  }

  async calculateOrderTotal(cartId: number, startDate: Date, endDate: Date): Promise<number> {
    const orderRange = 1 + Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const items = await prisma.item.findMany({ where: { cartId } });

    let orderTotal = 0;
    for (const item of items) {
      if (item.eventId) {
        orderTotal += await this.calculateEventItemTotal(item, orderRange);
      } else if (item.productId) {
        orderTotal += await this.calculateProductItemTotal(item, orderRange);
      }
    }

    return Math.ceil(orderTotal);
  }

  private async calculateEventItemTotal(item: any, orderRange: number): Promise<number> {
    const event = await prisma.event.findUnique({
      where: { id: item.eventId },
      include: { category: true },
    });
    if (!event) return 0;
    const feeMultiplier = 1 + (event.category.fee / 100);
    return event.price * orderRange * feeMultiplier;
  }

  private async calculateProductItemTotal(item: any, orderRange: number): Promise<number> {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { category: true },
    });
    if (!product) return 0;
    const feeMultiplier = 1 + (product.category.fee / 100);
    if (item.duration) {
      return product.price * item.duration * feeMultiplier;
    } else if (item.quantity) {
      return product.price * item.quantity * feeMultiplier;
    } else {
      return product.price * orderRange * feeMultiplier;
    }
  }
}

export default new OrderRepository();
