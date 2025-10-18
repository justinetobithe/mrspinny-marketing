// src/pages/Banking.jsx
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { affUrl } from "@/helpers/urls";
import { logClick } from "@/helpers/logging";
import { getAffiliateParams } from "@/helpers/storage";

export default function Banking() {
    const { t } = useTranslation();
    const domain = "https://mrspinny.world";

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);

    const trackClick = useCallback((linkId, extra = {}) => {
        try {
            const aff = getAffiliateParams();
            logClick({ affParams: aff, linkId, ...extra });
        } catch { }
    }, []);

    return (
        <>
            <section className="hero" style={{ backgroundImage: "url('/assets/images/banner-4.png')" }}>
                <div className="hero-blur" aria-hidden="true" />
                <div className="hero-content">
                    <h1>
                        {t("banking.hero.titleA")} <span>{t("banking.hero.titleB")}</span>
                    </h1>
                    <p>{t("banking.hero.subtitle")}</p>
                    <a
                        href={affUrl(domain)}
                        className="btn btn-primary"
                        data-link-id="banking_hero_play"
                        onClick={() => trackClick("banking_hero_play")}
                    >
                        {t("banking.hero.cta")}
                    </a>
                </div>
            </section>

            <section className="container bank-intro">
                <div className="bank-usp">
                    <div className="bank-usp-item">
                        <div className="bank-usp-icon">⚡</div>
                        <div>
                            <h3>{t("banking.usp.instant.title")}</h3>
                            <p>{t("banking.usp.instant.desc")}</p>
                        </div>
                    </div>
                    <div className="bank-usp-item">
                        <div className="bank-usp-icon">🔒</div>
                        <div>
                            <h3>{t("banking.usp.secure.title")}</h3>
                            <p>{t("banking.usp.secure.desc")}</p>
                        </div>
                    </div>
                    <div className="bank-usp-item">
                        <div className="bank-usp-icon">💸</div>
                        <div>
                            <h3>{t("banking.usp.payouts.title")}</h3>
                            <p>{t("banking.usp.payouts.desc")}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container bank-methods" aria-label={t("banking.methods.title")}>
                <h2>{t("banking.methods.title")}</h2>
                <div className="bank-table-wrap">
                    <table className="bank-table">
                        <thead>
                            <tr>
                                <th>{t("banking.methods.table.headers.method")}</th>
                                <th>{t("banking.methods.table.headers.type")}</th>
                                <th>{t("banking.methods.table.headers.deposit")}</th>
                                <th>{t("banking.methods.table.headers.withdrawal")}</th>
                                <th>{t("banking.methods.table.headers.processing")}</th>
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
                                <td><span className="pill">{t("banking.methods.table.types.card")}</span></td>
                                <td>{t("banking.methods.table.speed.instant")}</td>
                                <td>{t("banking.methods.table.speed.d1_3_business_days")}</td>
                                <td>{t("banking.methods.table.fees.noFees")}</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="method-cell">
                                        <span className="method-badge">Skrill</span>
                                    </div>
                                </td>
                                <td><span className="pill">{t("banking.methods.table.types.ewallet")}</span></td>
                                <td>{t("banking.methods.table.speed.instant")}</td>
                                <td>{t("banking.methods.table.speed.h24")}</td>
                                <td>{t("banking.methods.table.fees.noFees")}</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="method-cell">
                                        <span className="method-badge">Neteller</span>
                                    </div>
                                </td>
                                <td><span className="pill">{t("banking.methods.table.types.ewallet")}</span></td>
                                <td>{t("banking.methods.table.speed.instant")}</td>
                                <td>{t("banking.methods.table.speed.h24")}</td>
                                <td>{t("banking.methods.table.fees.noFees")}</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="method-cell">
                                        <span className="method-badge">{t("banking.methods.names.bankTransfer")}</span>
                                    </div>
                                </td>
                                <td><span className="pill">{t("banking.methods.table.types.bank")}</span></td>
                                <td>{t("banking.methods.table.speed.d1_2_business_days")}</td>
                                <td>{t("banking.methods.table.speed.d2_4_business_days")}</td>
                                <td>{t("banking.methods.table.fees.bankFees")}</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="method-cell">
                                        <span className="method-badge">Bitcoin</span>
                                        <span className="method-badge">USDT</span>
                                    </div>
                                </td>
                                <td><span className="pill">{t("banking.methods.table.types.crypto")}</span></td>
                                <td>{t("banking.methods.table.speed.m10_20")}</td>
                                <td>{t("banking.methods.table.speed.m10_60")}</td>
                                <td>{t("banking.methods.table.fees.networkFees")}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="bank-note">{t("banking.methods.note")}</p>
            </section>

            <section className="container bank-panels">
                <article className="bank-card">
                    <h3>{t("banking.steps.deposit.title")}</h3>
                    <ol className="bank-steps">
                        <li>{t("banking.steps.deposit.items.0")}</li>
                        <li>{t("banking.steps.deposit.items.1")}</li>
                        <li>{t("banking.steps.deposit.items.2")}</li>
                        <li>{t("banking.steps.deposit.items.3")}</li>
                    </ol>
                </article>
                <article className="bank-card">
                    <h3>{t("banking.steps.withdrawal.title")}</h3>
                    <ol className="bank-steps">
                        <li>{t("banking.steps.withdrawal.items.0")}</li>
                        <li>{t("banking.steps.withdrawal.items.1")}</li>
                        <li>{t("banking.steps.withdrawal.items.2")}</li>
                        <li>{t("banking.steps.withdrawal.items.3")}</li>
                    </ol>
                </article>
                <article className="bank-card">
                    <h3>{t("banking.limits.title")}</h3>
                    <ul className="bank-limits">
                        <li>{t("banking.limits.minDeposit")} <b>$10</b></li>
                        <li>{t("banking.limits.minWithdrawal")} <b>$20</b></li>
                        <li>{t("banking.limits.dailyCap")} <b>$5,000</b></li>
                        <li>{t("banking.limits.vip")}</li>
                    </ul>
                </article>
            </section>

            <section className="container bank-help">
                <div className="bank-help-card">
                    <div>
                        <h3>{t("banking.help.title")}</h3>
                        <p>{t("banking.help.desc")}</p>
                    </div>
                </div>
                <div className="bank-help-actions">
                    <a
                        href="#"
                        className="btn btn-outline"
                        data-link-id="banking_help_chat"
                        onClick={() => trackClick("banking_help_chat")}
                    >
                        {t("banking.help.chat")}
                    </a>
                    <a
                        href="mailto:support@mrspinny.com"
                        className="btn btn-primary"
                        data-link-id="banking_help_email"
                        onClick={() => trackClick("banking_help_email")}
                    >
                        {t("banking.help.email")}
                    </a>
                </div>
            </section>

            <section className="container bank-terms">
                <p className="bank-terms-note">
                    {t("banking.terms.wagering", { times: 50 })}
                </p>
            </section>
        </>
    );
}
