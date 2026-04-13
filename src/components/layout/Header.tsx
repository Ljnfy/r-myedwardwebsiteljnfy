import React from "react";
import { Button } from "../ui/button";
import { Menu, ChevronRight, Bell } from "lucide-react";
import { Alert } from "../../lib/types";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  alerts: Alert[];
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, alerts }) => {
  return (
    <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-background/50 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>Network</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Global Overview</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-mono">GW: 192.168.1.1</span>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {alerts.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />}
        </Button>
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-border flex items-center justify-center text-xs font-bold">
          ED
        </div>
      </div>
    </header>
  );
};
