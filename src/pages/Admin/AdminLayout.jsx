import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  LayoutDashboard,
  FolderOpen,
  Briefcase,
  GraduationCap,
  Wrench,
  Share2,
  Mail,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error logging out');
    } else {
      toast.success('Logged out successfully');
      navigate('/admin/login');
    }
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    {
      path: '/admin/profile',
      label: 'Profile',
      icon: <User size={20} />,
    },
    {
      path: '/admin/projects',
      label: 'Projects',
      icon: <FolderOpen size={20} />,
    },
    {
      path: '/admin/experience',
      label: 'Experience',
      icon: <Briefcase size={20} />,
    },
    {
      path: '/admin/education',
      label: 'Education',
      icon: <GraduationCap size={20} />,
    },
    {
      path: '/admin/skills',
      label: 'Skills & Tech',
      icon: <Wrench size={20} />,
    },
    {
      path: '/admin/socials',
      label: 'Socials',
      icon: <Share2 size={20} />,
    },
    {
      path: '/admin/messages',
      label: 'Messages',
      icon: <Mail size={20} />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:block`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-violet-500">Admin Panel</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/admin' &&
                location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsSidebarOpen(false)} // Close on mobile value select
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header (Mobile) */}
        <header className="md:hidden flex items-center p-4 bg-gray-800 border-b border-gray-700">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-400 hover:text-white mr-4"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
