"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  MdSpaceDashboard,
  MdOutlineProductionQuantityLimits,
  MdOutlineBrandingWatermark,
  MdOutlinePayments,
} from "react-icons/md";
import { FaUser, FaRegUserCircle } from "react-icons/fa";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { PiPackageFill } from "react-icons/pi";
import { IoMdSettings } from "react-icons/io";
import { TbTruckDelivery, TbQuotes } from "react-icons/tb";
import { GrGallery } from "react-icons/gr";
import { GiAutoRepair } from "react-icons/gi";
import { Phone, UserCheck } from "lucide-react";

export default function Sidebar() {
  const [activeView, setActiveView] = useState("dashboard");
  const [email, setEmail] = useState<string>("");
  const [showCRM, setShowCRM] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedEmail = Cookies.get("email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  type MenuItem = {
    id: string;
    label: string;
    icon?: React.ReactNode;
    path?: string;
    submenu?: MenuItem[];
  };

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdSpaceDashboard />,
      path: "/admin",
    },
    {
      id: "brands",
      label: "Brands",
      icon: <MdOutlineBrandingWatermark />,
      path: "/admin/brands",
    },
    {
      id: "category",
      label: "Categories",
      icon: <BiSolidCategoryAlt />,
      path: "/admin/categories",
    },
    {
      id: "products",
      label: "Products",
      icon: <MdOutlineProductionQuantityLimits />,
      path: "/admin/products",
    },
    {
      id: "orders",
      label: "Orders",
      icon: <TbTruckDelivery />,
      path: "/admin/orders",
    },
    {
      id: "package",
      label: "Packages",
      icon: <PiPackageFill />,
      path: "/admin/packages",
    },
    {
      id: "payments",
      label: "Payments",
      icon: <MdOutlinePayments />,
      path: "/admin/payments",
    },
    {
      id: "gallery",
      label: "Gallery",
      icon: <GrGallery />,
      path: "/admin/gallery",
    },
    {
      id: "certificate",
      label: "Certificates",
      icon: <FaUser />,
      path: "/admin/certificates",
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: <FaUser />,
      path: "/admin/contacts",
    },
    {
      id: "quotations",
      label: "Quotations",
      icon: <TbQuotes />,
      path: "/admin/quotation",
    },
    {
      id: "repair",
      label: "Maintenance",
      icon: <GiAutoRepair />,
      path: "/admin/repair",
    },

    // CRM dropdown
    {
      id: "CRM",
      label: "CRM",
      icon: <FaUser />,
      submenu: [
        {
          id: "crm-customers",
          label: "Customers",
          icon: <FaUser fill="white" />,
          path: "/admin/customers",
        },
        {
          id: "crm-call-logs",
          label: "Call Logs",
          icon: <Phone size={15} fill="white" />,
          path: "/admin/call-logs",
        },
        {
          id: "crm-follow-ups",
          label: "Follow Ups",
          icon: <UserCheck size={15} fill="white" />,
          path: "/admin/follow-ups",
        },
      ],
    },

    {
      id: "settings",
      label: "Settings",
      icon: <IoMdSettings />,
      path: "/admin/settings",
    },
    {
      id: "user",
      label: "Create User",
      icon: <FaRegUserCircle />,
      path: "/admin/create-user",
    },
  ];

  const handleClick = (item: MenuItem) => {
    if (item.submenu) {
      setShowCRM(!showCRM);
    } else {
      setActiveView(item.id);
      if (item.path) router.push(item.path);
    }
  };

  const handleLogout = () => {
    Cookies.remove("email");
    Cookies.remove("token");
    router.push("/login");
  };

  return (
    <aside
      className="w-20 lg:w-60 p-2 flex flex-col justify-start items-center min-h-screen font-poppins"
      style={{ backgroundColor: "#aec958" }}
    >
      <div className="flex flex-col w-full gap-1">
        {menuItems.map((item) => {
          if (item.id === "user") {
            const allowedEmailsForCreateUser = [
              "scientificequipmenttraders@gmail.com",
              "info.setnepal@gmail.com",
              "damodar@example.com",
            ];
            if (!allowedEmailsForCreateUser.includes(email)) return null;
          }

          return (
            <div key={item.id} className="w-full">
              <button
                onClick={() => handleClick(item)}
                className={`w-full flex items-center justify-start gap-2 text-white
                  rounded-md transition-all duration-200 py-1 px-1 cursor-pointer
                  ${activeView === item.id ? "bg-[#4998d1]" : "hover:bg-[#4998d1] bg-transparent"}`}
              >
                {item.icon}
                <span className="text-base hidden lg:inline">{item.label}</span>
              </button>

              {/* Submenu */}
              {item.submenu && showCRM && (
                <div className="flex flex-col ml-6 mt-1 gap-1">
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveView(subItem.id);
                        if (subItem.path) router.push(subItem.path);
                      }}
                      className={`w-full flex items-center justify-start gap-2 text-white
          rounded-md transition-all duration-200 py-1 cursor-pointer
          ${activeView === subItem.id ? "bg-[#4998d1]" : "hover:bg-[#4998d1] bg-transparent"}`}
                    >
                      {subItem.icon}
                      <span className="text-sm hidden lg:inline">
                        {subItem.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
            {/* Footer 
      <div className="mt-auto flex flex-col items-start w-full">
        <div
          className="flex items-center gap-3 p-3 bg-[#4998d1] rounded-xl w-full cursor-pointer transition-all duration-200 hover:bg-blue-700"
          onClick={() => setShowLogout(!showLogout)}
        >
          <Image
            src="/logo.jpeg"
            alt="Shop Logo"
            width={40}
            height={40}
            className="rounded-full size-10"
          />
          <div className="text-white text-sm truncate hidden lg:block">
            <div>
              Set <span className="text-blue-200">Nepal</span>
            </div>
            <div className="text-gray-100 truncate text-xs">
              {email || "guest@example.com"}
            </div>
          </div>
        </div>

        {/* Logout Button  */}
      {/* {showLogout && ( 
        <button
          onClick={handleLogout}
          className="mt-2 w-full bg-red-500 text-white font-medium py-2 rounded-md hover:bg-red-600 transition-all duration-200"
        >
          Log Out
        </button>
        {/* )} 
      </div>
      */}
    </aside>
  );
}
