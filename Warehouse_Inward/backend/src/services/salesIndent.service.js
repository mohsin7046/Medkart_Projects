import { getSalesOrderByIdService } from './salesOrder.service.js'
import { indentLogger } from '../utilities/logger.js'
import { STATUS } from '../utilities/constant.js'
import { SalesIndentRepository } from '../repository/salesIndent.repository.js'

const indentRepo = new SalesIndentRepository()

export const getFlattenedSalesIndentByIdService = async (id) => {

  const salesIndentDataOptimized = await indentRepo.findIndentById({
    id,
    select: {
      indent_number: true,
      product_id: true,
      total_sales_order: true,
      total_remain_product: true,
      status: true,
      created_at: true,
      salesOrders: {
        select: {
          sales_order_id: true,
          salesOrder: {
            select: {
              sales_order_number: true,
              order_type: true,
              address: true,
              payment_status: true,
              delivery_status: true,
              processed_date: true,
              status: true,
              products: {
                select: {
                  ordered_qty: true,
                  allocated_qty: true,
                  remaining_qty: true,
                  product: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                      combination: true,
                      product_price: true,
                      product_mrp: true
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
          }
        }
      }
    }
  });

  // console.log(salesIndentDataOptimized.salesOrders[0].salesOrder);
  
  if (!salesIndentDataOptimized) {
    indentLogger.error(`Sales Indent not found for ID: ${id}`);
    throw new Error(`Sales Indent not found for ID: ${id}`);
  }

  const flattenedRows = [];

  salesIndentDataOptimized.salesOrders.forEach((indentSO) => {
    const order = indentSO.salesOrder;

    const relevantProducts = order.products.filter((p) => {
      const matchesProduct = p.product.id === salesIndentDataOptimized.product_id;
      const hasRemainingQty =  p.remaining_qty > 0;
      console.log(`Product ${p.product_id}: matchesProduct=${matchesProduct}, hasRemainingQty=${hasRemainingQty}`);
      return matchesProduct && hasRemainingQty;
    });

    console.log("Relevant products:", relevantProducts);

    relevantProducts.forEach((prod) => {
      flattenedRows.push({
        indent_number: salesIndentDataOptimized.indent_number,
        indent_status: salesIndentDataOptimized.status,
        indent_created_at: salesIndentDataOptimized.created_at,
        sales_order_number: order.sales_order_number,
        order_type: order.order_type,
        address: order.address,
        payment_status: order.payment_status,
        delivery_status: order.delivery_status,
        processed_date: order.processed_date,
        order_status: order.status,
        ordered_qty: prod.ordered_qty,
        allocated_qty: prod.allocated_qty,
        remaining_qty: prod.remaining_qty,
        product_name: prod.product.name,
        product_category: prod.product.category,
        product_combination: prod.product.combination,
        product_price: prod.product.product_price,
        product_mrp: prod.product.product_mrp,
        vendor_name: prod.vendor?.name || null
      });
    });
  });

  return {
    indent_number: salesIndentDataOptimized.indent_number,
    total_sales_order: salesIndentDataOptimized.total_sales_order,
    total_remain_product: salesIndentDataOptimized.total_remain_product,
    status: salesIndentDataOptimized.status,
    created_at: salesIndentDataOptimized.created_at,
    items: flattenedRows
  };
};
