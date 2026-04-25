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

export type ActivityItem = {
  title: string;
  amount: string;
  status: string;
};
