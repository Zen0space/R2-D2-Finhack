import { DesktopSummaryPanel } from "./desktop-summary-panel";
import { WalletPhoneShell } from "./wallet-phone-shell";

export function HomePage() {
  return (
    <main className="app-page">
      <div className="app-shell">
        <WalletPhoneShell />
        <DesktopSummaryPanel />
      </div>
    </main>
  );
}
