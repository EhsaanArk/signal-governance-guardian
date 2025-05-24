
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart2, FileText, GitBranch, Settings, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const SidebarItem = ({ 
  to, 
  icon: Icon, 
  label, 
  active 
}: { 
  to: string; 
  icon: React.ElementType; 
  label: string; 
  active: boolean 
}) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
        active 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

const DisabledSidebarItem = ({ 
  icon: Icon, 
  label, 
  tooltip 
}: { 
  icon: React.ElementType; 
  label: string; 
  tooltip: string;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-muted-foreground cursor-not-allowed">
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/' || path === '/admin/dashboard') {
      return location.pathname === '/' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Nuroblock Admin</h2>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <SidebarItem 
            to="/" 
            icon={BarChart2} 
            label="Dashboard" 
            active={isActive('/')} 
          />
          <SidebarItem 
            to="/admin/providers" 
            icon={Users} 
            label="Providers" 
            active={isActive('/admin/providers')} 
          />
          <div className="relative py-3">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
            <span className="relative z-10 bg-sidebar px-2 text-xs font-semibold text-muted-foreground">
              Governance
            </span>
          </div>
          <SidebarItem 
            to="/admin/rulesets" 
            icon={Shield} 
            label="Rule Sets" 
            active={isActive('/admin/rulesets')} 
          />
          <SidebarItem 
            to="/admin/breaches" 
            icon={GitBranch} 
            label="Breach Log" 
            active={isActive('/admin/breaches')} 
          />
          <SidebarItem 
            to="/admin/cooldowns" 
            icon={GitBranch} 
            label="Active Cool-downs" 
            active={isActive('/admin/cooldowns')} 
          />
          <div className="relative py-3">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
          </div>
          <SidebarItem 
            to="/admin/settings" 
            icon={Settings} 
            label="Settings" 
            active={isActive('/admin/settings')} 
          />
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
