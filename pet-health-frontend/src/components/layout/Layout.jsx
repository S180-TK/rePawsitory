import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ 
  children, 
  sidebarOpen, 
  setSidebarOpen, 
  userRole, 
  navItems, 
  currentPage, 
  setCurrentPage,
  logout
}) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
        navItems={navItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        logout={logout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={userRole} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
