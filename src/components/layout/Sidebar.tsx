import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Film, 
  Home, 
  Shield, 
  Globe, 
  Settings, 
  Network 
} from "lucide-react";
import { toast } from "sonner";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
    active 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`}>
    {icon}
    {label}
  </button>
);

interface SidebarProps {
  sidebarOpen: boolean;
  activeView: string;
  setActiveView: (view: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, activeView, setActiveView }) => {
  return (
    <AnimatePresence mode="wait">
      {sidebarOpen && (
        <motion.aside 
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          className="w-72 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col z-50 fixed inset-y-0 lg:relative"
        >
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Network className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">NetHub</h1>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Enterprise Core</p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            <NavItem 
              icon={<LayoutDashboard className="w-4 h-4" />} 
              label="Dashboard" 
              active={activeView === "dashboard"} 
              onClick={() => setActiveView("dashboard")} 
            />
            <NavItem 
              icon={<Film className="w-4 h-4" />} 
              label="Media Server" 
              active={activeView === "media"} 
              onClick={() => setActiveView("media")} 
            />
            <NavItem 
              icon={<Home className="w-4 h-4" />} 
              label="Smart Home" 
              active={activeView === "home"} 
              onClick={() => setActiveView("home")} 
            />
            <NavItem 
              icon={<Shield className="w-4 h-4" />} 
              label="Security Center" 
              active={activeView === "security"} 
              onClick={() => setActiveView("security")} 
            />
            <NavItem 
              icon={<Globe className="w-4 h-4" />} 
              label="Remote Access" 
              active={activeView === "remote"} 
              onClick={() => setActiveView("remote")} 
            />
            <NavItem 
              icon={<Settings className="w-4 h-4" />} 
              label="System Config" 
              active={activeView === "config"} 
              onClick={() => setActiveView("config")} 
            />
          </nav>

          <div className="p-4 mt-auto">
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-400">Remote View</span>
                <div 
                  onClick={() => {
                    const nextView = activeView === "remote" ? "dashboard" : "remote";
                    setActiveView(nextView);
                    toast.info(nextView === "remote" ? "Switched to Remote Management Mode" : "Switched to Local Network");
                  }}
                  className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors duration-200 ${activeView === "remote" ? 'bg-blue-600' : 'bg-zinc-800'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${activeView === "remote" ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {activeView === "remote" ? "Connected via Secure Tunnel (TLS 1.3). Latency may be higher." : "Direct LAN connection established."}
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
