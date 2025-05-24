
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardQuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'New Rule Set',
      icon: Plus,
      onClick: () => navigate('/admin/rulesets/create'),
      variant: 'default' as const,
    },
    {
      label: 'Upload Provider CSV',
      icon: Upload,
      onClick: () => {
        // TODO: Implement bulk provider upload
        console.log('Bulk provider upload - Coming soon');
      },
      variant: 'outline' as const,
    },
    {
      label: 'Download Breach CSV',
      icon: Download,
      onClick: () => {
        // TODO: Implement breach export
        console.log('Breach export - Coming soon');
      },
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant}
                size="sm"
                className="justify-start"
                onClick={action.onClick}
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
