"use client";

import { useId, useMemo, useState } from "react";

/**
 * How much cover, not how much premium.
 *
 * There is no premium calculator on this page and there is not going to be one.
 * A premium depends on age, medical history, occupation, smoking status, the
 * sum assured and the insurer's own mortality table — it comes out of
 * underwriting, and a number produced without underwriting is a guess wearing a
 * decimal point. Putting one on a website would be the most convincing thing on
 * the page and the least true.
 *
 * The question that CAN be answered before an insurer is involved is how much
 * cover the household actually needs, and most people are underinsured because
 * they never worked it out — they bought whatever premium felt affordable. So
 * this estimates the sum assured, using the standard needs-analysis every
 * adviser uses:
 *
 *   income to replace + debts to clear + goals to fund − what already exists
 *
 * Every input is visible and every step of the arithmetic is shown, so it can
 * be argued with. That is the point: it is a starting position for a
 * conversation, not an answer handed down.
 */

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function compact(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${inr.format(Math.max(0, Math.round(n)))}`;
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
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
      />
      {hint && <span className="calc-hint">{hint}</span>}
    </div>
  );
}

export default function CoverEstimator() {
  const [income, setIncome] = useState(1_200_000);
  const [years, setYears] = useState(12);
  const [debts, setDebts] = useState(2_000_000);
  const [existing, setExisting] = useState(500_000);

  const { replacement, gross, gap } = useMemo(() => {
    const replacement = income * years;
    const gross = replacement + debts;
    return { replacement, gross, gap: Math.max(0, gross - existing) };
  }, [income, years, debts, existing]);

  return (
    <div className="glass calc">
      <div className="calc-head">
        <span className="mono-label">ESTIMATE · NOT A PREMIUM</span>
        <h3 className="calc-t">How much cover is enough?</h3>
      </div>

      <div className="calc-controls">
        <Slider
          label="Annual income to replace"
          value={income}
          min={100_000}
          max={20_000_000}
          step={50_000}
          display={compact(income)}
          onChange={setIncome}
        />
        <Slider
          label="Years it must be replaced for"
          hint="Until the youngest dependant is earning, or the household is otherwise secure."
          value={years}
          min={1}
          max={30}
          step={1}
          display={`${years} ${years === 1 ? "year" : "years"}`}
          onChange={setYears}
        />
        <Slider
          label="Outstanding loans"
          hint="Home loan, business borrowings, anything that would fall to the family."
          value={debts}
          min={0}
          max={50_000_000}
          step={100_000}
          display={compact(debts)}
          onChange={setDebts}
        />
        <Slider
          label="Cover and savings you already have"
          value={existing}
          min={0}
          max={50_000_000}
          step={100_000}
          display={compact(existing)}
          onChange={setExisting}
        />
      </div>

      <div className="calc-out">
        <div className="calc-out-main">
          <span className="mono-label">Additional cover to consider</span>
          <strong>{compact(gap)}</strong>
        </div>

        {/* The arithmetic, shown rather than asserted. Anyone can disagree with
            a line of it, which is exactly what a starting position is for. */}
        <dl className="calc-out-grid calc-out-steps">
          <div>
            <dt>Income replacement</dt>
            <dd>{compact(replacement)}</dd>
          </div>
          <div>
            <dt>Loans to clear</dt>
            <dd>{compact(debts)}</dd>
          </div>
          <div>
            <dt>Less existing cover</dt>
            <dd>−{compact(existing)}</dd>
          </div>
        </dl>
        <p className="calc-legend">
          {compact(replacement)} + {compact(debts)} − {compact(existing)} ={" "}
          {compact(gap)}
        </p>
      </div>

      <p className="calc-note">
        A needs estimate, not a quotation. It does not account for inflation,
        the return on a lump sum, or tax, and it deliberately does not calculate
        a premium — that comes from underwriting: age, medical history,
        occupation and the insurer&rsquo;s own table. Ask us for an insurer&rsquo;s
        benefit illustration for the actual cost. Insurance is a subject matter
        of solicitation; Zesst Now is not an insurer.
      </p>
    </div>
  );
}
