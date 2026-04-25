# Pitch Narration — Kutu Digitizer

**Speaker:** Ijam · **Duration:** 4 minutes strict · **Track:** Innovation · **Register:** bilingual BM-first, code-switch natural · **Setting:** on-stage at TNG FINHACK 2026 judges' panel

Timing shown in `[mm:ss]` cues. Bracketed stage directions are notes to self, not spoken. Italic BM lines are preferred voice — switch to English only where audience requires.

---

## [00:00] — Slide 1 · Title · 10 seconds

*Assalamualaikum and good afternoon. Saya Ijam, from team KrackedDevs. Kami bawa* **Kutu Digitizer** *— tiga tiang dalam satu landasan TNG. Three pillars on one rail.*

[Beat. Change slide.]

---

## [00:10] — Slide 2 · Practice + Gap · 30 seconds

*My grandmother runs a kutu with seven of her neighbours. RM 200 sebulan, lapan bulan. Lima belas tahun depa buat — never miss a cycle. Bank Negara has never seen a single one of those transactions.*

[Pause on the 15% statistic for 2 beats.]

***15% of Malaysian adults remain unbanked.* That's the formal number. The informal number is bigger — millions practising rotating savings, kutu, arisan, tabung — invisible to credit bureaus, invisible to banks, invisible to the formal system that's supposed to serve them.*

*Twenty-three million Malaysians already carry TNG eWallet. The rails are in their pocket. The practice is in their lives. The platform is overdue.*

[Beat. Change slide.]

---

## [00:40] — Slide 3 · Three pillars · 50 seconds

*Kami bina Kutu Digitizer atas tiga tiang — three pillars — on one TNG rail.*

***Tiang pertama — Kutu.*** *Communal rotating savings, on rails 23 million Malaysians already use. Auto-deduct via TNG. Transparent ledger every member can see. Visible trust score that follows you tabung to tabung. Yang nenek aku buat, kita bawa to 23 million people.*

***Tiang kedua — Penasihat.*** *Bilingual AI robo-advisor, BM-first. Tanya dia,* "patut ke aku letak payout aku dalam ASNB?" *— dia jawab dengan reasoning yang spesifik kepada tabung kau, dengan rekomendasi risk-tuned across conservative, balanced, growth. Bukan generic advice — advice yang grounded in your numbers.*

***Tiang ketiga — Pengawal.*** *AI scam sentinel. Bila kau hampir confirm transfer kepada penerima yang flagged — Pengawal stop kau. Pattern-match scam phrasing dalam BM, English, Mandarin. Community-fed reputation database. The vulnerable get scammed in their own language; the warning meets them in their own language too.*

*Tiga tiang, satu platform, satu TNG rail.*

[Beat. Change slide.]

---

## [01:30] — Slide 4 · Why Innovation track · 30 seconds

*The Innovation track brief asked for —* "a secure, AI-driven eWallet platform that enhances digital payment transparency, automates regulatory compliance, and delivers real-time financial insights for users and regulators."

*Read it back to our pillars:* **secure** *— Pengawal.* **AI-driven** *— Penasihat plus Pengawal.* **Transparency** *— Kutu's ledger.* **Real-time insights** *— Penasihat answers grounded in live tabung state.*

*Track brief described what we built. We took it literally.*

[Beat. Change slide.]

---

## [02:00] — Slide 5 · Demo · 70 seconds

*Let me show you. Live, on stage, all three pillars.*

[SWITCH TO LIVE DEMO SCREEN. Follow demo-script.md beat-by-beat.]

- **[00:08 into demo]** *Cipta tabung — name, monthly amount, duration. Submit. Tabung lahir.*
- **[00:18]** *Invite code, QR code, copy link to WhatsApp.*
- **[00:25]** *Second member joins via the link. Roster updates live.*
- **[00:35]** *Bayar — TNG sandbox, contribution flows, ledger row turns green, trust score ticks +1.*
- **[00:50]** ***Penasihat.*** *Tanya in BM —* "patut ke aku join tabung kedua, atau invest dulu yang dah selesai?" *— streamed BM reply with risk-tuned recommendations citing user's actual completed-cycle count.*
- **[01:05]** ***Pengawal.*** *Cuba transfer to a known-flagged recipient — warning modal masuk in BM,* "Pengawal jumpa red flag — penerima ni baru join 2 hari, ada 5 aduan komuniti, message dia ada pattern 'investment guarantee 30%'. Yakin nak teruskan?"

