import { createWorker } from './workerManager.js';
import { prisma } from '../../utilities/import.config.js';

createWorker('appQueue', async job => {
    const { module, operation, payload } = job.data;

    switch (module) {
        case 'product':
            if (operation === 'create') {
                console.log("📦 Creating Product:", payload);
                const product = await prisma.product.create({
                    data: { ...payload }
                });
                console.log("✅ Product created successfully");
                return { status: 'success', data: product };

            } else if (operation === 'update') {
                console.log("✏️ Updating Product:", payload);
                const updatedProduct = await prisma.product.update({
                    where: { product_code: payload.product_code },
                    data: {
                        name: payload.name,
                        category: payload.category,
                        combination: payload.combination,
                        product_mrp: payload.product_mrp,
                        product_price: payload.product_price,
                        last_purchase_price: payload.last_purchase_price,
                        unit_of_measure: payload.unit_of_measure,
                        hsn_code: payload.hsn_code,
                        description: payload.description,
                        gst_percentage: payload.gst_percentage,
                        status: payload.status,
                    },
                });
                return { status: 'success', data: updatedProduct };

            } else if (operation === 'delete') {
                console.log("🗑️ Deleting Product:", payload);
                const product = await prisma.product.update({
                    where: { product_code: payload.product_code },
                    data: { deleted_at: new Date() },
                });
                return { status: 'success', data: product };
            }
            break;

        case 'vendor':
            if (operation === 'create') {
                console.log("🏢 Creating Vendor:", payload);
                const vendor = await prisma.vendor.create({
                    data: { ...payload }
                });
                return { status: 'success', data: vendor };

            } else if (operation === 'update') {
                console.log("✏️ Updating Vendor:", payload);
                const updatedVendor = await prisma.vendor.update({
                    where: { vendor_code: payload.vendor_code },
                    data: { ...payload },
                });
                return { status: 'success', data: updatedVendor };

            } else if (operation === 'delete') {
                console.log("🗑️ Deleting Vendor:", payload);
                const deletevendor = await prisma.vendor.update({
                    where: { vendor_code: payload.vendor_code },
                    data: { deleted_at: new Date() },
                });
                return { status: 'success', data: deletevendor };
            }
            break;

        case 'salesOrder':
            if (operation === 'create') {
                console.log("🛒 Creating Sales Order:", payload);
                const order = await prisma.salesOrder.create({
                    data: { ...payload }
                });
                return { status: 'success', data: order };

            } else if (operation === 'update') {
                console.log("✏️ Updating Sales Order:", payload);
                const order = await prisma.salesOrder.update({
                    where: { id: payload.id },
                    data: { ...payload }
                });
                return { status: 'success', data: order };

            } else if (operation === 'delete') {
                console.log("🗑️ Deleting Sales Order:", payload);
                const order = await prisma.salesOrder.delete({
                    where: { id: payload.id }
                });
                return { status: 'success', data: order };
            }
            break;

        default:
            console.warn(`⚠️ Unknown module: ${module}`);
            return { status: 'error', message: 'Unknown module' };
    }
});
