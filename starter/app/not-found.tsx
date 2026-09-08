import Link from "next/link";
export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>यह पन्ना नहीं मिला</h1>
        <p className="lead">शायद पता बदल गया है।</p>
        <div className="btns"><Link className="btn" href="/">होम पर जाएँ</Link></div>
      </div>
    </section>
  );
}
