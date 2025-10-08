import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { InputField } from "../../resuableComponent/Inputfeild.jsx";
import { Button } from "../../resuableComponent/Button.jsx";
import { SearchSelect } from "../utility/SearchSelect.jsx";

function GatePassForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    gate_pass_id:"",
    gate_pass_number: "",
    vendor_id: "",
    vendor_name:"",
    inward_type: "",
    invoice_date: "",
    invoice_amount: "",
    no_of_boxes: "",
  });


  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${ALLEndpoint.GatePassEndpoints.getGatePassById.endpoint}/${id}`);
        const { data } = await res.json();
        setFormData({
          gate_pass_number: data.gate_pass_number || "",
          vendor_name: data.vendor.name || null,
          vendor_id:data.vendor.id,
          inward_type: data.inward_type || "",
          invoice_date: data.invoice_date ? new Date(data.invoice_date).toISOString().slice(0, 10) : "",
          invoice_amount: data.invoice_amount || "",
          no_of_boxes: data.no_of_boxes || "",
        });
      } catch {
        toast.error("Error loading gate pass details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    setIsDirty(true);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVendorSelect = (vendor) => {
    setIsDirty(true);
    console.log(vendor);

    setFormData((prev) => ({
      ...prev,
      vendor_id: vendor.id,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = id
        ? ALLEndpoint.GatePassEndpoints.updateGatePass
        : ALLEndpoint.GatePassEndpoints.addGatePass;

      const payload = {
        ...(id && {gate_pass_id:parseInt(id)}),
        vendor_id:formData.vendor_id,
        inward_type:formData.inward_type,
        invoice_amount: parseFloat(formData.invoice_amount) || 0,
        no_of_boxes: parseInt(formData.no_of_boxes) || 0,
      };

      console.log(payload);


      const res = await fetch(endpoint.endpoint, {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        (Array.isArray(data.message) ? data.message : [data]).forEach((err) =>
          toast.error(err.field ? `${err.field}: ${err.message}` : err.message || "Error")
        );
        return;
      }

      toast.success(id ? "Gate Pass updated!" : "Gate Pass added!");
      setIsDirty(false);
      navigate(ROUTES.GATEPASS.LIST);
    } catch {
      toast.error("Error saving gate pass!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {id ? "Edit Gate Pass" : "Add Gate Pass"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <InputField
            label="Gate Pass Number"
            name="gate_pass_number"
            value={formData.gate_pass_number}
            readOnly
            placeholder="Auto-generated"
          />

          <div>
            <label className="block mb-1">Vendor <span className="text-red-500">*</span></label>
            <SearchSelect
              type="vendor" value={formData.vendor_name} onSelect={handleVendorSelect} selectedIds={[]}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Inward Type <span className="text-red-500">*</span></label>
            <select
              name="inward_type"
              value={formData.inward_type}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select inward type</option>
              <option value="purchase inward">Purchase Inward</option>
              <option value="good return">Good Return</option>
            </select>
          </div>


          <InputField
            label="Invoice Date"
            name="invoice_date"
            value={formData.invoice_date}
            readOnly
            type="date"
            onChange={handleChange}
          />

          <InputField
            label="Invoice Amount"
            name="invoice_amount"
            value={formData.invoice_amount}
            onChange={handleChange}
            required
            placeholder="Enter invoice amount"
          />

          <InputField
            label="No of Boxes"
            name="no_of_boxes"
            value={formData.no_of_boxes}
            onChange={handleChange}
            required
            placeholder="Enter number of boxes"
          />

          <div className="flex justify-between mt-6">
            <Button
              variant="secondary"
              onClick={() =>
                (isDirty && !window.confirm("Unsaved changes. Continue?")) ||
                navigate(ROUTES.GATEPASS.LIST)
              }
            >
              Back
            </Button>

            <Button type="submit" disabled={loading} variant="primary">
              {loading ? "Saving..." : id ? "Update Gate Pass" : "Add Gate Pass"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GatePassForm;
