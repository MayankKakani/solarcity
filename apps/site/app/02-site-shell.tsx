/** biome-ignore-all lint/a11y/useValidAnchor: <ignore> */
"use client";

import { useEffect, useMemo, useState } from "react";

function formatIndianMoney(amount: number) {
  const sign = amount < 0 ? "−" : "";
  const value = Math.abs(amount);
  if (value >= 10000000)
    return `${sign}₹${(value / 10000000).toFixed(1).replace(".0", "")}Cr`;
  if (value >= 100000)
    return `${sign}₹${(value / 100000).toFixed(1).replace(".0", "")}L`;
  if (value >= 1000)
    return `${sign}₹${(value / 1000).toFixed(1).replace(".0", "")}K`;
  return `${sign}₹${Math.round(value).toLocaleString("en-IN")}`;
}

function rangeFill(value: number, min: number, max: number) {
  return `${((value - min) / (max - min)) * 100}%`;
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [installedBase, setInstalledBase] = useState(500);
  const [monthlyInstalls, setMonthlyInstalls] = useState(20);
  const [conversionPct, setConversionPct] = useState(30);
  const [price, setPrice] = useState(6000);
  const [cost, setCost] = useState(2000);
  const [renewalPct, setRenewalPct] = useState(80);

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
  }, [menuOpen]);

  useEffect(() => {
    const revealItems = document.querySelectorAll("[data-reveal]");
    if (
      "IntersectionObserver" in window &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.12 },
      );
      for (const item of revealItems) observer.observe(item);
      return () => observer.disconnect();
    }
    for (const item of revealItems) item.classList.add("visible");
  }, []);

  const roi = useMemo(() => {
    const conversion = conversionPct / 100;
    const renewal = renewalPct / 100;
    const annualNewContracts = monthlyInstalls * 12 * conversion;
    const activeContracts: number[] = [
      installedBase * conversion + annualNewContracts,
    ];
    activeContracts.push(activeContracts[0] * renewal + annualNewContracts);
    activeContracts.push(activeContracts[1] * renewal + annualNewContracts);
    const annualRevenue = activeContracts.map((contracts) => contracts * price);
    const annualMargin = activeContracts[0] * (price - cost);
    const cumulativeRevenue = annualRevenue.reduce(
      (total, value) => total + value,
      0,
    );
    const maxRevenue = Math.max(...annualRevenue);
    return { annualRevenue, annualMargin, cumulativeRevenue, maxRevenue };
  }, [installedBase, monthlyInstalls, conversionPct, price, cost, renewalPct]);

  return (
    <>
      <header>
        <nav className="nav shell">
          <a className="brand" href="#top">
            {/** biome-ignore lint/performance/noImgElement: <ignore> */}
            <img
              className="brand-logo"
              src="/solar-logo-dark.svg"
              alt="Solarplan"
            />
          </a>
          <div className={`nav-links${menuOpen ? " open" : ""}`} id="nav-links">
            <a href="#workflow" onClick={closeMenu}>
              How it works
            </a>
            <a href="#field-service" onClick={closeMenu}>
              Maintenance
            </a>
            <a href="#monitoring" onClick={closeMenu}>
              AI monitoring
            </a>
            <a href="#roi" onClick={closeMenu}>
              ROI calculator
            </a>
            <a href="#platform" onClick={closeMenu}>
              Features
            </a>
            <a
              className="button"
              href="https://solarplan-web-bro6.onrender.com/"
              onClick={closeMenu}
            >
              login
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M4 10h11M11 5l5 5-5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
          <button
            className="menu-button"
            type="button"
            aria-controls="nav-links"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="shell">
            <div className="hero-copy" data-reveal>
              <span className="eyebrow">
                After-sales operating system for solar installers
              </span>
              <h1>
                Grow recurring revenue.{" "}
                <span className="accent">Deliver every visit on time.</span>
              </h1>
              <p className="lede">
                Solarplan brings AMCs and field service together—helping you
                sell care plans, schedule and dispatch technicians, meet SLAs,
                capture proof of work, and renew customers from one platform.
              </p>
              <div className="hero-actions">
                <a className="button" href="#contact">
                  Book a product walkthrough
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      d="M4 10h11M11 5l5 5-5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a className="button secondary" href="#roi">
                  Calculate AMC revenue
                </a>
              </div>
              <div
                className="proof-line"
                // aria-label="Key benefits"
              >
                <span>AMC sales and renewals</span>
                <span>Scheduling and dispatch</span>
                <span>SLA and proof of work</span>
              </div>
            </div>

            <div className="product-stage" data-reveal>
              <div
                className="product-window"
                // aria-label="Solarplan service command centre preview"
              >
                <div className="window-top">
                  <i />
                  <i />
                  <i />
                  <span className="address">app.solarplan.in</span>
                </div>
                <aside className="app-side" aria-hidden="true">
                  <div className="app-logo">
                    <b>S</b> solarplan
                  </div>
                  <div className="side-label">Workspace</div>
                  <div className="side-item active">
                    <i />
                    Command centre
                  </div>
                  <div className="side-item">
                    <i />
                    Customers
                  </div>
                  <div className="side-item">
                    <i />
                    Service visits <span className="side-count">12</span>
                  </div>
                  <div className="side-item">
                    <i />
                    AMCs
                  </div>
                  <div className="side-label">Manage</div>
                  <div className="side-item">
                    <i />
                    Field teams
                  </div>
                  <div className="side-item">
                    <i />
                    Reports
                  </div>
                </aside>
                <div className="app-main" aria-hidden="true">
                  <div className="app-head">
                    <div>
                      <p>Saturday, 11 July</p>
                      <h3>Service command centre</h3>
                    </div>
                    <div className="app-actions">
                      <span className="tiny-button">Export</span>
                      <span className="tiny-button filled">
                        + Schedule visit
                      </span>
                    </div>
                  </div>
                  <div className="metrics">
                    <div className="metric">
                      <div className="metric-label">
                        Active AMCs <i />
                      </div>
                      <strong>1,248</strong>
                      <small className="good">↑ 8.2% this month</small>
                    </div>
                    <div className="metric">
                      <div className="metric-label">
                        AMC revenue <i />
                      </div>
                      <strong>₹42L</strong>
                      <small>Annual run rate</small>
                    </div>
                    <div className="metric">
                      <div className="metric-label">
                        Renewal rate <i />
                      </div>
                      <strong>83%</strong>
                      <small className="good">↑ 4.1% vs last quarter</small>
                    </div>
                  </div>
                  <div className="command-grid">
                    <div className="panel">
                      <div className="panel-title">
                        <strong>Live field coverage</strong>
                        <span>8 technicians active</span>
                      </div>
                      <div className="route-map">
                        <span className="map-block one" />
                        <span className="map-block two" />
                        <span className="map-route" />
                        <span className="map-pin a" />
                        <span className="map-pin b" />
                      </div>
                    </div>
                    <div className="panel">
                      <div className="panel-title">
                        <strong>Upcoming visits</strong>
                        <span>View all</span>
                      </div>
                      <div className="visit-list">
                        <div className="visit">
                          <span className="avatar">AK</span>
                          <span>
                            <strong>Annual health check</strong>
                            <small>Aarav Khanna · 10:30</small>
                          </span>
                          <span className="status">On route</span>
                        </div>
                        <div className="visit">
                          <span className="avatar">RS</span>
                          <span>
                            <strong>Panel cleaning</strong>
                            <small>Riya Solar · 12:00</small>
                          </span>
                          <span className="status wait">Planned</span>
                        </div>
                        <div className="visit">
                          <span className="avatar">MT</span>
                          <span>
                            <strong>Inverter inspection</strong>
                            <small>Mehta Textiles · 14:30</small>
                          </span>
                          <span className="status wait">Planned</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="floating-note" aria-hidden="true">
                <div className="note-top">
                  <span className="note-icon">✓</span>
                  <span>
                    <strong>Visit completed</strong>
                    <span>Customer notified automatically</span>
                  </span>
                </div>
                <div className="note-progress">
                  <i />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="workflow" id="workflow">
          <div className="shell">
            <div className="section-head" data-reveal>
              <div>
                <span className="eyebrow">Why installers need Solarplan</span>
                <h2>One system for service revenue and service delivery.</h2>
              </div>
              <p>
                Selling an AMC is only the beginning. Solarplan connects the
                promise you sell with the people, schedules, SLAs, and proof
                needed to deliver it reliably at scale.
              </p>
            </div>
            <div className="steps">
              <article className="step" data-reveal>
                <span className="step-number">01</span>
                <h3>Sell recurring solar care</h3>
                <p>
                  Configure AMC plans, publish branded public pages, and convert
                  your installed base into recurring service customers.
                </p>
                <div className="step-tag">
                  Plans that are easy to buy
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      d="M4 10h11M11 5l5 5-5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
              </article>
              <article className="step" data-reveal>
                <span className="step-number">02</span>
                <h3>Plan and dispatch work</h3>
                <p>
                  Turn preventive visits and corrective requests into work
                  orders, assign the right technician, and manage every
                  schedule.
                </p>
                <div className="step-tag">
                  The right team, on time
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      d="M4 10h11M11 5l5 5-5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
              </article>
              <article className="step" data-reveal>
                <span className="step-number">03</span>
                <h3>Complete, prove, and renew</h3>
                <p>
                  Track SLAs, capture checklists and proof of work, notify
                  customers, and convert reliable delivery into renewals.
                </p>
                <div className="step-tag">
                  Trust that compounds
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      d="M4 10h11M11 5l5 5-5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="field-service" id="field-service">
          <div className="shell field-grid">
            <div className="field-copy" data-reveal>
              <span className="eyebrow">
                Preventive &amp; corrective maintenance
              </span>
              <h2>Plan routine care. Respond fast when performance drops.</h2>
              <p>
                Solarplan brings scheduled preventive work and urgent corrective
                maintenance into one controlled operation—from the first work
                order to customer sign-off.
              </p>
              <div className="field-benefits">
                <div className="field-benefit">
                  <span className="field-icon">01</span>
                  <div>
                    <strong>Work orders and intelligent scheduling</strong>
                    <span>
                      Plan recurring visits, handle corrective jobs, and see
                      team capacity before assigning work.
                    </span>
                  </div>
                </div>
                <div className="field-benefit">
                  <span className="field-icon">02</span>
                  <div>
                    <strong>Dispatch, SLAs, and escalation</strong>
                    <span>
                      Send the right technician, monitor due times, and surface
                      at-risk jobs before customers chase you.
                    </span>
                  </div>
                </div>
                <div className="field-benefit">
                  <span className="field-icon">03</span>
                  <div>
                    <strong>Field execution and proof of work</strong>
                    <span>
                      Give technicians site history, checklists, and job
                      details; capture photos, readings, notes, and customer
                      sign-off.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="dispatch-board"
              data-reveal
              // aria-label="Solarplan field service schedule preview"
            >
              <div className="dispatch-top">
                <div>
                  <small>Operations workspace</small>
                  <strong>Today’s service schedule</strong>
                </div>
                <span className="dispatch-date">11 July · Jaipur</span>
              </div>
              <div className="dispatch-stats" aria-hidden="true">
                <div className="dispatch-stat">
                  <span>On schedule</span>
                  <strong>18</strong>
                </div>
                <div className="dispatch-stat">
                  <span>At risk</span>
                  <strong>4</strong>
                </div>
                <div className="dispatch-stat">
                  <span>Unassigned</span>
                  <strong>2</strong>
                </div>
              </div>
              <div className="dispatch-table-head" aria-hidden="true">
                <span>Time</span>
                <span>Customer</span>
                <span>Work order</span>
                <span>Technician</span>
                <span>Status</span>
              </div>
              <div className="dispatch-rows" aria-hidden="true">
                <div className="dispatch-row">
                  <span className="dispatch-time">09:00</span>
                  <div className="dispatch-customer">
                    <strong>Aarav Khanna</strong>
                    <span>5.2 kW · Vaishali Nagar</span>
                  </div>
                  <div className="dispatch-job">
                    <strong>Preventive visit</strong>
                    <span>WO-2048 · AMC</span>
                  </div>
                  <div className="tech">
                    <i>RK</i>
                    <span>R. Kumar</span>
                  </div>
                  <span className="dispatch-status">On site</span>
                </div>
                <div className="dispatch-row">
                  <span className="dispatch-time">10:30</span>
                  <div className="dispatch-customer">
                    <strong>Mehta Textiles</strong>
                    <span>48 kW · Sitapura</span>
                  </div>
                  <div className="dispatch-job">
                    <strong>Inverter alert</strong>
                    <span>WO-2051 · Corrective</span>
                  </div>
                  <div className="tech">
                    <i>AS</i>
                    <span>A. Singh</span>
                  </div>
                  <span className="dispatch-status risk">At risk</span>
                </div>
                <div className="dispatch-row">
                  <span className="dispatch-time">12:00</span>
                  <div className="dispatch-customer">
                    <strong>Riya Residency</strong>
                    <span>12 kW · Mansarovar</span>
                  </div>
                  <div className="dispatch-job">
                    <strong>Panel cleaning</strong>
                    <span>WO-2054 · AMC</span>
                  </div>
                  <div className="tech">
                    <i>NP</i>
                    <span>N. Patel</span>
                  </div>
                  <span className="dispatch-status">On route</span>
                </div>
                <div className="dispatch-row">
                  <span className="dispatch-time">14:30</span>
                  <div className="dispatch-customer">
                    <strong>Sharma House</strong>
                    <span>3.5 kW · Ajmer Road</span>
                  </div>
                  <div className="dispatch-job">
                    <strong>Low generation</strong>
                    <span>WO-2058 · Corrective</span>
                  </div>
                  <div className="tech">
                    <i>—</i>
                    <span>Unassigned</span>
                  </div>
                  <span className="dispatch-status open">Open</span>
                </div>
              </div>
              <div className="service-proof" aria-hidden="true">
                <b>✓</b>
                <span>
                  <strong>Work order WO-2048 completed</strong>
                  <span>
                    Checklist, 6 photos, readings, and customer OTP captured
                  </span>
                </span>
                <em>Customer notified</em>
              </div>
            </div>
          </div>
        </section>

        <section className="intelligence" id="monitoring">
          <div className="shell capability-split">
            <div
              className="monitor-console"
              data-reveal
              // aria-label="AI-powered solar monitoring dashboard preview"
            >
              <div className="console-heading">
                <div>
                  <small>Portfolio intelligence</small>
                  <strong>Live performance</strong>
                </div>
                <span className="live-pill">
                  <i /> Live
                </span>
              </div>
              <div className="monitor-metrics">
                <div>
                  <span>System health</span>
                  <strong>
                    92<small>/100</small>
                  </strong>
                  <em>Healthy portfolio</em>
                </div>
                <div>
                  <span>Live generation</span>
                  <strong>
                    128.6<small> kW</small>
                  </strong>
                  <em>150 kW capacity</em>
                </div>
                <div>
                  <span>Active alerts</span>
                  <strong className="alert-number">2</strong>
                  <em>Needs attention</em>
                </div>
              </div>
              <div className="generation-panel">
                <div className="generation-title">
                  <strong>Generation profile</strong>
                  <span>
                    <i className="actual-key" /> Actual <i /> Expected
                  </span>
                </div>
                <svg
                  className="generation-graph"
                  viewBox="0 0 560 205"
                  role="img"
                  aria-label="Actual generation drops below the expected profile after an anomaly"
                >
                  <line x1="28" y1="166" x2="536" y2="166" />
                  <line x1="28" y1="112" x2="536" y2="112" />
                  <line x1="28" y1="58" x2="536" y2="58" />
                  <path
                    className="expected-curve"
                    d="M28 166 C85 158 112 128 159 88 S245 35 298 38 S383 78 422 112 S489 158 536 166"
                  />
                  <path
                    className="actual-curve"
                    d="M28 166 C80 160 116 135 160 103 S244 55 297 61 S365 101 397 127 S478 160 536 166"
                  />
                  <line
                    className="anomaly-guide"
                    x1="397"
                    y1="127"
                    x2="397"
                    y2="166"
                  />
                  <circle className="anomaly-point" cx="397" cy="127" r="6" />
                  <g className="graph-labels">
                    <text x="28" y="194">
                      06:00
                    </text>
                    <text x="151" y="194">
                      09:00
                    </text>
                    <text x="280" y="194">
                      12:00
                    </text>
                    <text x="407" y="194">
                      15:00
                    </text>
                    <text x="500" y="194">
                      18:00
                    </text>
                  </g>
                </svg>
                <div className="anomaly-callout">
                  <span>AI anomaly</span>
                  <strong>Inverter 02 · −18%</strong>
                </div>
              </div>
              <div className="ai-recommendation">
                <span className="ai-mark">AI</span>
                <div>
                  <small>Recommended action · 94% confidence</small>
                  <strong>Inspect string 14 for shading or soiling</strong>
                </div>
                <span className="work-order-link">Create work order →</span>
              </div>
            </div>

            <div className="capability-copy dark-copy" data-reveal>
              <span className="eyebrow">AI-powered monitoring</span>
              <h2>Find performance loss before the customer does.</h2>
              <p>
                Solarplan compares live generation with expected output,
                explains likely causes, and turns actionable anomalies into
                corrective work for your field team.
              </p>
              <div className="capability-list">
                <div>
                  <span>01</span>
                  <p>
                    <strong>Detect early</strong>
                    Spot underperformance before it becomes a complaint or lost
                    savings.
                  </p>
                </div>
                <div>
                  <span>02</span>
                  <p>
                    <strong>Understand the cause</strong>
                    Convert noisy device signals into a clear, prioritized
                    diagnosis.
                  </p>
                </div>
                <div>
                  <span>03</span>
                  <p>
                    <strong>Act immediately</strong>
                    Create a corrective work order with site and asset context
                    attached.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="growth-loop" id="referrals">
          <div className="shell capability-split growth-split">
            <div className="capability-copy" data-reveal>
              <span className="eyebrow">Referral management</span>
              <h2>Turn completed service into your next installation.</h2>
              <p>
                Give satisfied customers a branded referral link, attribute
                every lead, and manage rewards from invitation to conversion.
              </p>
              <div className="capability-list light-list">
                <div>
                  <span>01</span>
                  <p>
                    <strong>Launch and share</strong>
                    Publish a branded program and share unique links through
                    WhatsApp.
                  </p>
                </div>
                <div>
                  <span>02</span>
                  <p>
                    <strong>Track every conversion</strong>
                    Follow invites, leads, sales, and attribution in one funnel.
                  </p>
                </div>
                <div>
                  <span>03</span>
                  <p>
                    <strong>Reward transparently</strong>
                    Approve incentives and keep customers informed
                    automatically.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="referral-console"
              data-reveal
              // aria-label="Solarplan referral management dashboard preview"
            >
              <div className="console-heading">
                <div>
                  <small>Growth workspace</small>
                  <strong>Solar Circle referrals</strong>
                </div>
                <span className="active-pill">Active</span>
              </div>
              <div className="referral-share">
                <div className="program-avatar">SC</div>
                <div>
                  <strong>₹1,500 per successful referral</strong>
                  <span>solarplan.in/ref/SC12345</span>
                </div>
                <span className="share-action">Share on WhatsApp</span>
              </div>
              <div className="referral-funnel">
                <div>
                  <span>Invited</span>
                  <strong>148</strong>
                </div>
                <i />
                <div>
                  <span>Leads</span>
                  <strong>37</strong>
                </div>
                <i />
                <div className="won">
                  <span>Converted</span>
                  <strong>12</strong>
                </div>
              </div>
              <div className="referral-insights">
                <div>
                  <span>Conversion rate</span>
                  <strong>32.4%</strong>
                  <small>↑ 6.8% this month</small>
                </div>
                <div>
                  <span>Rewards paid</span>
                  <strong>₹18,000</strong>
                  <small>12 completed payouts</small>
                </div>
              </div>
              <div className="referral-table">
                <div className="referral-row heading">
                  <span>Customer</span>
                  <span>Referred by</span>
                  <span>Reward</span>
                </div>
                <div className="referral-row">
                  <span>R.K. Builders</span>
                  <span>Arjun Mehta</span>
                  <em>Paid</em>
                </div>
                <div className="referral-row">
                  <span>Sunrise Infra</span>
                  <span>Priya Nair</span>
                  <em>Paid</em>
                </div>
                <div className="referral-row">
                  <span>TechPark Solutions</span>
                  <span>Arjun Mehta</span>
                  <em className="pending">Pending</em>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="revenue" id="roi">
          <div className="shell">
            <div className="revenue-head" data-reveal>
              <span className="eyebrow">AMC revenue calculator</span>
              <div>
                <h2>Protect customer ROI. Grow your recurring revenue.</h2>
                <p>
                  Preventive maintenance helps solar systems sustain generation,
                  reduce avoidable downtime, and protect the savings promised at
                  sale. For installers, the same AMC creates predictable margin,
                  stronger retention, and a reason to stay connected for the
                  system’s lifetime.
                </p>
              </div>
            </div>
            <div className="roi-benefits" data-reveal>
              <div className="roi-benefit">
                <strong>Protect energy output</strong>
                <span>
                  Planned checks and cleaning help customers preserve the
                  financial return on their solar investment.
                </span>
              </div>
              <div className="roi-benefit">
                <strong>Create recurring margin</strong>
                <span>
                  Convert one-time installation customers into a renewable,
                  high-trust service revenue stream.
                </span>
              </div>
              <div className="roi-benefit">
                <strong>Increase lifetime value</strong>
                <span>
                  Stay first in line for renewals, referrals, upgrades,
                  batteries, and expansion projects.
                </span>
              </div>
            </div>
            <div
              className="roi-calculator"
              data-reveal
              // aria-labelledby="roi-title"
            >
              <div className="roi-controls">
                <h3 id="roi-title">Your AMC opportunity</h3>
                <p>
                  Adjust the assumptions to estimate the recurring revenue
                  already inside your customer base.
                </p>
                <div className="roi-field">
                  <label className="roi-label" htmlFor="installed-base">
                    <span>Existing installations</span>
                    <output id="installed-base-value" htmlFor="installed-base">
                      {installedBase.toLocaleString("en-IN")} sites
                    </output>
                  </label>
                  <input
                    id="installed-base"
                    type="range"
                    min="50"
                    max="5000"
                    step="50"
                    value={installedBase}
                    style={
                      {
                        "--fill": rangeFill(installedBase, 50, 5000),
                      } as React.CSSProperties
                    }
                    onChange={(e) => setInstalledBase(Number(e.target.value))}
                  />
                </div>
                <div className="roi-field">
                  <label className="roi-label" htmlFor="monthly-installs">
                    <span>New installations per month</span>
                    <output
                      id="monthly-installs-value"
                      htmlFor="monthly-installs"
                    >
                      {monthlyInstalls.toLocaleString("en-IN")} sites
                    </output>
                  </label>
                  <input
                    id="monthly-installs"
                    type="range"
                    min="0"
                    max="250"
                    step="5"
                    value={monthlyInstalls}
                    style={
                      {
                        "--fill": rangeFill(monthlyInstalls, 0, 250),
                      } as React.CSSProperties
                    }
                    onChange={(e) => setMonthlyInstalls(Number(e.target.value))}
                  />
                </div>
                <div className="roi-field">
                  <label className="roi-label" htmlFor="amc-conversion">
                    <span>Customers choosing an AMC</span>
                    <output id="amc-conversion-value" htmlFor="amc-conversion">
                      {conversionPct}%
                    </output>
                  </label>
                  <input
                    id="amc-conversion"
                    type="range"
                    min="5"
                    max="80"
                    step="5"
                    value={conversionPct}
                    style={
                      {
                        "--fill": rangeFill(conversionPct, 5, 80),
                      } as React.CSSProperties
                    }
                    onChange={(e) => setConversionPct(Number(e.target.value))}
                  />
                </div>
                <div className="roi-field">
                  <label className="roi-label" htmlFor="amc-price">
                    <span>Average annual AMC price</span>
                    <output id="amc-price-value" htmlFor="amc-price">
                      ₹{price.toLocaleString("en-IN")}
                    </output>
                  </label>
                  <input
                    id="amc-price"
                    type="range"
                    min="2000"
                    max="30000"
                    step="500"
                    value={price}
                    style={
                      {
                        "--fill": rangeFill(price, 2000, 30000),
                      } as React.CSSProperties
                    }
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>
                <div className="roi-field">
                  <label className="roi-label" htmlFor="service-cost">
                    <span>Delivery cost per AMC</span>
                    <output id="service-cost-value" htmlFor="service-cost">
                      ₹{cost.toLocaleString("en-IN")}
                    </output>
                  </label>
                  <input
                    id="service-cost"
                    type="range"
                    min="500"
                    max="15000"
                    step="500"
                    value={cost}
                    style={
                      {
                        "--fill": rangeFill(cost, 500, 15000),
                      } as React.CSSProperties
                    }
                    onChange={(e) => setCost(Number(e.target.value))}
                  />
                </div>
                <div className="roi-field">
                  <label className="roi-label" htmlFor="renewal-rate">
                    <span>Annual renewal rate</span>
                    <output id="renewal-rate-value" htmlFor="renewal-rate">
                      {renewalPct}%
                    </output>
                  </label>
                  <input
                    id="renewal-rate"
                    type="range"
                    min="40"
                    max="100"
                    step="5"
                    value={renewalPct}
                    style={
                      {
                        "--fill": rangeFill(renewalPct, 40, 100),
                      } as React.CSSProperties
                    }
                    onChange={(e) => setRenewalPct(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="roi-results" aria-live="polite">
                <div className="roi-results-head">
                  <div>
                    <p>Projected opportunity</p>
                    <h3>Recurring revenue at scale</h3>
                  </div>
                  <span className="roi-badge">Illustrative estimate</span>
                </div>
                <div className="roi-metrics">
                  <div className="roi-metric">
                    <span>Year-one run-rate revenue</span>
                    <strong id="year-one-revenue">
                      {formatIndianMoney(roi.annualRevenue[0])}
                    </strong>
                  </div>
                  <div className="roi-metric">
                    <span>Year-one recurring margin</span>
                    <strong id="year-one-margin">
                      {formatIndianMoney(roi.annualMargin)}
                    </strong>
                  </div>
                  <div className="roi-metric">
                    <span>Three-year cumulative revenue</span>
                    <strong id="three-year-revenue">
                      {formatIndianMoney(roi.cumulativeRevenue)}
                    </strong>
                  </div>
                </div>
                <div className="roi-chart-head">
                  <strong>Projected AMC revenue</strong>
                  <span>Annual run rate</span>
                </div>
                <div
                  className="roi-chart"
                  role="img"
                  // aria-label={`Projected AMC annual revenue: year one ${formatIndianMoney(roi.annualRevenue[0])}, year two ${formatIndianMoney(roi.annualRevenue[1])}, year three ${formatIndianMoney(roi.annualRevenue[2])}.`}
                  id="roi-chart"
                >
                  {(["one", "two", "three"] as const).map((label, index) => {
                    const revenue = roi.annualRevenue[index];
                    return (
                      <div className="roi-bar-wrap" key={label}>
                        <div
                          className="roi-bar"
                          id={`roi-bar-${label}`}
                          style={
                            {
                              "--bar-height": `${20 + (revenue / roi.maxRevenue) * 60}%`,
                            } as React.CSSProperties
                          }
                        >
                          <strong id={`roi-bar-value-${label}`}>
                            {formatIndianMoney(revenue)}
                          </strong>
                        </div>
                        <span>Year {index + 1}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="roi-note">
                  Assumes your existing base is offered an AMC in year one, new
                  installations convert at the selected rate, and active
                  contracts renew annually. Excludes taxes and customer
                  acquisition cost.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="platform" id="platform">
          <div className="shell">
            <div className="platform-intro" data-reveal>
              <span className="eyebrow">One after-sales platform</span>
              <div>
                <h2>
                  Everything you need to sell, deliver, and renew solar care.
                </h2>
                <p>
                  Once your customer base grows beyond a few dozen sites,
                  informal after-sales becomes expensive and invisible.
                  Solarplan connects sales, service coordinators, field
                  technicians, customers, and leadership in one measurable
                  operation.
                </p>
              </div>
            </div>
            <div className="bento">
              <article className="feature large" data-reveal>
                <div className="feature-kicker">Public AMC pages</div>
                <h3>
                  Your branded AMC storefront—configured, published, and ready
                  to share.
                </h3>
                <p>
                  Create public pages for every AMC plan with your logo,
                  benefits, inclusions, pricing, and call to action. Share a
                  simple link through WhatsApp, email, your website, or a QR
                  code.
                </p>
                <div className="phone" aria-hidden="true">
                  <div className="phone-screen">
                    <div className="phone-bar">
                      <span>sunpeak.solarplan.in</span>
                      <span>● ● ●</span>
                    </div>
                    <div className="public-page-head">
                      <div className="public-brand">
                        <i>S</i>SunPeak Solar
                      </div>
                      <span>Need help? Contact us</span>
                    </div>
                    <div className="public-hero">
                      <small>Protect your solar investment</small>
                      <strong>Solar care plans built around you.</strong>
                      <p>
                        Reliable maintenance, priority support, and better
                        system performance—all year.
                      </p>
                    </div>
                    <div className="public-plans">
                      <div className="public-plan">
                        <b>Essential Care</b>
                        <strong>₹4,999/yr</strong>
                        <span>
                          2 preventive visits
                          <br />
                          System health report
                          <br />
                          Priority phone support
                        </span>
                        <em>Choose Essential</em>
                      </div>
                      <div className="public-plan featured">
                        <b>Complete Care</b>
                        <strong>₹7,999/yr</strong>
                        <span>
                          4 preventive visits
                          <br />
                          Panel cleaning included
                          <br />
                          Priority corrective visit
                        </span>
                        <em>Choose Complete</em>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
              <article className="feature" data-reveal>
                <div className="feature-kicker">Renewals and revenue</div>
                <h3>Know what is due, renewed, and at risk.</h3>
                <p>
                  Automate timely reminders and give your team a live view of
                  recurring service revenue.
                </p>
                <div className="renewal-visual" aria-hidden="true">
                  <div className="renewal-ring">
                    <strong>83%</strong>
                  </div>
                  <div className="renewal-stats">
                    <div className="renewal-stat">
                      <span>Renewed</span>
                      <strong>248</strong>
                    </div>
                    <div className="renewal-stat">
                      <span>Due this month</span>
                      <strong>36</strong>
                    </div>
                    <div className="renewal-stat">
                      <span>At risk</span>
                      <strong>8</strong>
                    </div>
                  </div>
                </div>
              </article>
              <article className="feature" data-reveal>
                <div className="feature-kicker">Customer communication</div>
                <h3>Proactive updates, without the WhatsApp chaos.</h3>
                <p>
                  Automatically confirm visits, share technician status, send
                  completion reports, and keep customers informed before they
                  need to call.
                </p>
                <div className="message-visual" aria-hidden="true">
                  <div className="bubble">
                    Technician Ravi is on the way for your 10:30 AM preventive
                    visit.
                  </div>
                  <div className="bubble out">Perfect, thank you!</div>
                </div>
              </article>
            </div>

            <div className="cta" id="contact" data-reveal>
              <div className="cta-grid">
                <div>
                  <span className="eyebrow">
                    Build a complete after-sales business
                  </span>
                  <h2>Grow the revenue. Deliver the promise.</h2>
                </div>
                <div>
                  <p>
                    See how Solarplan can help you sell AMCs, coordinate field
                    teams, meet service SLAs, and build a revenue stream that
                    renews year after year.
                  </p>
                  <div className="cta-actions">
                    <a
                      className="button light"
                      href="mailto:in.solarplan@gmail.com?subject=Solarplan%20product%20walkthrough"
                    >
                      Book a walkthrough
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <path
                          d="M4 10h11M11 5l5 5-5 5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>
                    </a>
                    <a className="button secondary" href="#field-service">
                      Explore field service
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {children}
      </main>

      <footer>
        <div className="shell footer-grid">
          <a className="brand" href="#top">
            {/** biome-ignore lint/performance/noImgElement: <ignore> */}
            <img
              className="brand-logo"
              src="/solar-logo-dark.svg"
              alt="Solarplan"
            />
          </a>
          <p>After-sales operations for solar installers.</p>
          <div className="footer-links">
            <a href="mailto:in.solarplan@gmail.com">Contact</a>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </>
  );
}
