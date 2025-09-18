import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Contact() {
    const { t } = useTranslation();
    const formRef = useRef(null);
    const [sending, setSending] = useState(false);
    const [noteVisible, setNoteVisible] = useState(false);

    const SUPPORT_EMAIL = "support@mrspinny.com";

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
                        <a className="btn btn-primary" href={`mailto:${SUPPORT_EMAIL}`}>
                            {t("contact.cards.email.cta", { email: SUPPORT_EMAIL })}
                        </a>
                    </div>
                </article>

                <article className="contact-card">
                    <div className="contact-ico">💬</div>
                    <div>
                        <h3>{t("contact.cards.chat.title")}</h3>
                        <p>{t("contact.cards.chat.desc")}</p>
                        <a className="btn btn-outline" href="#">
                            {t("contact.cards.chat.cta")}
                        </a>
                    </div>
                </article>

                <article className="contact-card">
                    <div className="contact-ico">🛡️</div>
                    <div>
                        <h3>{t("contact.cards.rg.title")}</h3>
                        <p>{t("contact.cards.rg.desc")}</p>
                        <a className="btn btn-outline" href="#">
                            {t("contact.cards.rg.cta")}
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
                            <select
                                id="topic"
                                name="topic"
                                className="form-input"
                                defaultValue="general"
                            >
                                <option value="general">
                                    {t("contact.form.topic.options.general")}
                                </option>
                                <option value="payments">
                                    {t("contact.form.topic.options.payments")}
                                </option>
                                <option value="account">
                                    {t("contact.form.topic.options.account")}
                                </option>
                                <option value="technical">
                                    {t("contact.form.topic.options.technical")}
                                </option>
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

                    <label className="consent">
                        <input type="checkbox" id="agree" required />{" "}
                        {t("contact.form.consent")}
                    </label>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" id="sendBtn" disabled={sending}>
                            {sending ? t("contact.form.sending") : t("contact.form.send")}
                        </button>
                        <p
                            id="formNote"
                            className="form-note"
                            aria-live="polite"
                            hidden={!noteVisible}
                        >
                            {t("contact.form.note")}
                        </p>
                    </div>

                    <small className="contact-note">
                        {t("contact.form.securityNote")}
                    </small>
                </form>

                <aside className="contact-aside">
                    <h3>{t("contact.aside.company.title")}</h3>
                    <ul className="contact-list">
                        <li>
                            <b>{t("contact.aside.company.operator")}</b>{" "}
                            {t("contact.aside.company.operatorName")}
                        </li>
                        <li>
                            <b>{t("contact.aside.company.reg")}</b>{" "}
                            {t("contact.aside.company.regNo")}
                        </li>
                        <li>
                            <b>{t("contact.aside.company.addressLabel")}</b>{" "}
                            {t("contact.aside.company.address")}
                        </li>
                        <li>
                            <b>{t("contact.aside.company.emailLabel")}</b>{" "}
                            <a href={`mailto:${SUPPORT_EMAIL}`}>
                                {t("contact.cards.email.cta", { email: SUPPORT_EMAIL })}
                            </a>
                        </li>
                        <li>
                            <b>{t("contact.aside.company.hours")}</b>{" "}
                            {t("contact.aside.company.hoursValue")}
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
                        <a className="pill" href="/banking">
                            {t("header.nav.banking")}
                        </a>
                        <a className="pill" href="/live-casino">
                            {t("header.nav.liveCasino")}
                        </a>
                        <a className="pill" href="/slots">
                            {t("header.nav.slots")}
                        </a>
                    </div>
                </aside>
            </section>
        </main>
    );
}
