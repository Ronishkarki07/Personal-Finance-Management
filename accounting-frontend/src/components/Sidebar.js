import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Tag, 
  PieChart, 
  Target, 
  FileText,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileToggle }) => {
  const location = useLocation();  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  const navItems = [
    { path: '/dashboard', icon: BarChart3, text: 'Dashboard', emoji: '📊' },
    { path: '/income', icon: DollarSign, text: 'Income', emoji: '💵' },
    { path: '/expenses', icon: CreditCard, text: 'Expenses', emoji: '💸' },
    { path: '/monthly-view', icon: Calendar, text: 'Monthly View', emoji: '📅' },
    { path: '/categories', icon: Tag, text: 'Categories', emoji: '🏷️' },
    { path: '/budget', icon: PieChart, text: 'Budget', emoji: '📈' },
    { path: '/goals', icon: Target, text: 'Goals', emoji: '🎯' },
    { path: '/reports', icon: FileText, text: 'Reports', emoji: '📋' },
  ];

  const handleNavItemClick = () => {
    if (isMobile && onMobileToggle) {
      onMobileToggle();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileToggle} />
      )}
      
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'show' : ''}`}>
      <div className="sidebar-header">
        <h1 className="logo">
          <span className="logo-icon">💰</span>
          {!collapsed && <span className="logo-text">My Finance</span>}
        </h1>
        <button className="sidebar-toggle" onClick={isMobile ? onMobileToggle : onToggle}>
          {isMobile && mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={handleNavItemClick}
            >
              <span className="nav-icon">
                {collapsed ? item.emoji : <IconComponent size={20} />}
              </span>
              {!collapsed && <span className="nav-text">{item.text}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
    </>
  );
};

export default Sidebar;