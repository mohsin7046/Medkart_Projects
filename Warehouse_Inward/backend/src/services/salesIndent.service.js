import { prisma } from '../utilities/import.config.js'
import { getSalesOrderByIdService } from './salesOrder.service.js';
import { indentLogger } from '../utilities/logger.js';

export const getSalesIndentByIdService = async (id) => {

    const salesIndentData = await prisma.salesIndent.findUnique({
        where: { id: parseInt(id) },
        select: {
            indent_number: true,
            total_sales_order: true,
            total_remain_product: true,
            status: true,
            sale_order_IDs: true
        }
    });

    if (!salesIndentData) {
        indentLogger.error(`Sales Order not found for ID: ${id}`)
        throw new Error(`Sales Order not found for ID: ${id}`);
    }

    const salesOrders = await Promise.all(
        salesIndentData.sale_order_IDs.map((orderId) =>
            getSalesOrderByIdService(orderId)
        )
    );
    const result = {
        indent_number: salesIndentData.indent_number,
        total_sales_order: salesIndentData.total_sales_order,
        total_remain_product: salesIndentData.total_remain_product,
        status: salesIndentData.status,
        sales_orders: salesOrders,
    };

    return result;
}