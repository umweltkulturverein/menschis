"use client";

import { useState } from "react";

const IMPRINT_URL = "https://organicbeats.org/impressum/";

type Lang = "de" | "en";

export default function Privacy() {
    const [lang, setLang] = useState<Lang>("de");

    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    {lang === "de" ? "Datenschutzerklärung" : "Privacy Policy"}
                </h1>
                <div className="flex overflow-hidden rounded-md border border-ci-green-300 text-sm">
                    <button
                        onClick={() => setLang("de")}
                        className={`px-3 py-1 transition-colors ${
                            lang === "de"
                                ? "bg-ci-green-300 text-white"
                                : "text-ci-green-400 hover:bg-ci-green-100 dark:text-ci-green-200 dark:hover:bg-ci-blue-600"
                        }`}
                    >
                        DE
                    </button>
                    <button
                        onClick={() => setLang("en")}
                        className={`px-3 py-1 transition-colors ${
                            lang === "en"
                                ? "bg-ci-green-300 text-white"
                                : "text-ci-green-400 hover:bg-ci-green-100 dark:text-ci-green-200 dark:hover:bg-ci-blue-600"
                        }`}
                    >
                        EN
                    </button>
                </div>
            </div>

            {lang === "de" ? <GermanContent /> : <EnglishContent />}
        </main>
    );
}

