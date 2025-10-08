import cron from 'node-cron'

import { buildGlobalVendorMap, buildProductToVendorMap, createPurchaseIndentOperations, createSalesIndentCloseOperations, executeTransactionAndLog, extractUniqueSalesOrderIds, fetchOpenSalesIndents, fetchSalesOrderProducts } from '../helper/purchaseIndent.helper.js'

cron.schedule('* * * * *', async () => {
  console.log('Starting indent expiry cron job at:', new Date())
  await createPurchaseIndents();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
})

async function createPurchaseIndents() {
  try {
    const openSalesIndents = await fetchOpenSalesIndents()

    if (!openSalesIndents.length) {
      console.log("No OPEN SalesIndents found.")
      return
    }

    const allSalesOrderIds = extractUniqueSalesOrderIds(openSalesIndents)

    const allSalesOrderProducts = await fetchSalesOrderProducts(allSalesOrderIds)

    const allProductIds = [
      ...new Set(allSalesOrderProducts.map((p) => p.product_id)),
    ]

    const productToVendor = await buildProductToVendorMap(allProductIds)

    const globalVendorMap = buildGlobalVendorMap(openSalesIndents, allSalesOrderProducts, productToVendor)

    console.log("Global VendorMap:", globalVendorMap)

    const purchaseIndentOps = createPurchaseIndentOperations(globalVendorMap)
    const salesIndentCloseOps = createSalesIndentCloseOperations(openSalesIndents)

    const allTransactions = [...purchaseIndentOps, ...salesIndentCloseOps]

    await executeTransactionAndLog(allTransactions, globalVendorMap, openSalesIndents)

  } catch (err) {
    console.error("Error creating PurchaseIndents:", err)
    throw err
  }
}