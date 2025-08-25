import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createVendor = async (req, res) => {
    const { name, email, contact_person,contact_number, gst_number,address,status } = req.body;
    console.log(req.body);
    
        const vendor_code = `vc${Date.now()}`;
    try {
        const newVendor = await prisma.vendor.create({
        data: {
            name,
            vendor_code,
            email,
            address,
            contact_number: contact_number,
            contact_person,
            gst_number,
            status:status.toLowerCase()
        },
        });
        res.status(201).json(newVendor);
    } catch (error) {
        console.error("Error creating vendor:", error);
        res.status(500).json({ error: "Failed to create vendor" });
    }
}

export const getAllVendors = async (req, res) => {
    try {
        const vendors = await prisma.vendor.findMany({
            orderBy: {
                createdAt: 'desc',
            }
        });
        res.status(200).json(vendors);
    } catch (error) {
        console.error("Error fetching vendors:", error);
        res.status(500).json({ error: "Failed to fetch vendors" });
    }
}

export const getVendoreSearch = async (req, res) => {
  try {
    const { q } = req.params;
    
    const vendors = await prisma.vendor.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive"
        },
        status:"active"
      },
      select: {
        vendor_code: true,
        name: true
      },
      take: 10
    });
    console.log(vendors);
    
    res.json(vendors);
  } catch (err) {
    console.error("Vendor search error:", err);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
}

export const updateVendor = async (req, res) => {
    const formData  = req.body;

    console.log(formData.status);

    try {
        const updatedVendor = await prisma.vendor.update({
            where: { vendor_code:formData.vendor_code },
            data: { 
                name: formData.name,
                email: formData.email,
                contact_person: formData.contact_person,
                contact_number: formData.contact_number,
                gst_number: formData.gst_number,
                address: formData.address,
                status: formData.status
             },
        });
        console.log(updatedVendor);
        
        res.status(200).json(updatedVendor);
    } catch (error) {
        console.error("Error updating vendor status:", error);
        res.status(500).json({ error: "Failed to update vendor status" });
    }
}

export const deleteVendor = async (req, res) => {
    const { vendor_code } = req.body;
    try {
        await prisma.vendor.delete({
            where: { vendor_code },
        });
        res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (error) {
        console.error("Error deleting vendor:", error);
        res.status(500).json({ error: "Failed to delete vendor" });
    }
}