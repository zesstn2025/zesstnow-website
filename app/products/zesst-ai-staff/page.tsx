import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/ProductPage";
import { products } from "@/content/site";

const product = products.find((p) => p.slug === "zesst-ai-staff");

const title = "Zesst AI Staff — 4 AI staff for WhatsApp, Google reviews and Instagram";

export const metadata: Metadata = {
  title,
  description: product?.sub,
  alternates: { canonical: "/products/zesst-ai-staff" },
  openGraph: { title, description: product?.sub, url: "/products/zesst-ai-staff" },
};

export default function Page() {
  if (!product) notFound();
  return <ProductPage product={product} />;
}
