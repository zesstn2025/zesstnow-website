import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/ProductPage";
import { products } from "@/content/site";

const product = products.find((p) => p.slug === "cognitive-capital-suite");

export const metadata: Metadata = {
  title: "Cognitive Capital Suite — AI financial intelligence",
  description: product?.sub,
  alternates: { canonical: "/products/cognitive-capital-suite" },
  openGraph: {
    title: "Cognitive Capital Suite — AI financial intelligence",
    description: product?.sub,
    url: "/products/cognitive-capital-suite",
  },
};

export default function Page() {
  if (!product) notFound();
  return <ProductPage product={product} />;
}
