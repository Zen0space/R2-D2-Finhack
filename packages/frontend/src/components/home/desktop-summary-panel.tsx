import { ShieldCheck, Sparkles } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { activityItems } from "@/lib/home-data";

export function DesktopSummaryPanel() {
  return (
    <aside className="desktop-panel" aria-label="Tabung summary">
      <div className="panel-header">
        <div>
          <p className="eyebrow blue-copy">PWA Command Center</p>
          <h2>Pusat Tabung</h2>
        </div>
        <InstallAppButton />
      </div>

      <div className="trust-panel">
        <ShieldCheck aria-hidden="true" size={28} />
        <div>
          <strong>Trust Score 92</strong>
          <span>All active members verified</span>
        </div>
      </div>

      <div className="metric-grid">
        <div>
          <span>Current Pool</span>
          <strong>RM 4,800</strong>
        </div>
        <div>
          <span>Next Rotation</span>
          <strong>26 Apr</strong>
        </div>
        <div>
          <span>Members</span>
          <strong>8 / 8</strong>
        </div>
        <div>
          <span>On-time Rate</span>
          <strong>98%</strong>
        </div>
      </div>

      <section className="activity-panel" aria-labelledby="activity-title">
        <div className="section-heading compact">
          <h2 id="activity-title">Activity</h2>
          <Sparkles aria-hidden="true" size={18} />
        </div>
        {activityItems.map((item) => (
          <div className="activity-row" key={item.title}>
            <div>
              <strong>{item.title}</strong>
              <span>{item.status}</span>
            </div>
            <p>{item.amount}</p>
          </div>
        ))}
      </section>
    </aside>
  );
}
