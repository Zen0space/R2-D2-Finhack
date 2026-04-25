import Image from "next/image";
import { Bell, History, Plus, Search, UserRound } from "lucide-react";

export function WalletHeader() {
  return (
    <header className="wallet-header">
      <div className="top-strip">
        <span>9:41</span>
        <div className="top-icons" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <nav className="app-nav" aria-label="Wallet navigation">
        <button aria-label="Search" className="icon-button" type="button">
          <Search aria-hidden="true" size={18} />
        </button>
        <Image
          alt="Touch n Go eWallet"
          className="brand-mark"
          height={36}
          priority
          src="/tng-assets/brands/tng.png"
          width={36}
        />
        <button aria-label="Notifications" className="icon-button" type="button">
          <Bell aria-hidden="true" size={18} />
        </button>
      </nav>

      <div className="balance-row">
        <div>
          <p className="eyebrow">eWallet Balance</p>
          <h1>RM 128.40</h1>
        </div>
        <button aria-label="Open account" className="profile-button" type="button">
          <UserRound aria-hidden="true" size={22} />
        </button>
      </div>

      <div className="header-actions">
        <button className="reload-button" type="button">
          <Plus aria-hidden="true" size={17} />
          Reload
        </button>
        <button className="history-button" type="button">
          <History aria-hidden="true" size={16} />
          Transaction History
        </button>
      </div>
    </header>
  );
}
