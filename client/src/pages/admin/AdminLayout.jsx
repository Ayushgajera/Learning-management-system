import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="lg:pl-72">
        <main className="pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;