import React from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';

function SuperAdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <SuperAdminSidebar />
      <main className="flex-1 lg:ml-72 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default SuperAdminLayout;
