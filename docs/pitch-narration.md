# Pitch Narration — DuitLater

**Speaker:** Ijam · **Duration:** 4 minutes strict · **Track:** Financial Inclusion · **Register:** bilingual BM-first, code-switch natural · **Setting:** on-stage at TNG FINHACK 2026 judges' panel

Timing shown in `[mm:ss]` cues. Bracketed stage directions are notes, not spoken. Italic BM lines are preferred voice.

---

## [00:00] — Slide 1 · Title · 10 seconds

*Assalamualaikum. Saya Ijam, dari team R2-D2. Kami bawa* **DuitLater** *— pool PayLater untuk komuniti B40. Sendiri tak mampu, ramai-ramai boleh.*

[Beat. Change slide.]

---

## [00:10] — Slide 2 · The Gap · 35 seconds

*Bayangkan Mak Cik Aminah dari Felda Gedangsa. Dia ada TNG eWallet. PayLater dia — RM 300. Tu je dia boleh.*

*Dia nak satu mesin jahit untuk start home tailoring — RM 1,800. Sendiri tak mampu.*

*Tapi enam jiran dia, semua dalam Felda Gedangsa, semua ada TNG, semua dalam B40 — gabung PayLater diorang sahaja, dah lebih RM 2,000. Cukup untuk mesin jahit.*

***Tapi TNG eWallet hari ini tak ada mekanisme nak combine PayLater allowance antara pengguna.*** *Itu gap dia.*

*Tiga juta keluarga B40 di Malaysia. Lima belas peratus orang dewasa unbanked. Dua puluh tiga juta TNG users. The rails are there. The need is there. The pool mechanism is missing.*

[Beat. Change slide.]

---

## [00:45] — Slide 3 · The Solution · 40 seconds

***DuitLater.*** *Empat langkah, satu produk.*

***Langkah pertama —*** *Form pool. Dua sampai lapan ahli, daftar di NADI centre. NADI Felda Gedangsa staff bantu pool formation, terangkan mekanisme.*

***Langkah kedua —*** *Combine PayLater. Sum of individual TNG limits. RM 300 plus RM 400 plus RM 250... combined cap pool muncul. Tiada subsidi external — yang kita ada cuma tindakan kolektif kampung sendiri.*

***Langkah ketiga —*** **Penasihat** *— AI advisor BM-first — cadangkan top-5 barang dari katalog MyKasih MySARA. 140 ribu item dah ada dalam katalog tu. Penasihat pilih yang sesuai dengan combined cap, dengan need yang pool nyatakan, dengan musim — sekolah dah dekat? Cuti panjang? Musim hujan?*

***Langkah keempat —*** *Pool vote. Majoriti setuju, TNG luluskan, NADI staff sahkan barang dah hantar. Bayar balik bulanan secara individu. Skor kepercayaan kampung naik bila kita semua bayar tepat masa.*

*Empat institusi Malaysia sebenar:* **TNG · NADI · MyKasih · isi rumah B40.** *Tiada welfare baru direka. Tiada lender baru. Cuma compose institusi yang dah ada.*

[Beat. Change slide.]

---

## [01:25] — Slide 4 · How DuitLater Earns Each Criterion · 60 seconds

*Lima kriteria penghakiman. Lima jawapan. Satu produk.*

***AI & Intelligent Systems —*** *AI muncul di tiga lapisan. **Lapisan pertama**, sebelum kod product ditulis — AI orchestration generate dua ribu empat ratus lebih baris PRD, architecture, pitch deck, dev plan. Tiap-tiap dokumen dalam repo adalah evidence. **Lapisan kedua**, masa build — repo ada `maji-core` team coordinator yang enforce phase gates dengan testable outcomes, schema-locked memory, Akal coding discipline. **Lapisan ketiga**, dalam product — Penasihat suggest items dari katalog MyKasih, NADI weekly summary detect anomalies — kalau tiga ahli bayar lewat sama-sama, AI flag sebagai tanda kesusahan kampung.*

***Technical Implementation —*** *Append-only ledger, HMAC webhooks, argon2 hashing, role-scoped NADI portal, scale path didokumenkan dari single EC2 sampai Aurora multi-AZ.*

***Multi-Cloud Service Usage —*** **AWS** *(Gold sponsor) untuk main compute dan Postgres ledger.* **Alibaba Cloud** *(Platinum sponsor) untuk AI workload — Function Compute dengan Qwen LLM yang BM-native. Kedua-dua sponsor cloud tercapai. Failover ke Anthropic Claude kalau Alibaba down.*

***Impact & Feasibility —*** *Test bed real:* **NADI Felda Gedangsa, Hulu Selangor** *— Felda smallholder community, MCMC-run NADI centre, satu jam setengah drive dari sini. Tiada welfare baru direka. Tiada lender baru. Compose institusi yang dah ada.*

***Presentation & Teamwork —*** *PRD enam ratus baris di GitHub. Maji-core team coordinator dengan slash commands. Architecture dengan lapan mermaid diagrams. /about-team page tunjuk R2-D2 lima orang. Documentation quality kau boleh check selepas pitch ni.*

[Beat. Change slide.]

---

## [02:25] — Slide 5 · The Demo · 50 seconds

