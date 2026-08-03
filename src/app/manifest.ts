import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Theo dõi đầu tư vàng bạc",
    short_name: "Đầu tư",
    description: "Theo dõi mua/bán vàng, bạc và lãi/lỗ theo thời gian",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf8f0",
    theme_color: "#d4922a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
