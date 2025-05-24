
import React from 'react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, rightContent, action }) => {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-2">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {rightContent && (
        <div className="flex items-center">
          {rightContent}
        </div>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default Header;
