import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/ProductPage";
import { products } from "@/content/site";

const product = products.find((p) => p.slug === "cognitive-capital-suite");

const title = "Cognitive Capital Suite — AI sales agent for B2B SaaS";

export const metadata: Metadata = {
  title,
  description: product?.sub,
  alternates: { canonical: "/products/cognitive-capital-suite" },
  openGraph: { title, description: product?.sub, url: "/products/cognitive-capital-suite" },
};

export default function Page() {
  if (!product) notFound();
  return <ProductPage product={product} />;
}
