// src/pages/Contact.jsx
import { useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import emailjs from "@emailjs/browser";
import { logLead, logClick } from "@/helpers/logging";
import { getAffiliateParams } from "@/helpers/storage";

export default function Contact() {
    const { t } = useTranslation();
    const formRef = useRef(null);
    const [sending, setSending] = useState(false);
    const [noteVisible, setNoteVisible] = useState(false);
    const [error, setError] = useState("");

    const SUPPORT_EMAIL = "support@mrspinny.com";
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const trackClick = useCallback((linkId, extra = {}) => {
        try {
            const aff = getAffiliateParams();
            logClick({ affParams: aff, linkId, ...extra });
        } catch { }
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        const f = formRef.current;
        if (!f.checkValidity()) {
            f.reportValidity();
            return;
        }
        if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
            setError("Email service is not configured.");
            setNoteVisible(true);
            setTimeout(() => setNoteVisible(false), 5000);
            return;
        }

        setSending(true);
        setError("");

        try {
            await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, f, { publicKey: PUBLIC_KEY });
            const data = new FormData(f);
            await logLead({
                status: "contact",
                extra: {
                    linkId: "contact_form",
                    email: data.get("email") || "",
                    name: data.get("name") || "",
                    topic: data.get("topic") || ""
                }
            });
            setSending(false);
            f.reset();
            setNoteVisible(true);
            setTimeout(() => setNoteVisible(false), 5000);
        } catch {
            setSending(false);
            setError("Failed to send. Please try again.");
            setNoteVisible(true);
            setTimeout(() => setNoteVisible(false), 5000);
        }
    };

    return (
        <main>
            <section className="container contact-head">
                <h1>
                    {t("contact.hero.titleA")} <span>{t("contact.hero.titleB")}</span>
                </h1>
                <p className="contact-sub">{t("contact.hero.subtitle")}</p>
            </section>

            <section className="container contact-cards">
                <article className="contact-card">
                    <div className="contact-ico">✉️</div>
                    <div>
                        <h3>{t("contact.cards.email.title")}</h3>
                        <p>{t("contact.cards.email.desc")}</p>
                        <a
                            className="btn btn-primary"
                            href={`mailto:${SUPPORT_EMAIL}`}
                            data-link-id="contact_email_cta"
                            onClick={() => trackClick("contact_email_cta")}
                        >
                            {t("contact.cards.email.cta", { email: SUPPORT_EMAIL })}
                        </a>
                    </div>
                </article>

                <article className="contact-card">
                    <div className="contact-ico">💬</div>
                    <div>
                        <h3>{t("contact.cards.chat.title")}</h3>
                        <p>{t("contact.cards.chat.desc")}</p>
                        <a
                            className="btn btn-outline"
                            href="#"
                            data-link-id="contact_chat_cta"
                            onClick={() => trackClick("contact_chat_cta")}
                        >
                            {t("contact.cards.chat.cta")}
                        </a>
                    </div>
                </article>

                <article className="contact-card">
                    <div className="contact-ico">🛡️</div>
                    <div>
                        <h3>{t("contact.cards.rg.title")}</h3>
                        <p>{t("contact.cards.rg.desc")}</p>
                        <a
                            className="btn btn-outline"
                            href="#"
                            data-link-id="contact_rg_cta"
                            onClick={() => trackClick("contact_rg_cta")}
                        >
                            {t("contact.cards.rg.cta")}
                        </a>
                    </div>
                </article>
            </section>

            <section className="container contact-grid">
                <form id="contactForm" className="contact-form" ref={formRef} noValidate onSubmit={onSubmit}>
                    <h2 className="section-title">{t("contact.form.title")}</h2>

                    <div className="form-field">
                        <label htmlFor="name">{t("contact.form.name.label")}</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="form-input"
                            placeholder={t("contact.form.name.ph")}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="email">{t("contact.form.email.label")}</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="form-input"
                                placeholder={t("contact.form.email.ph")}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="topic">{t("contact.form.topic.label")}</label>
                            <select id="topic" name="topic" className="form-input" defaultValue="general">
                                <option value="general">{t("contact.form.topic.options.general")}</option>
                                <option value="payments">{t("contact.form.topic.options.payments")}</option>
                                <option value="account">{t("contact.form.topic.options.account")}</option>
                                <option value="technical">{t("contact.form.topic.options.technical")}</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="msg">{t("contact.form.message.label")}</label>
                        <textarea
                            id="msg"
                            name="message"
                            className="form-input"
                            rows={6}
                            placeholder={t("contact.form.message.ph")}
                            required
                        />
                    </div>

                    <input type="hidden" name="to_email" value={SUPPORT_EMAIL} />

                    <label className="consent">
                        <input type="checkbox" id="agree" required /> {t("contact.form.consent")}
                    </label>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" id="sendBtn" disabled={sending}>
                            {sending ? t("contact.form.sending") : t("contact.form.send")}
                        </button>
                        <p id="formNote" className="form-note" aria-live="polite" hidden={!noteVisible}>
                            {error ? error : t("contact.form.note")}
                        </p>
                    </div>

                    <small className="contact-note">{t("contact.form.securityNote")}</small>
                </form>

                <aside className="contact-aside">
                    <h3>{t("contact.aside.company.title")}</h3>
                    <ul className="contact-list">
                        <li>
                            <b>{t("contact.aside.company.operator")}</b> {t("contact.aside.company.operatorName")}
                        </li>
                        <li>
                            <b>{t("contact.aside.company.reg")}</b> {t("contact.aside.company.regNo")}
                        </li>
                        <li>
                            <b>{t("contact.aside.company.addressLabel")}</b> {t("contact.aside.company.address")}
                        </li>
                        <li>
                            <b>{t("contact.aside.company.emailLabel")}</b>{" "}
                            <a
                                href={`mailto:${SUPPORT_EMAIL}`}
                                data-link-id="contact_aside_email"
                                onClick={() => trackClick("contact_aside_email")}
                            >
                                {t("contact.cards.email.cta", { email: SUPPORT_EMAIL })}
                            </a>
                        </li>
                        <li>
                            <b>{t("contact.aside.company.hours")}</b> {t("contact.aside.company.hoursValue")}
                        </li>
                    </ul>

                    <h3>{t("contact.aside.response.title")}</h3>
                    <ul className="contact-list">
                        <li>{t("contact.aside.response.email")}</li>
                        <li>{t("contact.aside.response.chat")}</li>
                        <li>{t("contact.aside.response.payments")}</li>
                    </ul>

                    <h3>{t("contact.aside.links.title")}</h3>
                    <div className="contact-links">
                        <a
                            className="pill"
                            href="/banking"
                            data-link-id="contact_link_banking"
                            onClick={() => trackClick("contact_link_banking")}
                        >
                            {t("header.nav.banking")}
                        </a>
                        <a
                            className="pill"
                            href="/live-casino"
                            data-link-id="contact_link_live"
                            onClick={() => trackClick("contact_link_live")}
                        >
                            {t("header.nav.liveCasino")}
                        </a>
                        <a
                            className="pill"
                            href="/slots"
                            data-link-id="contact_link_slots"
                            onClick={() => trackClick("contact_link_slots")}
                        >
                            {t("header.nav.slots")}
                        </a>
                    </div>
                </aside>
            </section>
        </main>
    );
}
