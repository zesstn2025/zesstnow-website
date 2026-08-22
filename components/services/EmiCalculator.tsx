"use client";

import { useId, useMemo, useState } from "react";

/**
 * A working EMI calculator, and nothing more than that.
 *
 * It runs the standard reducing-balance formula every lender in India uses —
 * the same arithmetic, not an approximation of it — on three numbers the
 * visitor types. That makes it genuinely useful for the question people
 * actually have at this point ("what would this cost me a month, and how much
 * of it is interest?") without pretending to be something it is not.
 *
 * What it deliberately does not do is quote. It cannot know the rate a lender
 * will offer, the processing fee, the insurance loaded onto the disbursement or
 * whether the file clears at all, and a page that produces a confident monthly
 * figure invites a customer to plan around it. So the rate is an input the
 * visitor sets rather than a number we supply, and the result carries the
 * disclosure with it rather than in small print somewhere else.
 *
 *   E = P · r · (1 + r)^n / ((1 + r)^n − 1)
 *
 * with r the monthly rate and n the number of months. At r = 0 that expression
 * is 0/0, so the zero-interest case is handled separately — the slider bottoms
 * out at 1% today, but a formula that breaks on a legal input is a bug waiting
 * for the day somebody changes the minimum.
 */

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹ in the units Indian borrowers actually think in. */
function compact(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${inr.format(Math.round(n))}`;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  display: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  // Fills the track up to the handle, so the control reads as a gauge rather
  // than as a browser default dropped into a dark page.
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="calc-field">
      <label className="calc-label" htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id} className="calc-value">
          {display}
        </output>
      </label>
      <input
        id={id}
        type="range"
        className="calc-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${pct}%` } as React.CSSProperties}
        aria-valuetext={`${display}${suffix ?? ""}`}
      />
    </div>
  );
}

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState(2_500_000);
  const [rate, setRate] = useState(11.5);
  const [years, setYears] = useState(7);

  const { emi, interest, total } = useMemo(() => {
    const n = years * 12;
    const r = rate / 12 / 100;
    const e = r === 0 ? principal / n : (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
    const t = e * n;
    return { emi: e, interest: t - principal, total: t };
  }, [principal, rate, years]);

  // How much of every rupee repaid is interest. The single number that changes
  // how people feel about a tenure, and the one a lender's own calculator
  // usually leaves out.
  const interestShare = (interest / total) * 100;

  return (
    <div className="glass calc">
      <div className="calc-head">
        <span className="mono-label">INDICATIVE · NOT A QUOTE</span>
        <h3 className="calc-t">What would it cost a month?</h3>
      </div>

      <div className="calc-controls">
        <Slider
          label="Loan amount"
          value={principal}
          min={100_000}
          max={50_000_000}
          step={100_000}
          display={compact(principal)}
          onChange={setPrincipal}
        />
        <Slider
          label="Interest rate"
          value={rate}
          min={1}
          max={24}
          step={0.05}
          suffix="% per year"
          display={`${rate.toFixed(2)}%`}
          onChange={setRate}
        />
        <Slider
          label="Tenure"
          value={years}
          min={1}
          max={30}
          step={1}
          suffix=" years"
          display={`${years} ${years === 1 ? "year" : "years"}`}
          onChange={setYears}
        />
      </div>

      <div className="calc-out">
        <div className="calc-out-main">
          <span className="mono-label">Monthly instalment</span>
          <strong>₹{inr.format(Math.round(emi))}</strong>
        </div>
        <dl className="calc-out-grid">
          <div>
            <dt>Total interest</dt>
            <dd>{compact(interest)}</dd>
          </div>
          <div>
            <dt>Total repayable</dt>
            <dd>{compact(total)}</dd>
          </div>
          <div>
            <dt>Interest share</dt>
            <dd>{interestShare.toFixed(1)}%</dd>
          </div>
        </dl>

        {/* The same three numbers, drawn once. Principal against interest is
            the whole argument for a shorter tenure, and it lands as a bar in a
            way it does not as a percentage. */}
        <div className="calc-bar" role="img"
             aria-label={`Of the total repayable, ${(100 - interestShare).toFixed(1)}% is principal and ${interestShare.toFixed(1)}% is interest.`}>
          <span className="calc-bar-principal" style={{ width: `${100 - interestShare}%` }} />
          <span className="calc-bar-interest" style={{ width: `${interestShare}%` }} />
        </div>
        <p className="calc-legend">
          <span className="calc-key calc-key-principal" /> Principal
          <span className="calc-key calc-key-interest" /> Interest
        </p>
      </div>

      <p className="calc-note">
        Standard reducing-balance arithmetic on the figures you set above. It is
        not an offer, an approval or a quote: your actual rate, tenure,
        processing fee and any bundled insurance are set by the lender in the
        sanction letter, and that letter is the only figure that binds anyone.
        Zesst Now is not a lender.
      </p>
    </div>
  );
}
