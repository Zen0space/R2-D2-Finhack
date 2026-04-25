import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="offline-page">
      <section className="offline-panel">
        <WifiOff aria-hidden="true" size={32} />
        <h1>You are offline</h1>
        <p>Cached wallet screens are still available. Reconnect to refresh live tabung balances.</p>
      </section>
    </main>
  );
}
