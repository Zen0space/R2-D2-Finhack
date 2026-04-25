import { WalletContent } from "./wallet-content";
import { WalletHeader } from "./wallet-header";

export function WalletPhoneShell() {
  return (
    <section className="phone-frame" aria-label="Pusat Tabung wallet">
      <WalletHeader />
      <WalletContent />
    </section>
  );
}
