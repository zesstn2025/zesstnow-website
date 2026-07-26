import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main
        className="shell"
        style={{
          minHeight: "72svh",
          display: "grid",
          alignContent: "center",
          paddingTop: 120,
        }}
      >
        <span className="eyebrow">ERROR 404</span>
        <h1 className="display" style={{ marginTop: 20 }}>
          Nothing lives <span className="grad-text">here.</span>
        </h1>
        <p className="section-sub">
          The page you were looking for has moved, or never existed in the first
          place.
        </p>
        <div style={{ marginTop: 34 }}>
          <Link href="/" className="pill pill-primary">
            Back home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
