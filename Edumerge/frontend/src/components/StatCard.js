import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-content">
        <div className="stat-card-title">{title}</div>
        <div className="stat-card-value">{value}</div>
        {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      </div>
      {icon && <div className="stat-card-icon">{icon}</div>}
    </div>
  );
};

export default StatCard;