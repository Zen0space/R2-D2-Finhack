export type ImageAction = {
  label: string;
  image: string;
};

export type ServiceTile = ImageAction & {
  tone: "blue" | "gold" | "green" | "neutral";
};

export type PromoItem = {
  title: string;
  subtitle: string;
  image: string;
};

export const walletActions: ImageAction[] = [
  { label: "Scan", image: "/tng-assets/icons/scan.png" },
  { label: "Pay", image: "/tng-assets/icons/pay.png" },
  { label: "Transfer", image: "/tng-assets/icons/transfer.png" },
  { label: "Cash Out", image: "/tng-assets/icons/cashout.png" },
];

export const rewardCards: ImageAction[] = [
  { label: "GO+", image: "/tng-assets/icons/dollar.png" },
  { label: "My Rewards", image: "/tng-assets/icons/giftbox.png" },
];

export const serviceTiles: ServiceTile[] = [
  { label: "Tabung", image: "/tng-assets/icons/dollar.png", tone: "gold" },
  { label: "Trust Score", image: "/tng-assets/brands/ctos.png", tone: "green" },
  { label: "Toll", image: "/tng-assets/icons/TollIcon.png", tone: "blue" },
  { label: "Parking", image: "/tng-assets/icons/ParkingIcon.png", tone: "neutral" },
  { label: "Bills", image: "/tng-assets/icons/BillsIcon.png", tone: "blue" },
  { label: "Prepaid", image: "/tng-assets/icons/PrepaidIcon.png", tone: "green" },
  { label: "WalletSafe", image: "/tng-assets/icons/WalletSafeIcon.png", tone: "gold" },
  { label: "More", image: "/tng-assets/icons/more.png", tone: "neutral" },
];

export const highlightItems = [
  "/tng-assets/ads/adImage2.png",
  "/tng-assets/ads/adImage3.jpg",
  "/tng-assets/ads/adImage4.jpg",
];

export const promoItems: PromoItem[] = [
  {
    title: "Duit Kutu on time",
    subtitle: "RM 450 due this Friday",
    image: "/tng-assets/ads/adImage5.jpg",
  },
  {
    title: "Member streak",
    subtitle: "6 members paid early",
    image: "/tng-assets/ads/adImage6.png",
  },
  {
    title: "Rotation ready",
    subtitle: "Next recipient confirmed",
    image: "/tng-assets/ads/adImage7.png",
  },
];

export const discoverBrands = [
  { label: "Lazada", image: "/tng-assets/brands/lazada.png" },
  { label: "MR DIY", image: "/tng-assets/brands/mrdiy.png" },
  { label: "Tealive", image: "/tng-assets/brands/tealive.jpg" },
];

export const activityItems = [
  { title: "Aina paid March share", amount: "+RM 150.00", status: "Settled" },
  { title: "Rotation reminder sent", amount: "8 members", status: "Today" },
  { title: "Tabung Raya created", amount: "RM 1,200 goal", status: "Active" },
];
