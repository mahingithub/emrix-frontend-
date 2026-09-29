import type { Anime, Product } from "@emrix/shared/types";
import { COLLECTION_ART } from "@emrix/shared/catalog-media";
import { sceneFor } from "@emrix/shared/scenes";
import { mix } from "@emrix/shared/utils";
import { productPhotos } from "@emrix/shared/ui/product-visual";
import { HeroReel, type ReelScene } from "./hero-reel";

/**
 * The opening reel, in play order. `glow` is brightened for the dark stage (the catalogue colours
 * are tuned for paper) and `sfx` is the manga sound effect that lands with the tee.
 */
const REEL = [
  { anime: "naruto", product: "hidden-leaf-shinobi-tee", glow: "#ff7a1a", sfx: "バン!" },
  { anime: "jujutsu-kaisen", product: "domain-expansion-oversized", glow: "#7c83ff", sfx: "ゴゴゴ" },
  { anime: "one-piece", product: "sun-god-gear-five-oversized", glow: "#ff4757", sfx: "ドン!" },
  { anime: "demon-slayer", product: "water-breathing-tee", glow: "#1fd1a5", sfx: "ズバッ!" },
  { anime: "dragon-ball", product: "super-saiyan-aura-tee", glow: "#ffc21a", sfx: "ドーン!" },
  { anime: "solo-leveling", product: "shadow-monarch-tee", glow: "#9b6bff", sfx: "ドドド" },
];
const MIN_SCENES = 3;

function toScene(anime: Anime, product: Product, glow: string, sfx: string): ReelScene | null {
  const photo = productPhotos(product)[0];
  if (!photo) return null;
  return {
    key: anime.slug,
    name: anime.name,
    jp: anime.jp,
    kanji: anime.kanji,
    glow,
    sfx,
    art: anime.cover ? { src: anime.cover, alt: `${anime.name} collection artwork` } : COLLECTION_ART[sceneFor(anime)],
    product: { slug: product.slug, name: product.name, price: product.price, fit: product.fit === "oversized" ? "Oversized" : "Regular fit", photo },
  };
}

export function Hero({ products, animes }: { products: Product[]; animes: Anime[] }) {
  const scenes: ReelScene[] = [];
  for (const cfg of REEL) {
    const anime = animes.find((a) => a.slug === cfg.anime);
    const product = products.find((p) => p.slug === cfg.product && p.anime === cfg.anime);
    const scene = anime && product && toScene(anime, product, cfg.glow, cfg.sfx);
    if (scene) scenes.push(scene);
  }

  // If the admin retires featured tees, top up with each remaining collection's best seller.
  for (const anime of animes) {
    if (scenes.length >= MIN_SCENES) break;
    if (scenes.some((s) => s.key === anime.slug)) continue;
    const best = products.filter((p) => p.anime === anime.slug).sort((a, b) => b.sold - a.sold)[0];
    const scene = best && toScene(anime, best, mix(anime.color, "#ffffff", 0.25), "ドン!");
    if (scene) scenes.push(scene);
  }

  if (!scenes.length) return null;
  return <HeroReel scenes={scenes} />;
}
