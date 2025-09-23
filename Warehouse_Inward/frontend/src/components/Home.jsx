import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function Home() {
  const [selected, setSelected] = React.useState("")
  const location = useLocation()

  React.useEffect(() => {
    if (location.pathname.includes("product")) setSelected("product")
    else if (location.pathname.includes("vendor")) setSelected("vendor")
    else if (location.pathname.includes("purchase-order")) setSelected("purchase-order")
    else if (location.pathname.includes("grn")) setSelected("grn")
    else if (location.pathname.includes("purchase-invoice")) setSelected("purchase-invoice")
    else if (location.pathname.includes("sales-order")) setSelected("sales-order")
    else if (location.pathname.includes("sales-indent")) setSelected("sales-indent")
  }, [location.pathname])

  return (
    <div className="bg-blue-800 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 h-16">
        
        <div className="flex items-center space-x-8">
          <div className="flex space-x-6 justify-evenly ">
            
            <Link
              to="/product"
              onClick={() => setSelected("product")}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selected === "product" ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Product Master
            </Link>

            <Link
              to="/vendor"
              onClick={() => setSelected("vendor")}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selected === "vendor" ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Vendor Master
            </Link>

            <Link
              to="/purchase-order"
              onClick={() => setSelected("purchase-order")}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selected === "purchase-order" ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              PurchaseOrder
            </Link>

            <Link
              to="/grn"
              onClick={() => setSelected("grn")}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selected === "grn" ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              GRN
            </Link>

            <Link
              to="/purchase-invoice"
              onClick={() => setSelected("purchase-invoice")}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selected === "purchase-invoice" ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Purchase Invoice
            </Link>

            <Link
              to="/sales-order"
              onClick={() => setSelected("sales-order")}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selected === "sales-order" ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Sales Order
            </Link>
            <Link
              to="sales-indent"
              onClick={() => setSelected("sales-indent")}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selected === "sales-indent" ? "bg-gray-900 text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Sales Indent
            </Link>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Home
