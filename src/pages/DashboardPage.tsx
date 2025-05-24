
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import DashboardKPICards from '@/components/dashboard/DashboardKPICards';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import DashboardTables from '@/components/dashboard/DashboardTables';
import LiveTicker from '@/components/dashboard/LiveTicker';
import TimeRangeSelector from '@/components/dashboard/TimeRangeSelector';

const DashboardPage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col h-full min-h-screen">
        <Header 
          title="Dashboard" 
          subtitle="Governance at a Glance"
          rightContent={
            <div className="flex items-center gap-4">
              <TimeRangeSelector />
              <div className="hidden lg:block border-l h-6" />
              <LiveTicker />
            </div>
          }
        />
        
        <main className="flex-1 p-4 lg:p-6 overflow-hidden">
          <div className="h-full space-y-6 max-w-full">
            {/* KPI Cards Row */}
            <div className="w-full">
              <DashboardKPICards />
            </div>
            
            {/* Charts Row */}
            <div className="w-full">
              <DashboardCharts />
            </div>
            
            {/* Tables Row */}
            <div className="w-full">
              <DashboardTables />
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
