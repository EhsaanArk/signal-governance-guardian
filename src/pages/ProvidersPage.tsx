
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProvidersContainer from '@/components/providers/ProvidersContainer';

const ProvidersPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Providers</h2>
        </div>
        <ProvidersContainer />
      </div>
    </MainLayout>
  );
};

export default ProvidersPage;
