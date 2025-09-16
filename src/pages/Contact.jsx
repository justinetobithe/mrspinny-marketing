// src/pages/Contact.jsx
import { useRef, useState } from "react";

export default function Contact() {
    const formRef = useRef(null);
    const [sending, setSending] = useState(false);
    const [noteVisible, setNoteVisible] = useState(false);

    const onSubmit = (e) => {
        e.preventDefault();
        const f = formRef.current;
        if (!f.checkValidity()) {
            f.reportValidity();
            return;
        }
        setSending(true);
        setTimeout(() => {
            setSending(false);
            f.reset();
            setNoteVisible(true);
            setTimeout(() => setNoteVisible(false), 4000);
        }, 800);
    };

    return (
        <main>
            <section className="container contact-head">
                <h1>
                    Contact <span>Support</span>
                </h1>
                <p className="contact-sub">
                    We’re here 24/7. Reach out and we’ll get back to you fast.
                </p>
            </section>

            <section className="container contact-cards">
                <article className="contact-card">
                    <div className="contact-ico">✉️</div>
                    <div>
                        <h3>Email Support</h3>
                        <p>For account, payments, or technical questions.</p>
                        <a className="btn btn-primary" href="mailto:support@mrspinny.com">
                            support@mrspinny.com
                        </a>
                    </div>
                </article>

                <article className="contact-card">
                    <div className="contact-ico">💬</div>
                    <div>
                        <h3>Live Chat</h3>
                        <p>Get real-time help from our team.</p>
                        <a className="btn btn-outline" href="#">
                            Open Chat
                        </a>
                    </div>
                </article>

                <article className="contact-card">
                    <div className="contact-ico">🛡️</div>
                    <div>
                        <h3>Responsible Gaming</h3>
                        <p>Need a break, limits, or advice? We can help.</p>
                        <a className="btn btn-outline" href="#">
                            Learn More
                        </a>
                    </div>
                </article>
            </section>

            <section className="container contact-grid">
                <form
                    id="contactForm"
                    className="contact-form"
                    ref={formRef}
                    noValidate
                    onSubmit={onSubmit}
                >
                    <h2 className="section-title">📨 Send us a message</h2>

                    <div className="form-field">
                        <label htmlFor="name">Full name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="form-input"
                            placeholder="Jane Doe"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="form-input"
                                placeholder="you@email.com"
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="topic">Topic</label>
                            <select id="topic" name="topic" className="form-input" defaultValue="General">
                                <option value="General">General</option>
                                <option value="Payments">Payments</option>
                                <option value="Account">Account &amp; Verification</option>
                                <option value="Technical">Technical</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="msg">Message</label>
                        <textarea
                            id="msg"
                            name="message"
                            className="form-input"
                            rows={6}
                            placeholder="How can we help?"
                            required
                        />
                    </div>

                    <label className="consent">
                        <input type="checkbox" id="agree" required /> I agree to the processing of my
                        message for support purposes.
                    </label>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" id="sendBtn" disabled={sending}>
                            {sending ? "Sending…" : "Send Message"}
                        </button>
                        <p
                            id="formNote"
                            className="form-note"
                            aria-live="polite"
                            hidden={!noteVisible}
                        >
                            Thanks! Your message has been sent.
                        </p>
                    </div>

                    <small className="contact-note">
                        We’ll never ask for your password or 2FA codes.
                    </small>
                </form>

                <aside className="contact-aside">
                    <h3>Company details</h3>
                    <ul className="contact-list">
                        <li>
                            <b>Operator:</b> Decordetails OÜ
                        </li>
                        <li>
                            <b>Reg. no:</b> 17011692
                        </li>
                        <li>
                            <b>Address:</b> Tornimäe tn 5, Kesklinna linnaosa, Tallinn, 10145, Harju maakond
                        </li>
                        <li>
                            <b>Email:</b>{" "}
                            <a href="mailto:support@mrspinny.com">support@mrspinny.com</a>
                        </li>
                        <li>
                            <b>Hours:</b> 24/7
                        </li>
                    </ul>

                    <h3>Response times</h3>
                    <ul className="contact-list">
                        <li>Email: within 6–12 hours</li>
                        <li>Chat: instant (queue-based)</li>
                        <li>Payments: same day on supported methods</li>
                    </ul>

                    <h3>Quick links</h3>
                    <div className="contact-links">
                        <a className="pill" href="/banking">
                            Banking
                        </a>
                        <a className="pill" href="/live-casino">
                            Live Casino
                        </a>
                        <a className="pill" href="/slots">
                            Slots
                        </a>
                    </div>
                </aside>
            </section>
        </main>
    );
}
