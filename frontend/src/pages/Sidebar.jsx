import React, { useState } from 'react';
import { 
  Home, 
  Plus, 
  BarChart, 
  PiggyBank, 
  TrendingUp, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Book 
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ onNavigate }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const sidebarItems = [
    { 
      icon: Home, 
      name: 'Dashboard', 
      path: '/dashboard' 
    },
    { 
      icon: Plus, 
      name: 'Add Transaction', 
      path: '/add-transaction' 
    },
    { 
      icon: BarChart, 
      name: 'Budget Tracking', 
      path: '/budget-tracking' 
    },
    { 
      icon: PiggyBank, 
      name: 'Savings Planning', 
      path: '/savings-planning' 
    },

    { 
      icon: User, 
      name: 'User Profile', 
      path: '/user-profile'
    },
  
    {
      icon : TrendingUp,
      name:'Recoommendations',
      path:'/Recommendations'
    }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem("authToken");
    // Redirect to the sign-in page
    navigate("/home");
  };

  return (
    <div 
      className={`
        bg-gradient-to-b from-blue-900 to-blue-700 text-white 
        min-h-screen 
        transition-all 
        duration-300 
        ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        relative
        flex 
        flex-col
        shadow-xl
      `}
    >
      <button
        onClick={toggleSidebar}
        className="
          absolute 
          top-4 
          right-0 
          transform 
          translate-x-full 
          bg-blue-800 
          text-white 
          p-2 
          rounded-r-md 
          hover:bg-blue-700 
          transition 
          z-10
        "
      >
        {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>

      <div 
        className={`
          text-center 
          py-6 
          transition-all 
          duration-300
          ${isCollapsed ? 'px-2' : 'px-6'}
        `}
      >
        <h1 
          className={`
            font-bold 
            transition-all 
            duration-300
            ${isCollapsed ? 'text-sm' : 'text-2xl'}
          `}
        >
          {isCollapsed ? 'F' : 'Finova'}
        </h1>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-2 px-2">
          {sidebarItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex 
                  items-center 
                  py-2 
                  rounded 
                  transition 
                  duration-300
                  ${
                    location.pathname === item.path 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-blue-800'
                  }
                  ${isCollapsed ? 'justify-center' : 'px-4'}
                `}
                onClick={() => onNavigate(item.path)}
              >
                <item.icon 
                  className={`
                    ${isCollapsed ? 'mr-0' : 'mr-3'}
                    ${location.pathname === item.path ? 'text-white' : 'text-gray-300'}
                    w-5 h-5
                  `} 
                />
                {!isCollapsed && (
                  <span 
                    className={`
                      whitespace-nowrap 
                      overflow-hidden 
                      transition-all 
                      duration-300
                      ${location.pathname === item.path ? 'text-white' : 'text-gray-300'}
                    `}
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
      >
        Logout
      </button>
    </div>
  );
}