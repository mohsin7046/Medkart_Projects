import { STATUS } from '../utilities/constant.js';
import { prisma } from '../utilities/import.config.js';
import { saleLogger } from '../utilities/logger.js';

export class SalesOrderRepository {
  async createSalesOrder(data) {
    try {
      return await prisma.salesOrder.create({ data });
    } catch (error) {
      saleLogger.error(`Failed to create SalesOrder | ${error.message}`);
      throw error;
    }
  }

  async updateSalesOrder(id, data) {
    try {
      return await prisma.salesOrder.update({
        where: { id },
        data,
      });
    } catch (error) {
      saleLogger.error(`Failed to update SalesOrder | ID: ${id} | ${error.message}`);
      throw error;
    }
  }

  async updateSalesOrderProducts(sales_order_id, data) {
    try {
      return await prisma.salesOrderProduct.updateMany({
        where: { sales_order_id },
        data,
      });
    } catch (error) {
      saleLogger.error(`Failed to update SalesOrder | ID: ${sales_order_id} | ${error.message}`);
      throw error;
    }
  }

  async findSalesOrderById(id, select = undefined, include = undefined) {
    try {
      return await prisma.salesOrder.findUnique({
        where: { id: parseInt(id) },
        select,
        include,
      });
    } catch (error) {
      saleLogger.error(`Failed to fetch SalesOrder by ID: ${id} | ${error.message}`);
      throw error;
    }
  }

  async findManySalesOrders(where = {}, include = undefined) {
    try {
      return await prisma.salesOrder.findMany({ where, include });
    } catch (error) {
      saleLogger.error(`Failed to fetch SalesOrders | ${error.message}`);
      throw error;
    }
  }

  async softDeleteSalesOrder(id) {
    try {
      return await prisma.salesOrder.update({
        where: { id},
            data: { deleted_at: new Date(), status: STATUS.CANCELLED },
      });
    } catch (error) {
      saleLogger.error(`Failed to soft delete SalesOrder ID: ${id} | ${error.message}`);
      throw error;
    }
  }

  async softDeleteSalesOrderProducts(sales_order_id) {
    try {
      return await prisma.salesOrderProduct.updateMany({
        where: { sales_order_id },
        data: { deleted_at: new Date() },
      });
    } catch (error) {
      saleLogger.error(`Failed to soft delete SalesOrder products | ${error.message}`);
      throw error;
    }
  }

  async updateSalesOrderProduct(id, data) {
    try {
      return await prisma.salesOrderProduct.update({
        where: { id },
        data,
      });
    } catch (error) {
      saleLogger.error(`Failed to update SalesOrderProduct ID: ${id} | ${error.message}`);
      throw error;
    }
  }

  async getSalesOrderById(id) {
    try {
      return await prisma.salesOrder.findUnique({
        where: { id: parseInt(id) },
        select: {
            sales_order_number: true,
            name: true,
            email: true,
            contact_number: true,
            address: true,
            order_type: true,
            priority: true,
            processed_date: true,
            delivery_date: true,
            status: true,
            processed: true,
            payment_status: true,
            delivery_status: true,
            totalOrderQty: true,
            total_amount: true,
            products: {
                select: {
                    ordered_qty: true,
                    allocated_qty: true,
                    remaining_qty: true,
                    updated_at: true,
                    totalAmount: true,
                    product: {
                        select: {
                            name: true,
                            category: true,
                            combination: true,
                            product_mrp: true,
                            product_price: true,
                            description: true,
                            hsn_code: true,
                            gst_percentage: true,
                            status: true
                        }
                    },
                    vendor: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });
    } catch (error) {
      saleLogger.error(`Failed to fetch SalesOrder by ID: ${id} | ${error.message}`);
      throw error;
    }
  }

  async getSalesOrderForEditById(id) {
    try {
      return await prisma.salesOrder.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                name: true,
                email: true,
                contact_number: true,
                address: true,
                order_type: true,
                products: {
                    select: {
                        product_id: true,
                        vendor_id: true,
                        ordered_qty: true,
                        product: {
                            select: {
                                name: true,
                                product_mrp: true,
                                product_price: true
                            }
                        }
                    }
                }
            }
        })
    } catch (error) {
      saleLogger.error(`Failed to fetch SalesOrder for edit by ID: ${id} | ${error.message}`);
      throw error;
    }
  }

  async runTransaction(operations) {
    try {
      return await prisma.$transaction(operations);
    } catch (error) {
      saleLogger.error(`Transaction failed | ${error.message}`);
      throw error;
    }
  }

  async findProductsInSalesOrders(orderIds) {
    try {
      return await prisma.salesOrder.findMany({
        where: { id: { in: orderIds } },
        include: { products: { include: { product: true } } }
    })
    }
    catch (error) {
      saleLogger.error(`Failed to find products in SalesOrders for Product ID: ${productId} | ${error.message}`);
      throw error;
    }
  }
};
