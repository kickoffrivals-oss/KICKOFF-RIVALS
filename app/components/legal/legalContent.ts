export interface LegalSection {
  id: "terms" | "privacy" | "cookies" | "responsible" | "fairness";
  title: string;
  badge: string;
  lastUpdated: string;
  content: string;
}

export const LEGAL_DOCS: Record<string, LegalSection> = {
  terms: {
    id: "terms",
    title: "Terms & Conditions of Service",
    badge: "LEGAL AGREEMENT • 18+",
    lastUpdated: "October 2026",
    content: `### 1. Acceptance of Terms
By accessing or using KickOff Rivals, The Daily Aviator, and associated virtual gaming platforms (collectively, the "Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms in full, do not access or use the Platform.

### 2. Strictly Virtual Entertainment & Simulation Only (No Real-Money Gambling)
The Platform is an entertainment simulation and virtual competitive gaming environment.
* **Virtual Currency ("Coins KOR"):** All transactions, wagers, drops, and winnings utilize virtual tokens termed "Coins KOR". Coins KOR are strictly virtual game credits and hold **zero cash value, no fiat currency equivalent, and no real-world redeemability**.
* **No Real-World Payouts:** Coins KOR cannot be exchanged, redeemed, sold, or cashed out for fiat money, legal tender, or physical property under any circumstances.
* **No Investment or Securities:** The Platform does not offer banking, investment, security, or financial services. Any reference to "winnings", "jackpots", "payouts", or "odds" refers strictly to simulated in-game mechanics.

### 3. Eligibility & Age Restriction (Strictly 18+)
* You must be at least **eighteen (18) years of age**, or the legal age of majority in your jurisdiction, whichever is greater, to access the Platform.
* Access by minors is strictly prohibited. We reserve the right to request proof of age or block any user reasonably suspected of being under the legal age.

### 4. Prohibited Jurisdictions & Compliance
You are solely responsible for ensuring that your access and use of the Platform complies with all local, state, national, and international laws applicable to you. You may not access the Platform from jurisdictions where virtual gaming, prediction simulations, or Web3 interactions are prohibited.

### 5. Provably Fair Deterministic PRNG
* Game outcomes (including Virtual Football match cycles and Daily Aviator multiplier flight curves) are determined by deterministic cryptographic Pseudo-Random Number Generators (PRNG) using SHA-256 seed hashing.
* All match and round outcomes are algorithmically calculated and cannot be manipulated, intercepted, or altered by players, server operators, or third parties in flight.

### 6. User Conduct, Anti-Cheat & Botting Prohibition
You agree not to:
* Exploit bugs, glitches, memory vulnerabilities, or timing exploits.
* Use automated scripts, bots, spiders, or unauthorized third-party software.
* Attempt denial-of-service (DoS) attacks, reverse-engineering, or tampering with smart contracts and telemetry feeds.
Violations result in immediate permanent account termination and forfeiture of all virtual Coins KOR balances.

### 7. Intellectual Property
All trademarks, game assets, vector graphics, 3D simulations, and audio effects are the exclusive intellectual property of KickOff Rivals. Unauthorized reproduction or reverse engineering is strictly prohibited.

### 8. Disclaimer of Warranties & Limitation of Liability
* THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
* UNDER NO CIRCUMSTANCES SHALL KICKOFF RIVALS, ITS FOUNDERS, OPERATORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR ACCESS TO OR USE OF THE PLATFORM, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, INTERRUPTIONS, RPC LATENCY, WALLET DISCONNECTIONS, OR SERVER OUTAGES.
* IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED TEN DOLLARS ($10.00 USD).

### 9. Indemnification & Dispute Resolution
You agree to indemnify, defend, and hold harmless KickOff Rivals and its officers from any claims, damages, liabilities, and expenses arising from your violation of these Terms. Any disputes shall be resolved through confidential, binding individual arbitration.`,
  },
  privacy: {
    id: "privacy",
    title: "Privacy Policy & Data Protection",
    badge: "GDPR • CCPA COMPLIANT",
    lastUpdated: "October 2026",
    content: `### 1. Overview
KickOff Rivals ("we", "us", or "our") respects your privacy and is committed to protecting your information. This Privacy Policy explains our data collection and protection practices across our games and services.

### 2. Information We Collect
We intentionally minimize data collection to the absolute technical minimum required for gameplay integrity:
* **Public Web3 Identifier:** Your public wallet address (when connected via Web3 wallets like AppKit/Wagmi). We **never** have access to your private keys, seed phrases, or wallet funds.
* **In-Game Telemetry & Session Data:** Round bet history, match selections, current Coins KOR balance, referral codes, and virtual quest progress.
* **Technical Diagnostics:** Anonymized IP-derived country/region, browser type, screen resolution, and error telemetry to troubleshoot connection issues.

### 3. What We Never Collect
* We do **not** collect your government ID, credit card details, real name, physical home address, or phone number.
* We do **not** sell, rent, monetize, or trade your personal data to any data brokers or advertisers.

### 4. How We Use Information
We use telemetry data strictly for:
* Settling match odds and round multipliers fairly via deterministic algorithms.
* Detecting botting, multi-accounting, and syndicated exploits.
* Maintaining player standings, leaderboard rankings, and achievement rewards.
* Saving local client preferences such as dark mode / UI theme (\`app_ui_theme\`).

### 5. Cookies & Local Storage
We utilize essential browser \`localStorage\` and first-party cookies to:
* Keep you logged in to your active game session.
* Remember your chosen UI style (Neo-Brutalist vs Classic).
* Store your cookie preferences and audio mute settings.

### 6. Your Rights (GDPR & CCPA)
Under European and Californian privacy regulations, you have the right to:
* Access any personal data associated with your session or wallet.
* Request deletion ("Right to be Forgotten") of your off-chain profile data.
* Opt out of non-essential performance tracking.
To exercise your rights, contact our privacy officers via our support channels or support terminal.

### 7. Security Standards
All data transmissions between client browsers and server endpoints are encrypted using industry-standard TLS 1.3 / HTTPS. Cryptographic hashes and wallet signatures are verified server-side.`,
  },
  cookies: {
    id: "cookies",
    title: "Cookie & Local Storage Policy",
    badge: "TRANSPARENCY FIRST",
    lastUpdated: "October 2026",
    content: `### 1. What Are Cookies & Local Storage?
Cookies and browser Local Storage are small data records placed on your computing device when visiting websites to ensure responsiveness, security, and consistent interface state.

### 2. Cookies & Storage Items We Use
* **Strictly Necessary Storage (Always Active):**
  - \`app_ui_theme\`: Remembers whether you prefer Neo-Brutalist Streetwear Pop or Classic UI.
  - \`cookie_consent_status\`: Stores your consent choices so you are not prompted on every page refresh.
  - \`wallet_session\`: Manages connected Web3 wallet state and RPC session heartbeat.
* **Functional & Preference Storage:**
  - Sound effect preferences (e.g. whistle and flight audio on/off).
  - Selected odds formatting preferences (Decimal / Fractional).
* **Analytics & Performance:**
  - Minimal anonymized telemetry to detect network latency spikes and connection dropouts.

### 3. How to Manage or Revoke Consent
You can update your cookie preferences at any time using the "Cookie Settings" link in the footer or by clearing your browser cookies and Local Storage via browser settings.`,
  },
  responsible: {
    id: "responsible",
    title: "Responsible Gaming & 18+ Protection",
    badge: "18+ • PLAYER WELFARE",
    lastUpdated: "October 2026",
    content: `### 1. Virtual Gaming Disclaimer (Entertainment First)
While KickOff Rivals uses simulated odds, multiplier curves, and sportsbook-style match cycles, all play is conducted with non-monetary virtual credits (**Coins KOR**).
Despite the simulation nature of the game, we take player health, healthy habits, and age verification seriously.

### 2. Age Requirement (18+)
* The Platform is exclusively intended for users **18 years of age or older** (or 21 in regions where simulated sports wagering is restricted to 21+).
* Underage play is strictly banned. Parents and guardians are encouraged to utilize parental control filtering tools.

### 3. Self-Imposed Cool-Off & Balance Resets
* You can reset your simulated Coins KOR balance or take a cool-off period at any time via your user profile settings.
* If you ever feel that simulated sports betting or crash games are affecting your well-being, we recommend stepping away and taking a break.

### 4. Independent Support Helplines
If you or someone you know experiences challenges with gaming habits or gambling, support is available 24/7 free of charge:
* **BeGambleAware:** https://www.begambleaware.org (UK: 0808 8020 133)
* **National Council on Problem Gambling (NCPG):** https://www.ncpgambling.org (US: 1-800-522-4700)
* **Gambling Therapy:** https://www.gamblingtherapy.org (Global Multilingual Support)`,
  },
  fairness: {
    id: "fairness",
    title: "Provably Fair SHA-256 Verification",
    badge: "CRYPTOGRAPHIC PROOF",
    lastUpdated: "October 2026",
    content: `### 1. Cryptographic Provable Fairness
KickOff Rivals and The Daily Aviator operate on deterministic cryptographic algorithms to guarantee that no outcome can be manipulated by operators, players, or network latency.

### 2. How the PRNG System Works
1. **Server Seed:** A secret cryptographic string generated on the server before the round begins.
2. **Client Seed / Round Seed:** A public seed tied to the round counter and public block timestamp.
3. **SHA-256 Hash Generation:** The server combines \`ServerSeed + ClientSeed + RoundID\` and computes an immutable SHA-256 hash.
4. **Outcome Derivation:** The first 52 bits of the SHA-256 hash are converted into a float value that dictates the exact match events or crash multiplier cutoff.

### 3. Independent Verification
Once a round concludes, the unhashed seed is revealed to the public. Any player can feed the published seeds into any third-party SHA-256 generator to verify that the game outcome was predetermined and untouched.`,
  },
};
