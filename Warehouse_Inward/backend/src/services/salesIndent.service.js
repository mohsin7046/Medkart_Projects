import { getSalesOrderByIdService } from './salesOrder.service.js';
import { indentLogger } from '../utilities/logger.js';
import { STATUS } from '../utilities/constant.js';
import { SalesIndentRepository } from '../repository/salesIndent.repository.js';

const indentRepo = new SalesIndentRepository();

export const getSalesIndentByIdService = async (id) => {

    const salesIndentData = await indentRepo.findIndentById(id, {
            indent_number: true,
            total_sales_order: true,
            total_remain_product: true,
            status: true,
            sale_order_IDs: true,
            created_at:true
        });

    if (!salesIndentData) {
        indentLogger.error(`Sales Order not found for ID: ${id}`)
        throw new Error(`Sales Order not found for ID: ${id}`);
    }

    const salesOrders = await Promise.all(
        salesIndentData.sale_order_IDs.map(async (orderId) => {
            const order = await getSalesOrderByIdService(orderId);
           
            const filteredProducts = salesIndentData.status === STATUS.CLOSED
                ? order.products
                : order.products.filter(p => p.remaining_qty > 0);

            return { ...order, products: filteredProducts };
        })
    );

    return {
        indent_number: salesIndentData.indent_number,
        total_sales_order: salesIndentData.total_sales_order,
        total_remain_product: salesIndentData.total_remain_product,
        status: salesIndentData.status,
        created_at: salesIndentData.created_at,
        sales_orders: salesOrders,
    };
}