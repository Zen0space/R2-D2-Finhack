import Image from "next/image";
import {
  Bell,
  ChevronRight,
  History,
  Home,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { InstallAppButton } from "@/components/install-app-button";
import {
  activityItems,
  discoverBrands,
  highlightItems,
  promoItems,
  rewardCards,
  serviceTiles,
  walletActions,
} from "@/lib/app-data";

export default function HomePage() {
  return (
    <main className="app-page">
      <div className="app-shell">
        <section className="phone-frame" aria-label="Pusat Tabung wallet">
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

          <section className="quick-actions" aria-label="Wallet actions">
            {walletActions.map((action) => (
              <button className="quick-action" key={action.label} type="button">
                <Image alt="" height={44} src={action.image} width={44} />
                <span>{action.label}</span>
              </button>
            ))}
          </section>

          <section className="content-stack">
            <div className="reward-grid">
              {rewardCards.map((reward, index) => (
                <button className="reward-card" key={reward.label} type="button">
                  <Image alt="" height={38} src={reward.image} width={38} />
                  <span>
                    <strong>{reward.label}</strong>
                    <small>{index === 0 ? "Enjoy returns" : "Earn rewards"}</small>
                  </span>
                </button>
              ))}
            </div>

            <article className="hero-offer">
              <Image
                alt="Featured wallet campaign"
                className="hero-offer-image"
                height={212}
                priority
                src="/tng-assets/ads/adImage1.jpg"
                width={405}
              />
            </article>

            <section className="service-grid" aria-label="Services">
              {serviceTiles.map((service) => (
                <button className={`service-tile ${service.tone}`} key={service.label} type="button">
                  <span className="service-icon">
                    <Image alt="" height={42} src={service.image} width={42} />
                  </span>
                  <span>{service.label}</span>
                </button>
              ))}
            </section>

            <section className="discover-row">
              <div className="brand-stack" aria-label="Partner brands">
                {discoverBrands.map((brand) => (
                  <Image
                    alt={brand.label}
                    height={32}
                    key={brand.label}
                    src={brand.image}
                    width={32}
                  />
                ))}
              </div>
              <button className="text-button" type="button">
                Discover more
                <ChevronRight aria-hidden="true" size={16} />
              </button>
            </section>
          </section>

          <section className="highlights-band" aria-labelledby="highlights-title">
            <div className="section-heading">
              <h2 id="highlights-title">Highlights</h2>
              <button aria-label="More highlights" className="icon-button blue" type="button">
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            </div>
            <div className="highlight-scroller">
              {highlightItems.map((image, index) => (
                <Image
                  alt={`Highlight ${index + 1}`}
                  className="highlight-image"
                  height={360}
                  key={image}
                  src={image}
                  width={240}
                />
              ))}
            </div>
          </section>

          <section className="promotions" aria-labelledby="promotions-title">
            <div className="section-heading">
              <h2 id="promotions-title">Promotions</h2>
              <button className="text-button" type="button">
                More
                <ChevronRight aria-hidden="true" size={16} />
              </button>
            </div>
            <div className="promo-scroller">
              {promoItems.map((promo) => (
                <article className="promo-card" key={promo.title}>
                  <Image
                    alt=""
                    className="promo-image"
                    height={188}
                    src={promo.image}
                    width={336}
                  />
                  <strong>{promo.title}</strong>
                  <span>{promo.subtitle}</span>
                </article>
              ))}
            </div>
          </section>

          <footer className="brand-footer">
            <Image alt="Touch n Go" height={34} src="/tng-assets/brands/tng.png" width={34} />
            <span aria-hidden="true" />
            <Image alt="Alipay Plus" height={35} src="/tng-assets/brands/alipay.png" width={104} />
          </footer>

          <nav className="bottom-nav" aria-label="Primary">
            <button className="active" type="button">
              <Home aria-hidden="true" size={20} />
              Home
            </button>
            <button type="button">
              <WalletCards aria-hidden="true" size={20} />
              Wallet
            </button>
            <button type="button">
              <UsersRound aria-hidden="true" size={20} />
              Tabung
            </button>
            <button type="button">
              <ReceiptText aria-hidden="true" size={20} />
              Inbox
            </button>
          </nav>
        </section>

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
      </div>
    </main>
  );
}
