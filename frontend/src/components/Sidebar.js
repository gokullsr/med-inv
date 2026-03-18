import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Inventory", path: "/inventory" },
    { name: "Add Medicine", path: "/add-medicine" },
    { name: "Sales", path: "/sales" },
    { name: "Patients", path: "/patients" },
  ];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">💊 JYO medical</h2>
      <nav>
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
