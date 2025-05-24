
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import DashboardKPICards from '@/components/dashboard/DashboardKPICards';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import DashboardTables from '@/components/dashboard/DashboardTables';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';

const DashboardPage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <Header 
          title="Dashboard" 
          subtitle="Governance at a Glance"
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* KPI Cards Row */}
            <DashboardKPICards />
            
            {/* Charts Row */}
            <DashboardCharts />
            
            {/* Tables Row */}
            <DashboardTables />
            
            {/* Quick Actions Sidebar - Desktop only */}
            <div className="hidden lg:block">
              <DashboardQuickActions />
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
