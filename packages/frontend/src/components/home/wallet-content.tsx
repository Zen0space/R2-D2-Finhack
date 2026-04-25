import Image from "next/image";
import { ChevronRight, Home, ReceiptText, UsersRound, WalletCards } from "lucide-react";
import {
  discoverBrands,
  highlightItems,
  promoItems,
  rewardCards,
  serviceTiles,
} from "@/lib/home-data";

export function WalletContent() {
  return (
    <>
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
              <Image alt={brand.label} height={32} key={brand.label} src={brand.image} width={32} />
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
              <Image alt="" className="promo-image" height={188} src={promo.image} width={336} />
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
    </>
  );
}
