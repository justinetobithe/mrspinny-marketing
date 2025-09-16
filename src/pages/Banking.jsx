// src/pages/Banking.jsx
export default function Banking() {
    return (
        <>
            <section
                className="hero"
                style={{ backgroundImage: "url('/assets/images/banner-4.png')" }}
            >
                <div className="hero-blur" aria-hidden="true" />
                <div className="hero-content">
                    <h1>
                        Fast & Secure <span>Banking</span>
                    </h1>
                    <p>Instant deposits, swift withdrawals, and trusted payment options.</p>
                    <a href="#" className="btn btn-primary">Create Account</a>
                </div>
            </section>

            <section className="container bank-intro">
                <div className="bank-usp">
                    <div className="bank-usp-item">
                        <div className="bank-usp-icon">⚡</div>
                        <div>
                            <h3>Instant Deposits</h3>
                            <p>Top up instantly with cards, e-wallets, and crypto.</p>
                        </div>
                    </div>
                    <div className="bank-usp-item">
                        <div className="bank-usp-icon">🔒</div>
                        <div>
                            <h3>Secure</h3>
                            <p>Encrypted payments and account-level protections.</p>
                        </div>
                    </div>
                    <div className="bank-usp-item">
                        <div className="bank-usp-icon">💸</div>
                        <div>
                            <h3>Fast Payouts</h3>
                            <p>Same-day processing on supported methods.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container bank-methods">
                <h2>Payment Methods</h2>
                <div className="bank-table-wrap">
                    <table className="bank-table">
                        <thead>
                            <tr>
                                <th>Method</th>
                                <th>Type</th>
                                <th>Deposit</th>
                                <th>Withdrawal</th>
                                <th>Processing</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="method-cell">
                                        <span className="method-badge">VISA</span>
                                        <span className="method-badge">Mastercard</span>
                                    </div>
                                </td>
                                <td><span className="pill">Card</span></td>
                                <td>Instant</td>
                                <td>1–3 business days</td>
                                <td>No fees from us</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="method-cell">
                                        <span className="method-badge">Skrill</span>
                                    </div>
                                </td>
                                <td><span className="pill">E-wallet</span></td>
                                <td>Instant</td>
                                <td>Up to 24 hours</td>
                                <td>No fees from us</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="method-cell">
                                        <span className="method-badge">Neteller</span>
                                    </div>
                                </td>
                                <td><span className="pill">E-wallet</span></td>
                                <td>Instant</td>
                                <td>Up to 24 hours</td>
                                <td>No fees from us</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="method-cell">
                                        <span className="method-badge">Bank Transfer</span>
                                    </div>
                                </td>
                                <td><span className="pill">Bank</span></td>
                                <td>1–2 business days</td>
                                <td>2–4 business days</td>
                                <td>Bank fees may apply</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="method-cell">
                                        <span className="method-badge">Bitcoin</span>
                                        <span className="method-badge">USDT</span>
                                    </div>
                                </td>
                                <td><span className="pill">Crypto</span></td>
                                <td>~10–20 min</td>
                                <td>~10–60 min</td>
                                <td>Network fees apply</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="bank-note">
                    Times and availability vary by provider, currency, and verification status. Limits apply.
                </p>
            </section>

            <section className="container bank-panels">
                <article className="bank-card">
                    <h3>Deposit Steps</h3>
                    <ol className="bank-steps">
                        <li>Sign in to your account.</li>
                        <li>Open Cashier → Deposit.</li>
                        <li>Select a method and amount.</li>
                        <li>Confirm and complete payment.</li>
                    </ol>
                </article>
                <article className="bank-card">
                    <h3>Withdrawal Steps</h3>
                    <ol className="bank-steps">
                        <li>Verify your profile if prompted.</li>
                        <li>Open Cashier → Withdraw.</li>
                        <li>Choose a payout method.</li>
                        <li>Submit request and track status.</li>
                    </ol>
                </article>
                <article className="bank-card">
                    <h3>Limits</h3>
                    <ul className="bank-limits">
                        <li>Minimum deposit: <b>$10</b></li>
                        <li>Minimum withdrawal: <b>$20</b></li>
                        <li>Daily withdrawal cap: <b>$5,000</b></li>
                        <li>Higher limits available for VIPs</li>
                    </ul>
                </article>
            </section>

            <section className="container bank-help">
                <div className="bank-help-card">
                    <div>
                        <h3>Need help with a payment?</h3>
                        <p>Our team is here 24/7 to assist with deposits, withdrawals, or verification.</p>
                    </div>
                    <div className="bank-help-actions">
                        <a href="#" className="btn btn-outline">Live Chat</a>
                        <a href="mailto:support@mrspinny.com" className="btn btn-primary">Email Support</a>
                    </div>
                </div>
            </section>
        </>
    );
}
