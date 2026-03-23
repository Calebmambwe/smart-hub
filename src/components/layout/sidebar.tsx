import { cn } from "@/lib/utils";
import { LayoutDashboard, Bot, HardDrive, GitBranch } from "lucide-react";

type Panel = "dashboard" | "claude-setup" | "smart-desk" | "pipeline";

interface SidebarProps {
  activePanel: Panel;
  onNavigate: (panel: Panel) => void;
}

const navItems: { panel: Panel; label: string; icon: typeof LayoutDashboard }[] = [
  { panel: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { panel: "claude-setup", label: "Claude Setup", icon: Bot },
  { panel: "smart-desk", label: "Smart Desk", icon: HardDrive },
  { panel: "pipeline", label: "Pipeline", icon: GitBranch },
];

export function Sidebar({ activePanel, onNavigate }: SidebarProps) {
  return (
    <aside className="flex w-56 flex-col border-r bg-card p-3">
      <div className="mb-6 px-2 pt-2">
        <h1 className="text-lg font-semibold tracking-tight">Smart Hub</h1>
        <p className="text-xs text-muted-foreground">Command Center</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ panel, label, icon: Icon }) => (
          <button
            key={panel}
            onClick={() => onNavigate(panel)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              activePanel === panel
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="border-t px-2 pt-3 text-xs text-muted-foreground">
        v0.1.0
      </div>
    </aside>
  );
}