[Return to deck. Change slide.]

---

## [03:10] — Slide 6 · Stack · 20 seconds

*Stack sengaja minimal. Node, TypeScript, Postgres 16. TNG eWallet for the rail. Claude API for the AI on Penasihat and Pengawal. Better Auth, Drizzle, Hono on the back. Next.js fifteen on the front.*

*One EC2, four containers. No Kubernetes. No Redis. No GraphQL. Scope matches size. Forty-eight hours, ship the product.*

[Beat. Change slide.]

---

## [03:30] — Slide 7 · Lineage · 20 seconds

*Each pillar has a billion-dollar precedent.* **Kutu** — *MoneyFellows raised 31 million. Esusu valued at a billion.* **Penasihat** — *Wealthsimple, StashAway, Betterment — robo-advisor's a five-billion-dollar category.* **Pengawal** — *Bolster, Sift, Trustpair — fraud sentinel raised forty million plus globally.*

*Three proven categories. Three Malaysian-context implementations. One TNG-native platform — that's the new shape.*

[Beat. Change slide.]

---

## [03:50] — Slide 8 · Ask · 10 seconds

*What we need —* **TNG sandbox extended** *across all three pillars.* **Regulatory introduction** *— Bank Negara, SC, on community trust score portability.* **Next cohort** *— whatever you run next, R2-D2 wants in.*

*Tiga tiang, satu landasan. Terima kasih.*

[Stop at 04:00. Smile. Do not apologize. Do not overrun.]

---

## Register Notes (Tutur-protocol)

**Do say:**
- *Tabung · kutu · ahli · pusingan · kepercayaan · catatan · landasan · tiang*
- *Rails · ledger · trust-score · sandbox · pattern-match* (English technical terms stay English)
- Short declarative sentences. No clause pile-up.
- *Tiga tiang, satu landasan* — repeat at slide 1, slide 3, slide 8 as the signature phrase.

**Do not say:**
- "Revolutionize" / "disrupt" / "unleash" / "transform"
- "Fintech ecosystem"
- "Empowering underserved communities" (empty phrasing — use concrete numbers instead)
- "In conclusion" / "to wrap up"

**Code-switch rhythm:** BM for emotional/practice/cultural beats; English for numbers, stack names, comparables. Never force.

---

## Recovery Phrases (if derailed)

| Situation | Recovery |
|---|---|
| Demo screen freezes | *"Let me continue while the demo recovers —"* then skip to slide 6 early |
| Penasihat slow to stream | *"Penasihat reasoning runs through Claude — first response can take a beat. Here's the architecture while it loads."* — buy time with slide 6 |
| Pengawal demo doesn't trigger | *"The flag is fed via community-fed reputation. Today, our seeded recipient. Production, the network."* — pivot to roadmap |
| Timer hits 3:30 on slide 5 | Cut Pengawal sub-demo. Verbal claim: *"Pengawal demonstrated in repo, not on stage today."* Jump to slide 7 |
| Judge interrupts with question | *"Good question — let me answer after the pitch so I don't eat the clock."* |
| Mic fails | Project voice, keep walking slides, finish visually |

---

## Pre-Pitch Ritual

- 5 min before: breath cycle, shoulders down, walk slow
- 2 min before: clipboard check — remote works, demo URL loaded, sound tested, Pengawal flagged-recipient seeded
- 30 sec before: one look at Mung + Akmal — team nod
- On stage: find one judge's eyes for slide 1 open. Don't break eye contact for the first sentence.

---

*Narration sign-off: Ijam · Tutur (BM register) · MatNep (delivery polish)*