function GermanContent() {
    return (
        <div className="space-y-8">
            <p>
                Diese Anwendung („Menschis“) ist das Helfer*innen-Planungstool
                des umweltkulturverein e.V. Im Folgenden informieren wir über die
                Verarbeitung personenbezogener Daten gemäß der
                Datenschutz-Grundverordnung (DSGVO).
            </p>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">1. Verantwortlicher</h2>
                <div className="mt-2">
                    <p className="font-semibold">umweltkulturverein e.V.</p>
                    <p>Goslarsche Straße 99</p>
                    <p>38118 Braunschweig</p>
                    <p>Deutschland</p>
                    <img
                        src="/pics/umku/email.png"
                        alt="E-Mail-Adresse"
                        className="mt-1 h-5"
                    />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Weitere Angaben finden Sie im{" "}
                    <a
                        className="underline"
                        href={IMPRINT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Impressum
                    </a>
                    .
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    2. Welche Daten wir verarbeiten
                </h2>

                <h3 className="mt-4 font-semibold">a) Kontodaten</h3>
                <ul className="list-disc space-y-1 pl-6">
                    <li>Name</li>
                    <li>E-Mail-Adresse</li>
                    <li>Telefonnummer (sofern freiwillig angegeben)</li>
                </ul>

                <h3 className="mt-4 font-semibold">b) Schichtdaten</h3>
                <ul className="list-disc space-y-1 pl-6">
                    <li>Name, mit dem Sie sich für eine Schicht eintragen</li>
                    <li>freiwillige Notizen zu einem Schichteintrag</li>
                    <li>
                        ggf. eine Referenz auf eine erstellte Ticket-Bestellung
                        (siehe Abschnitt 5)
                    </li>
                </ul>

                <h3 className="mt-4 font-semibold">
                    c) Server-Logfiles und Reichweitenmessung
                </h3>
                <p>
                    Beim Aufruf der Anwendung werden technische Zugriffsdaten
                    (z. B. IP-Adresse, Zeitpunkt des Zugriffs, aufgerufene Seite,
                    Browsertyp) verarbeitet, die für die Auslieferung und den
                    sicheren Betrieb erforderlich sind. Zur statistischen
                    Auswertung der Nutzung setzen wir zusätzlich das
                    Analyse-Werkzeug Umami ein. Umami arbeitet datensparsam,
                    verwendet keine Cookies und erstellt ausschließlich
                    anonymisierte Nutzungsstatistiken; personenbezogene Profile
                    werden nicht gebildet.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    3. E-Mail-Versand (Login-Link &amp; Bestätigungen)
                </h2>
                <p>
                    Wir versenden E-Mails über einen SMTP-Server, um Ihnen
                    Anmeldelinks („Magic Links“) zuzustellen und
                    Schichtanmeldungen zu bestätigen. Hierfür werden Ihre
                    E-Mail-Adresse und Ihr Name verarbeitet. Für die Anmeldung
                    wird zudem ein Login-Token erzeugt und gespeichert.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    4. Spam-Schutz mit Cloudflare Turnstile
                </h2>
                <p>
                    Zum Schutz unserer Formulare vor automatisiertem Missbrauch
                    setzen wir den Dienst „Turnstile“ der Cloudflare, Inc. (USA)
                    ein. Dabei wird ein Prüf-Token an Cloudflare übermittelt und
                    dort ausgewertet; hierbei kann auch Ihre IP-Adresse
                    verarbeitet und in die USA übermittelt werden. Die
                    Übermittlung wird auf geeignete Garantien (insbesondere
                    Standardvertragsklauseln) gestützt. Rechtsgrundlage ist unser
                    berechtigtes Interesse an der Sicherheit der Anwendung (Art. 6
                    Abs. 1 lit. f DSGVO).
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    5. Ticket-Erstellung über Pretix
                </h2>
                <p>
                    Sofern für eine Veranstaltung aktiviert, wird bei der
                    Schichtanmeldung über den Ticketing-Dienst „pretix“
                    (pretix.eu, betrieben durch die pretix GmbH) eine
                    Ticket-Bestellung erstellt. Hierzu werden Ihr Name und Ihre
                    E-Mail-Adresse an pretix übermittelt. Für die Verarbeitung bei
                    pretix gilt deren eigene{" "}
                    <a
                        className="underline"
                        href="https://pretix.eu/about/de/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Datenschutzerklärung
                    </a>
                    .
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">6. Rechtsgrundlagen</h2>
                <p>
                    Die Verarbeitung Ihrer Konto- und Schichtdaten sowie der
                    Versand zugehöriger E-Mails erfolgen zur Durchführung der
                    Helfer*innen-Planung (Art. 6 Abs. 1 lit. b und lit. f DSGVO).
                    Spam-Schutz, technische Logfiles und die Reichweitenmessung
                    beruhen auf unserem berechtigten Interesse an einem sicheren
                    und bedarfsgerechten Betrieb (Art. 6 Abs. 1 lit. f DSGVO).
                    Freiwillige Angaben (z. B. Telefonnummer oder Notizen)
                    verarbeiten wir auf Grundlage Ihrer Einwilligung (Art. 6
                    Abs. 1 lit. a DSGVO).
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">7. Empfänger der Daten</h2>
                <p>
                    Ihre Daten werden nicht an Dritte weitergegeben, außer dies
                    ist zur Erbringung der oben beschriebenen Funktionen
                    erforderlich. Empfänger bzw. Auftragsverarbeiter sind: der
                    Betreiber der Server-Infrastruktur, der E-Mail-/SMTP-Dienst-
                    leister, Cloudflare (Spam-Schutz) sowie – sofern aktiviert –
                    pretix (Ticketing).
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">8. Speicherdauer</h2>
                <p>
                    Wir speichern personenbezogene Daten nur so lange, wie es für
                    die genannten Zwecke erforderlich ist oder gesetzliche
                    Aufbewahrungsfristen dies vorschreiben. Schichtbezogene
                    Einträge werden nach Ablauf der jeweiligen Veranstaltung
                    gelöscht oder anonymisiert, soweit keine weitergehende
                    Aufbewahrung erforderlich ist.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    9. Ihre Rechte als betroffene Person
                </h2>
                <p>Sie haben im Rahmen der DSGVO insbesondere das Recht auf:</p>
                <ul className="list-disc space-y-1 pl-6">
                    <li>Auskunft (Art. 15)</li>
                    <li>Berichtigung (Art. 16)</li>
                    <li>Löschung (Art. 17)</li>
                    <li>Einschränkung der Verarbeitung (Art. 18)</li>
                    <li>Datenübertragbarkeit (Art. 20)</li>
                    <li>Widerspruch gegen die Verarbeitung (Art. 21)</li>
                    <li>
                        Widerruf einer erteilten Einwilligung mit Wirkung für die
                        Zukunft (Art. 7 Abs. 3)
                    </li>
                </ul>
                <p>
                    Zur Ausübung Ihrer Rechte genügt eine formlose Mitteilung an
                    den oben genannten Verantwortlichen. Zudem haben Sie das Recht,
                    sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    10. Automatisierte Entscheidungsfindung
                </h2>
                <p>
                    Eine automatisierte Entscheidungsfindung einschließlich
                    Profiling im Sinne des Art. 22 DSGVO findet nicht statt.
                </p>
            </section>
        </div>
    );
}

