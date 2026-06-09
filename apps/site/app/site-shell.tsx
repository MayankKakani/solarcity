/** biome-ignore-all lint/a11y/useValidAnchor: <ignore> */
"use client";

import { Sun } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  function toggleMenu() {
    const nav = document.getElementById("mobile-nav");
    const btn = document.getElementById("hamburger");
    const icon = document.getElementById("ham-icon");
    const open = nav?.classList.toggle("open");
    btn?.setAttribute("aria-expanded", String(open));
    // biome-ignore lint/style/noNonNullAssertion: <ignore>
    icon!.className = open ? "ti ti-x" : "ti ti-menu-2";
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    const revealEls = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((el) => {
          if (el.isIntersecting) {
            el.target.classList.add("in");
            observer.unobserve(el.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    // biome-ignore lint/suspicious/useIterableCallbackReturn: <ignore>
    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav className="nav" aria-label="Main navigation">
        <div className="container">
          <div className="nav-inner">
            <a href="#" className="nav-brand" aria-label="Solarplan home">
              <div className="nav-mark" aria-hidden="true">
                {/* <i className="ti ti-solar-panel" /> */}
                <Sun className="h-5 w-5 text-amber-500" />
              </div>
              <span className="nav-name">Solarplan</span>
            </a>
            <div className="nav-links">
              <a href="#solution">Product</a>
              <a href="#how-it-works">How it works</a>
              <a href="#polish">Customers</a>
              <a href="#cta">Pricing</a>
            </div>
            <div className="nav-ctas">
              <Button
                className="btn-ghost"
                onClick={() =>
                  (window.location.href = "mailto:hello@solarplan.app")
                }
              >
                Log in
              </Button>
              <Button
                className="btn-primary"
                onClick={() =>
                  (window.location.href = "https://wa.me/+917597204168")
                }
              >
                Contact Us
              </Button>
            </div>
            <Button
              className="nav-hamburger"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded="false"
              id="hamburger"
            >
              <i className="ti ti-menu-2" id="ham-icon" />
            </Button>
          </div>
        </div>
        <div className="mobile-nav" id="mobile-nav" role="menu">
          <a href="#solution" onClick={toggleMenu}>
            Product
          </a>
          <a href="#how-it-works" onClick={toggleMenu}>
            How it works
          </a>
          <a href="#polish" onClick={toggleMenu}>
            Customers
          </a>
          <a href="#cta" onClick={toggleMenu}>
            Pricing
          </a>
          <div className="mobile-ctas">
            <Button className="btn-ghost" style={{ flex: 1, padding: "11px" }}>
              Log in
            </Button>
            <Button
              className="btn-primary"
              style={{ flex: 1, padding: "11px" }}
              onClick={() =>
                (window.location.href = "https://wa.me/+917597204168")
              }
            >
              Contact us
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-grid">
              <div>
                <div className="hero-pill hero-text-1">
                  <i className="ti ti-bolt" aria-hidden="true" />
                  Solar AMC & Work Management
                </div>
                <h1 className="hero-text-2">
                  Professional solar service,{" "}
                  <em>from first visit to renewal.</em>
                </h1>
                <p className="lead hero-text-3">
                  Solarplan helps solar companies manage AMCs, schedule field
                  visits, and deliver a transparent customer experience — all
                  from one platform.
                </p>
                <div className="hero-ctas hero-text-4">
                  <Button
                    className="btn-primary-lg"
                    onClick={() => scrollTo("cta")}
                  >
                    Contact us{" "}
                    <i className="ti ti-arrow-right" aria-hidden="true" />
                  </Button>
                  <Button
                    className="btn-ghost-lg"
                    onClick={() => scrollTo("how-it-works")}
                  >
                    See how it works
                  </Button>
                </div>
                <blockquote
                  className="hero-vision hero-text-4"
                  style={{ animationDelay: ".38s" }}
                >
                  "To deliver professional, on-time and transparent solar
                  after-sale service that protects your investments."
                  <span>— Solarplan vision</span>
                </blockquote>
              </div>

              <div className="mockup-wrap" aria-hidden="true">
                <div className="browser">
                  <div className="browser-bar">
                    <div className="browser-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="browser-url">solarplan.app/dashboard</div>
                  </div>
                  <div className="dash">
                    <div className="dash-sidebar">
                      <div className="ds-logo">
                        <i className="ti ti-solar-panel" />
                      </div>
                      <div className="ds-icon active">
                        <i className="ti ti-layout-dashboard" />
                      </div>
                      <div className="ds-icon">
                        <i className="ti ti-calendar-event" />
                      </div>
                      <div className="ds-icon">
                        <i className="ti ti-users" />
                      </div>
                      <div className="ds-icon">
                        <i className="ti ti-file-invoice" />
                      </div>
                      <div className="ds-icon">
                        <i className="ti ti-chart-bar" />
                      </div>
                    </div>
                    <div className="dash-main">
                      <div className="dash-header">
                        <h4>Dashboard</h4>
                        <span>Mon, 14 Jan 2025</span>
                      </div>
                      <div className="dash-stats">
                        <div className="ds-stat">
                          <div
                            className="ds-stat-val"
                            style={{ color: "var(--teal-600)" }}
                          >
                            8
                          </div>
                          <div className="ds-stat-lbl">Visits today</div>
                        </div>
                        <div className="ds-stat">
                          <div className="ds-stat-val">147</div>
                          <div className="ds-stat-lbl">Active AMCs</div>
                        </div>
                        <div className="ds-stat">
                          <div
                            className="ds-stat-val"
                            style={{ color: "var(--amber-600)" }}
                          >
                            5
                          </div>
                          <div className="ds-stat-lbl">Due for renewal</div>
                        </div>
                      </div>
                      <div className="dash-section-lbl">
                        Today's service visits
                      </div>
                      <div className="visit-rows">
                        <div className="visit-row">
                          <div className="va green">RK</div>
                          <div className="visit-info">
                            <div className="visit-name">Rajesh Kumar</div>
                            <div className="visit-type">
                              Panel cleaning · 5 kW
                            </div>
                          </div>
                          <span className="v-badge done">Done</span>
                        </div>
                        <div className="visit-row">
                          <div className="va blue">PM</div>
                          <div className="visit-info">
                            <div className="visit-name">Priya Mehta</div>
                            <div className="visit-type">
                              Technical audit · 10 kW
                            </div>
                          </div>
                          <span className="v-badge live">In progress</span>
                        </div>
                        <div className="visit-row">
                          <div className="va amber">AS</div>
                          <div className="visit-info">
                            <div className="visit-name">Arun Sharma</div>
                            <div className="visit-type">
                              Inverter check · 3 kW
                            </div>
                          </div>
                          <span className="v-badge sched">2:30 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <div className="trust">
          <div className="container">
            <div className="trust-inner">
              <span className="trust-label">
                Trusted by 200+ solar companies
              </span>
              <div className="trust-divider" />
              <div className="trust-logos">
                <span className="trust-chip">Surya Solar</span>
                <span className="trust-chip">GreenWatt Energy</span>
                <span className="trust-chip">Helios Power</span>
                <span className="trust-chip">SunForce Pvt.</span>
                <span className="trust-chip">Aditya Energy</span>
                <span className="trust-chip">Brighter Solar</span>
              </div>
            </div>
          </div>
        </div> */}

        <section className="problem" id="problem">
          <div className="container">
            <div className="problem-intro reveal">
              <div className="section-eye">The problem</div>
              <h2>Solar after-sale is where companies lose customers</h2>
              <p className="lead">
                The panel is installed. The commission is paid. Then the chaos
                begins — and your customer's trust quietly erodes.
              </p>
            </div>
            <div className="g3">
              <div className="card reveal reveal-d1">
                <div className="card-icon danger">
                  <i className="ti ti-calendar-off" aria-hidden="true" />
                </div>
                <div className="card-stat" style={{ color: "var(--error)" }}>
                  67%
                </div>
                <h3>Missed service visits</h3>
                <p>
                  Technicians rely on WhatsApp and memory. Visits get skipped,
                  output drops, and customers notice. AMC renewals quietly
                  disappear.
                </p>
              </div>
              <div className="card reveal reveal-d2">
                <div className="card-icon amber">
                  <i className="ti ti-eye-off" aria-hidden="true" />
                </div>
                <div
                  className="card-stat"
                  style={{ color: "var(--amber-600)" }}
                >
                  23%
                </div>
                <h3>Zero customer visibility</h3>
                <p>
                  Customers have no idea what was done, when, or what's next.
                  Trust erodes invisibly — until they choose a competitor at
                  renewal time.
                </p>
              </div>
              <div className="card reveal reveal-d3">
                <div className="card-icon gray">
                  <i className="ti ti-table-off" aria-hidden="true" />
                </div>
                <div className="card-stat" style={{ color: "var(--text2)" }}>
                  50+
                </div>
                <h3>Manual processes don't scale</h3>
                <p>
                  Excel, notebooks, and phone calls manage 20 customers. At 50
                  customers, everything breaks — and your most profitable
                  revenue stream collapses.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="alt" id="solution">
          <div className="container">
            <div className="solution-intro reveal">
              <div className="section-eye">The solution</div>
              <h2>One platform. Every touchpoint covered.</h2>
              <p className="lead">
                Solarplan gives your business the infrastructure to run
                after-sale service like a product — not an afterthought.
              </p>
            </div>
            <div className="g2">
              <div className="card reveal reveal-d1">
                <div className="card-icon amber">
                  <i className="ti ti-file-invoice" aria-hidden="true" />
                </div>
                <h3>AMC management</h3>
                <p>
                  Build service bundles with pricing, frequencies, and
                  inclusions. Share a branded public link with customers — they
                  compare plans, choose a tier, and sign digitally. No PDFs, no
                  back-and-forth.
                </p>
              </div>
              <div className="card reveal reveal-d2">
                <div className="card-icon teal">
                  <i className="ti ti-calendar-event" aria-hidden="true" />
                </div>
                <h3>Smart scheduling</h3>
                <p>
                  Auto-generate the full service calendar from every active AMC.
                  Assign technicians, send visit reminders, and track completion
                  in real time. Nothing falls through — ever.
                </p>
              </div>
              <div
                className="card reveal reveal-d1"
                style={{ transitionDelay: ".07s" }}
              >
                <div className="card-icon teal">
                  <i className="ti ti-device-mobile" aria-hidden="true" />
                </div>
                <h3>Customer portal</h3>
                <p>
                  Every customer gets a live, branded view of their AMC, service
                  history, upcoming visits, and performance reports. Transparent
                  service builds the trust that renews contracts.
                </p>
              </div>
              <div
                className="card reveal reveal-d2"
                style={{ transitionDelay: ".14s" }}
              >
                <div className="card-icon gray">
                  <i className="ti ti-chart-bar" aria-hidden="true" />
                </div>
                <h3>Business intelligence</h3>
                <p>
                  See renewal rates, technician performance, revenue at risk,
                  and upcoming AMC expirations — so you act before you lose the
                  business, not after.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="polish">
          <div className="container">
            <div
              className="reveal"
              style={{ maxWidth: "580px", marginBottom: "48px" }}
            >
              <div className="section-eye">What your customers see</div>
              <h2>A Fortune 500 experience from a local solar company</h2>
              <p className="lead">
                Solarplan puts a polished, professional surface between your
                operations and your customers — so every interaction builds
                trust, not doubt.
              </p>
            </div>

            <div className="g3" style={{ marginBottom: "48px" }}>
              <div className="touch-card reveal reveal-d1">
                <div className="touch-preview">
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--text3)",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: "9px",
                    }}
                  >
                    Shareable bundle page
                  </div>
                  <div className="mini-row">
                    <div
                      className="mini-dot"
                      style={{
                        background: "var(--amber-50)",
                        border: "1px solid var(--amber-100)",
                      }}
                    />
                    <div
                      className="mini-bar"
                      style={{ background: "var(--amber-100)" }}
                    />
                    <span
                      className="mini-tag"
                      style={{
                        background: "var(--gray-50)",
                        color: "var(--text2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      ₹5,999
                    </span>
                  </div>
                  <div
                    className="mini-row"
                    style={{ borderColor: "var(--teal-100)" }}
                  >
                    <div
                      className="mini-dot"
                      style={{
                        background: "var(--teal-50)",
                        border: "1px solid var(--teal-100)",
                      }}
                    />
                    <div
                      className="mini-bar"
                      style={{ background: "var(--teal-100)" }}
                    />
                    <span
                      className="mini-tag"
                      style={{
                        background: "var(--teal-50)",
                        color: "var(--teal-800)",
                      }}
                    >
                      ₹9,999 ★
                    </span>
                  </div>
                  <div className="mini-row">
                    <div
                      className="mini-dot"
                      style={{
                        background: "var(--gray-50)",
                        border: "1px solid var(--border)",
                      }}
                    />
                    <div className="mini-bar" />
                    <span
                      className="mini-tag"
                      style={{
                        background: "var(--gray-50)",
                        color: "var(--text2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      Custom
                    </span>
                  </div>
                </div>
                <div className="touch-body">
                  <h3>Branded AMC bundle page</h3>
                  <p>
                    Customers receive a link to compare plans, see inclusions,
                    and choose their AMC — no PDFs, no calls, no confusion.
                  </p>
                </div>
              </div>

              <div className="touch-card reveal reveal-d2">
                <div className="touch-preview">
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--text3)",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: "9px",
                    }}
                  >
                    Visit confirmation
                  </div>
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--r-md)",
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text)",
                        marginBottom: "4px",
                      }}
                    >
                      Service visit scheduled
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--text2)",
                        marginBottom: "8px",
                      }}
                    >
                      Panel cleaning + inverter check
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "4px",
                      }}
                    >
                      <i
                        className="ti ti-calendar"
                        style={{ fontSize: "12px", color: "var(--teal-600)" }}
                      />
                      <span
                        style={{ fontSize: "10px", color: "var(--teal-600)" }}
                      >
                        Tue, 14 Jan · 10:00 AM
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <i
                        className="ti ti-user"
                        style={{ fontSize: "12px", color: "var(--text3)" }}
                      />
                      <span style={{ fontSize: "10px", color: "var(--text2)" }}>
                        Technician: Ramesh V.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="touch-body">
                  <h3>Automatic visit confirmations</h3>
                  <p>
                    Customers know who's coming, when, and for what — before
                    they even think to ask. Zero support calls.
                  </p>
                </div>
              </div>

              <div className="touch-card reveal reveal-d3">
                <div className="touch-preview">
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--text3)",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: "9px",
                    }}
                  >
                    Service report
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "10px", color: "var(--text2)" }}>
                        Annual generation
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "var(--success)",
                        }}
                      >
                        7,240 kWh
                      </span>
                    </div>
                    <div
                      style={{
                        height: "5px",
                        background: "var(--border)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "79%",
                          height: "100%",
                          background: "var(--success)",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "10px", color: "var(--text2)" }}>
                        System health score
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "var(--teal-600)",
                        }}
                      >
                        94 / 100
                      </span>
                    </div>
                    <div
                      style={{
                        height: "5px",
                        background: "var(--border)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "94%",
                          height: "100%",
                          background: "var(--teal-600)",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="touch-body">
                  <h3>Digital performance reports</h3>
                  <p>
                    After every visit, customers get a branded report with work
                    done, health score, and next recommended action.
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{ marginBottom: "14px", maxWidth: "580px" }}
              className="reveal"
            >
              <div className="section-eye">Impact by numbers</div>
            </div>
            <div className="g4">
              <div className="metric-card reveal reveal-d1">
                <div
                  className="metric-num"
                  style={{ color: "var(--teal-600)" }}
                >
                  85%
                </div>
                <div className="metric-lbl">
                  avg. AMC renewal rate for Solarplan companies vs 43% industry
                  average
                </div>
              </div>
              <div className="metric-card reveal reveal-d2">
                <div
                  className="metric-num"
                  style={{ color: "var(--amber-600)" }}
                >
                  3×
                </div>
                <div className="metric-lbl">
                  faster service scheduling vs manual coordination with Excel
                  and WhatsApp
                </div>
              </div>
              <div className="metric-card reveal reveal-d3">
                <div className="metric-num" style={{ color: "var(--success)" }}>
                  −60%
                </div>
                <div className="metric-lbl">
                  drop in customer support calls after the live portal goes live
                </div>
              </div>
              <div className="metric-card reveal reveal-d4">
                <div className="metric-num">₹2.4L</div>
                <div className="metric-lbl">
                  avg. additional annual revenue recovered per field technician
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="alt" id="how-it-works">
          <div className="container">
            <div className="reveal" style={{ maxWidth: "560px" }}>
              <div className="section-eye">How it works</div>
              <h2>Set up in a day. Running in a week.</h2>
              <p className="lead">
                Solarplan is built for solar companies, not enterprise IT teams.
                You're live before the end of the week.
              </p>
            </div>
            <div className="steps">
              <div className="step reveal reveal-d1">
                <div className="step-num amber">1</div>
                <div className="step-content">
                  <h3>Build your AMC plans</h3>
                  <p>
                    Create your service bundles — define services, frequencies,
                    and pricing for each tier. Solarplan generates a branded
                    public link you can share with every new customer or embed
                    on your website.
                  </p>
                </div>
              </div>
              <div className="step reveal reveal-d2">
                <div className="step-num teal">2</div>
                <div className="step-content">
                  <h3>Import your customer base</h3>
                  <p>
                    Add existing customers and map each to their AMC tier.
                    Solarplan auto-generates the complete service schedule for
                    the year — monthly cleanings, half-yearly audits, quarterly
                    checks, all planned automatically.
                  </p>
                </div>
              </div>
              <div className="step reveal reveal-d3">
                <div className="step-num teal">3</div>
                <div className="step-content">
                  <h3>Dispatch and track field visits</h3>
                  <p>
                    Assign technicians, track visit status in real time, and
                    collect digital service sign-offs on-site. Customers receive
                    automatic updates at every stage — no calls, no follow-ups.
                  </p>
                </div>
              </div>
              <div className="step reveal reveal-d4">
                <div className="step-num gray">4</div>
                <div className="step-content">
                  <h3>Renew, upsell, and grow</h3>
                  <p>
                    Get renewal alerts 60 days before expiry, identify upgrade
                    opportunities, and track your entire AMC portfolio revenue
                    from one dashboard. After-sale becomes your most predictable
                    revenue line.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cta">
          <div className="container">
            <div className="final-cta-box reveal">
              <div
                className="section-eye"
                style={{ justifyContent: "center", marginBottom: "16px" }}
              >
                <i className="ti ti-rocket" aria-hidden="true" />
                Start for free
              </div>
              <h2>Ready to professionalize your solar service?</h2>
              <p className="lead">
                Join solar companies delivering transparent, on-time service —
                and turning after-sale into their biggest revenue driver.
              </p>
              <div className="final-cta-btns">
                <Button
                  className="btn-primary-lg"
                  onClick={() =>
                    (window.location.href = "https://wa.me/+917597204168")
                  }
                >
                  Start now — contact us{" "}
                  <i className="ti ti-arrow-right" aria-hidden="true" />
                </Button>
                <Button
                  className="btn-ghost-lg"
                  onClick={() =>
                    (window.location.href = "https://wa.me/+917597204168")
                  }
                >
                  Book a 20-min demo
                </Button>
              </div>
              <p className="final-cta-note">
                Free 30-day trial &nbsp;·&nbsp; Full features &nbsp;·&nbsp;
                Setup support included
              </p>
            </div>
          </div>
        </section>

        {children}
      </main>

      <footer>
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <div
                className="nav-mark"
                style={{
                  background: "rgba(255,255,255,.08)",
                  borderColor: "rgba(255,255,255,.12)",
                }}
                aria-hidden="true"
              >
                <i
                  className="ti ti-solar-panel"
                  style={{ color: "var(--amber-400)" }}
                />
              </div>
              <span className="footer-name">Solarplan</span>
            </div>
            <div className="footer-links">
              <a href="#">Product</a>
              <a href="#">Pricing</a>
              <a href="#">Blog</a>
              <a href="#">Privacy</a>
              <a href="mailto:hello@solarplan.app">Contact</a>
            </div>
            <span className="footer-copy">
              © 2026 Solarplan. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