*Live, on stage.*

[SWITCH TO LIVE DEMO. Follow demo-script beat-by-beat.]

- **[00:08 into demo]** *Daftar sebagai Mak Cik Aminah. Dashboard tunjuk PayLater individual saya — RM 300.*
- **[00:18]** *Cipta pool. Nama "Pool Felda Gedangsa Mac". Need: "Mesin jahit untuk side income". Budget target: RM 1,800.*
- **[00:30]** *Generate invite code, share. Dua jiran join. Combined cap muncul — RM 1,000, RM 1,400, RM 1,800.*
- **[00:45]** *Lock pool. Combined cap final RM 2,000.*
- **[00:55]** ***Penasihat.*** *Click Cadangkan — request go through Alibaba Function Compute, Qwen jawab dalam BM. Lima cadangan muncul — mesin jahit RM 1,800, beras 100kg + minyak masak RM 580, alat sekolah 8 anak RM 720, generator RM 1,200, alat ternakan ayam RM 480.*
- **[01:08]** *Pilih mesin jahit. Pool vote modal. Tiga ahli vote yes — majority. TNG approval simulated. Setiap ahli ada obligation proportional.*
- **[01:25]** *NADI staff login. Confirm dah hantar. Pool jadi active. Cycle 1 mula. Bayar bulan ni — RM 250 per orang. Ledger update green. Skor kepercayaan kampung naik 1 mata.*

[Return to deck. Change slide.]

---

## [03:15] — Slide 6 · Stack — Two Clouds · 15 seconds

*Stack split across dua cloud sponsor.* **AWS** *— EC2, Postgres, S3 — main backend.* **Alibaba Cloud** *— Function Compute dengan Qwen untuk AI workload, OSS untuk catalogue mirror.* *Kedua-dua sponsor visible dalam architecture, bukan logo theatre.*

[Beat. Change slide.]

---

## [03:30] — Slide 7 · Lineage · 15 seconds

*Pool credit dah scale di tempat lain. MoneyFellows raised 31 juta dolar di Mesir. Esusu valued at a billion in the US. Stokfella di Afrika Selatan. Easypaisa Pool Buy di Pakistan — precedent paling rapat dengan kita.*

*Malaysia ada TNG. Malaysia ada NADI. Malaysia ada MyKasih. We have the rails, we have the institutions — DuitLater is the wiring.*

[Beat. Change slide.]

---

## [03:45] — Slide 8 · Ask · 15 seconds

*Tiga benda kami minta.*

***Satu —*** *TNG. Sandbox API access untuk PayLater rail. Pool transaction flow kita perlu test against real risk model TNG.*

***Dua —*** *MCMC. Formal collaboration framework dengan NADI Selangor. Lapan puluh empat centre dah ready as distribution channel.*

***Tiga —*** *MyKasih Foundation. Merchant network access plus MySARA catalogue API untuk last-mile delivery.*

*Tiga institusi Malaysia. Satu produk yang TNG boleh ship. Empat puluh ribu B40 household di Selangor sahaja kalau pilot scale. Empat juta nationally.*

*Team R2-D2. Terima kasih.*

[Stop at 04:00. Smile. Do not apologize. Do not overrun.]

---

## Register Notes (Tutur-protocol)

**Do say:**
- *Pool · ahli · sumbangan · bayaran balik · kepercayaan · catatan · kampung · cadangan · NADI · MyKasih · Felda*
- *PayLater · TNG · sandbox · API · catalogue* (English technical terms stay English)
- Short declarative sentences. *Sendiri tak mampu, ramai-ramai boleh* — repeat at slide 1, slide 3, slide 8.

**Do not say:**
- "Revolutionize" / "disrupt" / "unleash"
- "Empowering underserved communities" (empty phrasing)
- "Saving the poor" / "uplifting the marginalised" (paternalistic)
- "Fintech ecosystem"

**Code-switch rhythm:** BM for emotional/cultural beats; English for institution names, stack names, comparables, numbers.

---

## Recovery Phrases (if derailed)

| Situation | Recovery |
|---|---|
| Demo screen freezes | *"Let me continue while the demo recovers —"* skip to slide 6 early |
| Penasihat slow to stream | *"Penasihat reasoning runs through Claude — first response can take a beat. Slide 6 architecture while it loads."* |
| Pool vote demo doesn't trigger | *"Vote tally runs in real-time — production has a 10-second poll. For demo, fast-forward."* |
| Timer hits 3:30 on slide 5 | Cut repayment sub-demo. Verbal claim: *"Repayment ledger shipped — full demo in repo."* Jump to slide 7 |
| Judge interrupts | *"Good question — let me answer after the pitch so I don't eat the clock."* |
| Mic fails | Project voice, keep walking slides, finish visually |

---

## Pre-Pitch Ritual

- 5 min before: breath cycle, shoulders down
- 2 min before: clipboard check — remote works, demo URL loaded, sound tested, NADI staff login pre-loaded, pool members pre-seeded
- 30 sec before: one look at Moon + Akmal — team nod
- On stage: find one judge's eyes for slide 1 open. Don't break eye contact for the first sentence.

---

*Narration sign-off: Ijam · Tutur (BM register) · MatNep (delivery polish)*
