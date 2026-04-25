import Image from "next/image";
import { walletActions } from "@/lib/home-data";

export function QuickActionsPanel() {
  return (
    <section className="quick-actions" aria-label="Wallet actions">
      {walletActions.map((action) => (
        <button className="quick-action" key={action.label} type="button">
          <Image alt="" height={44} src={action.image} width={44} />
          <span>{action.label}</span>
        </button>
      ))}
    </section>
  );
}
