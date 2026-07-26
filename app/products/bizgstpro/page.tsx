import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/ProductPage";
import { products } from "@/content/site";

const product = products.find((p) => p.slug === "bizgstpro");

export const metadata: Metadata = {
  title: "BizGSTPro — GST filing, invoicing & reconciliation",
  description: product?.sub,
  alternates: { canonical: "/products/bizgstpro" },
  openGraph: {
    title: "BizGSTPro — GST filing, invoicing & reconciliation",
    description: product?.sub,
    url: "/products/bizgstpro",
  },
};

export default function Page() {
  if (!product) notFound();
  return <ProductPage product={product} />;
}