function EnglishContent() {
    return (
        <div className="space-y-8">
            <p>
                This application (“Menschis”) is the volunteer scheduling tool of
                umweltkulturverein e.V. The following explains how personal data
                is processed, in accordance with the General Data Protection
                Regulation (GDPR).
            </p>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">1. Controller</h2>
                <div className="mt-2">
                    <p className="font-semibold">umweltkulturverein e.V.</p>
                    <p>Goslarsche Straße 99</p>
                    <p>38118 Braunschweig</p>
                    <p>Germany</p>
                    <img
                        src="/pics/umku/email.png"
                        alt="Email address"
                        className="mt-1 h-5"
                    />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Further details can be found in the{" "}
                    <a
                        className="underline"
                        href={IMPRINT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        imprint
                    </a>
                    .
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    2. What data we process
                </h2>

                <h3 className="mt-4 font-semibold">a) Account data</h3>
                <ul className="list-disc space-y-1 pl-6">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Phone number (if provided voluntarily)</li>
                </ul>

                <h3 className="mt-4 font-semibold">b) Shift data</h3>
                <ul className="list-disc space-y-1 pl-6">
                    <li>the name you use to sign up for a shift</li>
                    <li>optional notes on a shift entry</li>
                    <li>
                        where applicable, a reference to a created ticket order
                        (see section 5)
                    </li>
                </ul>

                <h3 className="mt-4 font-semibold">
                    c) Server log files and reach measurement
                </h3>
                <p>
                    When the application is accessed, technical access data (e.g.
                    IP address, time of access, page requested, browser type) is
                    processed, which is required to deliver the application and
                    ensure its secure operation. For statistical analysis of usage
                    we additionally use the analytics tool Umami. Umami is
                    data-minimising, uses no cookies and produces only anonymised
                    usage statistics; no personal profiles are created.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    3. Email delivery (login link &amp; confirmations)
                </h2>
                <p>
                    We send emails via an SMTP server to deliver login links
                    (“magic links”) and to confirm shift sign-ups. For this we
                    process your email address and your name. A login token is
                    also generated and stored for authentication.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    4. Spam protection with Cloudflare Turnstile
                </h2>
                <p>
                    To protect our forms from automated abuse, we use the
                    “Turnstile” service of Cloudflare, Inc. (USA). A verification
                    token is transmitted to and evaluated by Cloudflare; this may
                    also involve processing your IP address and transferring it to
                    the USA. The transfer is based on appropriate safeguards (in
                    particular standard contractual clauses). The legal basis is
                    our legitimate interest in the security of the application
                    (Art. 6(1)(f) GDPR).
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    5. Ticket creation via Pretix
                </h2>
                <p>
                    Where enabled for an event, a ticket order is created during
                    shift sign-up via the ticketing service “pretix” (pretix.eu,
                    operated by pretix GmbH). For this, your name and email
                    address are transmitted to pretix. Pretix’s own{" "}
                    <a
                        className="underline"
                        href="https://pretix.eu/about/de/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        privacy policy
                    </a>{" "}
                    applies to its processing.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">6. Legal bases</h2>
                <p>
                    Your account and shift data and the related emails are
                    processed to carry out volunteer scheduling (Art. 6(1)(b) and
                    (f) GDPR). Spam protection, technical log files and reach
                    measurement are based on our legitimate interest in secure and
                    needs-based operation (Art. 6(1)(f) GDPR). Voluntary
                    information (e.g. phone number or notes) is processed on the
                    basis of your consent (Art. 6(1)(a) GDPR).
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">7. Recipients of the data</h2>
                <p>
                    Your data is not passed on to third parties unless this is
                    necessary to provide the functions described above. Recipients
                    or processors are: the operator of the server infrastructure,
                    the email/SMTP service provider, Cloudflare (spam protection)
                    and – where enabled – pretix (ticketing).
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">8. Storage period</h2>
                <p>
                    We store personal data only for as long as is necessary for
                    the stated purposes or as required by statutory retention
                    periods. Shift-related entries are deleted or anonymised after
                    the respective event has ended, unless further retention is
                    required.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    9. Your rights as a data subject
                </h2>
                <p>Under the GDPR you have, in particular, the right to:</p>
                <ul className="list-disc space-y-1 pl-6">
                    <li>access (Art. 15)</li>
                    <li>rectification (Art. 16)</li>
                    <li>erasure (Art. 17)</li>
                    <li>restriction of processing (Art. 18)</li>
                    <li>data portability (Art. 20)</li>
                    <li>object to processing (Art. 21)</li>
                    <li>
                        withdraw a given consent with effect for the future (Art.
                        7(3))
                    </li>
                </ul>
                <p>
                    To exercise your rights, an informal message to the controller
                    named above is sufficient. You also have the right to lodge a
                    complaint with a data protection supervisory authority.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">
                    10. Automated decision-making
                </h2>
                <p>
                    No automated decision-making, including profiling within the
                    meaning of Art. 22 GDPR, takes place.
                </p>
            </section>
        </div>
    );
}
