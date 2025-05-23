
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, GitBranch, Timer } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <h1 className="text-xl font-semibold">Nuroblock Admin</h1>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
            <Shield className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-3xl font-bold tracking-tight mb-4">Signal-Governance Module</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Welcome to the Nuroblock Admin Signal-Governance Module. 
              Manage rule sets, monitor breaches, and handle trading cooldowns all in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/admin/rulesets" className="group">
              <div className="border rounded-lg p-6 h-full flex flex-col transition-all hover:border-primary hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2 group-hover:text-primary">Rule Sets</h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  Create and manage rule configurations to govern trading behavior
                </p>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  Manage Rule Sets
                </Button>
              </div>
            </Link>
            
            <Link to="/admin/breaches" className="group">
              <div className="border rounded-lg p-6 h-full flex flex-col transition-all hover:border-primary hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <GitBranch className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2 group-hover:text-primary">Breach Log</h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  View detailed history of rule breaches and governance actions taken
                </p>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  View Breach Log
                </Button>
              </div>
            </Link>
            
            <Link to="/admin/cooldowns" className="group">
              <div className="border rounded-lg p-6 h-full flex flex-col transition-all hover:border-primary hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Timer className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2 group-hover:text-primary">Active Cool-downs</h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  Monitor and manage active trading restrictions and cooldown periods
                </p>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  Manage Cool-downs
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Nuroblock Admin © {new Date().getFullYear()}
          </p>
          <p className="text-sm text-muted-foreground">
            Signal-Governance Module v1.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
