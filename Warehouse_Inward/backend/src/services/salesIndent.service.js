import { getSalesOrderByIdService } from './salesOrder.service.js'
import { indentLogger } from '../utilities/logger.js'
import { STATUS } from '../utilities/constant.js'
import { SalesIndentRepository } from '../repository/salesIndent.repository.js'

const indentRepo = new SalesIndentRepository()

export const getFlattenedSalesIndentByIdService = async (id) => {
  const salesIndentData = await indentRepo.findIndentById(id, {
    indent_number: true,
    product_id: true,
    total_sales_order: true,
    total_remain_product: true,
    status: true,
    sale_order_IDs: true,
    created_at: true
  })

  if (!salesIndentData) {
    indentLogger.error(`Sales Indent not found for ID: ${id}`)
    throw new Error(`Sales Indent not found for ID: ${id}`)
  }

  const flattenedRows = []

  await Promise.all(
    salesIndentData.sale_order_IDs.map(async (orderId) => {
      const order = await getSalesOrderByIdService(orderId)

      const remainingFiltered =
        salesIndentData.status === STATUS.CLOSED
          ? order.products
          : order.products.filter((p) => p.remaining_qty > 0)

      const productFiltered = remainingFiltered.filter(
        (p) => String(p.product_id) === String(salesIndentData.product_id)
      )


      productFiltered.forEach((prod) => {
        flattenedRows.push({
          indent_number: salesIndentData.indent_number,
          indent_status: salesIndentData.status,
          indent_created_at: salesIndentData.created_at,
          sales_order_number: order.sales_order_number,
          order_type: order.order_type,
          address: order.address,
          contact_number: order.contact_number,
          email: order.email,
          payment_status: order.payment_status,
          delivery_status: order.delivery_status,
          processed_date: order.processed_date,
          total_order_qty: order.total_order_qty,
          total_amount: order.total_amount,
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
        })
      })
    })
  )

  return {
    indent_number: salesIndentData.indent_number,
    total_sales_order: salesIndentData.total_sales_order,
    total_remain_product: salesIndentData.total_remain_product,
    status: salesIndentData.status,
    created_at: salesIndentData.created_at,
    items: flattenedRows
  }
}
