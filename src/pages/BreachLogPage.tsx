
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import BreachLogContainer from '@/components/breaches/BreachLogContainer';

const BreachLogPage: React.FC = () => {
  return (
    <MainLayout>
      <Header title="Signal Governance – Breach Log" />
      <BreachLogContainer />
    </MainLayout>
  );
};

export default BreachLogPage;
