import React from 'react';
import Navbar from '../components/navbar';
import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
