import React from "react";

const StatCard = ({ icon, title, value, subtitle, color }) => {
  const colors = {
    blue: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    green: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    orange: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    purple: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    red: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    teal: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  };

  return (
    <div className="stat-card" style={{ backgroundImage: colors[color] || colors.blue }}>
      <div className="stat-card-content">
        <div className="stat-icon">{icon}</div>
        <div className="stat-text">
          <h3>{title}</h3>
          <div className="stat-value">{value}</div>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="stat-card-accent"></div>
    </div>
  );
};

export default StatCard;
