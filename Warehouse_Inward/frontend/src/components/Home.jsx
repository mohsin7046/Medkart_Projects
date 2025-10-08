import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Boxes,
  ShoppingCart,
  FileText,
  Truck,
  Package,
  CreditCard,
  BarChart,
  Settings,
  ChevronDown,
} from "lucide-react"; 

function Home() {
  const [selected, setSelected] = React.useState("");
  const location = useLocation();

  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes("product")) setSelected("product");
    else if (path.includes("vendor")) setSelected("vendor");
    else if (path.includes("sales-order")) setSelected("sales-order");
    else if (path.includes("sales-indent")) setSelected("sales-indent");
    else if (path.includes("purchase-indent")) setSelected("purchase-indent");
    else if (path.includes("purchase-order")) setSelected("purchase-order");
    else if (path.includes("gate-pass")) setSelected("gate-pass");
    else if (path.includes("grn")) setSelected("grn");
  }, [location.pathname]);

  const menuItems = [
    // { label: "Dashboard", icon: <LayoutGrid size={16} />, link: "/dashboard" },
    {
      label: "Masters",
      icon: <Boxes size={16} />,
      children: [
        { name: "Product Master", link: "/product", key: "product" },
        { name: "Vendor Master", link: "/vendor", key: "vendor" },
        {name:"MRP PTR RATIO" , link:'/mrp-ptr-ratio' , key:'mrp_ptr-ratio'}
      ],
    },
    {
      label: "Sales",
      icon: <FileText size={16} />,
      children: [
        { name: "Sales Order", link: "/sales-order", key: "sales-order" },
        { name: "Sales Indent", link: "/sales-indent", key: "sales-indent" },
      ],
    },
    {
      label: "Purchase",
      icon: <ShoppingCart size={16} />,
      children: [
        { name: "Purchase Indent", link: "/purchase-indent", key: "purchase-indent" },
        { name: "Purchase Order", link: "/purchase-order", key: "purchase-order" },
      ],
    },
    {
      label: "Logistics",
      icon: <Truck size={16} />,
      children: [
        { name: "Gate Pass", link: "/gate-pass", key: "gate-pass" },
        { name: "GRN", link: "/grn", key: "grn" },
      ],
    },
  ];

  return (
    <nav className="bg-blue-200 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 space-x-8">
        {menuItems.map((item) => (
          <div key={item.label} className="relative group">
            {item.children ? (
              <>
                <button
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition duration-200 font-medium"
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <ChevronDown size={14} className="mt-[2px]" />
                </button>
              
                <div className="sticky hidden group-hover:block bg-white shadow-lg border border-gray-100 rounded-md w-48 mt-2 z-20">
                  {item.children.map((child) => (
                    <Link
                      key={child.key}
                      to={child.link}
                      onClick={() => setSelected(child.key)}
                      className={`block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 ${
                        selected === child.key ? " bg-blue-400 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link
                to={item.link}
                onClick={() => setSelected(item.label.toLowerCase())}
                className={`flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium relative pb-1 ${
                  selected === item.label.toLowerCase()
                    ? "border-b-2 border-blue-600"
                    : "border-b-2 border-transparent"
                } transition-all duration-200`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

export default Home;
