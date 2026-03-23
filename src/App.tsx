import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Dashboard } from "@/components/dashboard/dashboard";
import { ClaudeSetup } from "@/components/claude-setup/claude-setup";
import { SmartDesk } from "@/components/smart-desk/smart-desk";
import { Pipeline } from "@/components/pipeline/pipeline";
import { useFileWatcher } from "@/hooks/use-file-watcher";

type Panel = "dashboard" | "claude-setup" | "smart-desk" | "pipeline";

function App() {
  const [activePanel, setActivePanel] = useState<Panel>("dashboard");
  useFileWatcher();

  return (
    <div className="flex h-screen">
      <Sidebar activePanel={activePanel} onNavigate={setActivePanel} />
      <main className="flex-1 overflow-auto p-6">
        {activePanel === "dashboard" && <Dashboard />}
        {activePanel === "claude-setup" && <ClaudeSetup />}
        {activePanel === "smart-desk" && <SmartDesk />}
        {activePanel === "pipeline" && <Pipeline />}
      </main>
    </div>
  );
}

export default App;
