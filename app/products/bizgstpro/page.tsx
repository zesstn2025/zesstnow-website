import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/ProductPage";
import { products } from "@/content/site";

const product = products.find((p) => p.slug === "bizgstpro");

const title = "BizGST Pro — GST-compliant SaaS ERP for Indian SMBs";

export const metadata: Metadata = {
  title,
  description: product?.sub,
  alternates: { canonical: "/products/bizgstpro" },
  openGraph: { title, description: product?.sub, url: "/products/bizgstpro" },
};

export default function Page() {
  if (!product) notFound();
  return <ProductPage product={product} />;
}
