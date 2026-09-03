# jarvEducation — Quiz app Δημοτικού

Εκπαιδευτική εφαρμογή quiz για τον γιο του χρήστη (και συμμαθητές του). Ζωντανή στο
**https://quiz.jarvantage.com** — repo: `jarva77/jarvEducation` (GitHub).

## Stack & Deploy

- Vue 3 + TypeScript + Vite, client-only SPA. Dev server: `npm run dev` (launch config: `.claude/launch.json`, name `jarvantage-education`).
- Hosting: **GitHub Pages** μέσω `.github/workflows/deploy.yml` — κάθε push στο `main` κάνει auto-deploy (~1 λεπτό). Επιβεβαίωση: GitHub Actions API → τελευταίο run `completed success`, μετά `curl https://quiz.jarvantage.com/` → 200.
- Custom domain: CNAME `quiz` → `jarva77.github.io`, **DNS only (όχι proxied)** στο Cloudflare — βλ. ενότητα «Domain & email».
- `vite.config.ts` έχει `base: './'` — να μην αλλάξει.

## Τράπεζα ερωτήσεων (ΣΗΜΑΝΤΙΚΟ WORKFLOW)

- 6 τάξεις (Α'–ΣΤ'), 500 ερωτήσεις η καθεμία: `src/data/questions-{a,b,c,d,e,f}.json`.
- **Τα JSON ΔΕΝ επεξεργάζονται χειροκίνητα.** Παράγονται από το `scripts/generate-questions.mjs` (seeded RNG, deterministic). Αλλαγές περιεχομένου = επεξεργασία του script → `node scripts/generate-questions.mjs` → commit script + JSON μαζί.
- Κανόνες ποιότητας που έχουν ήδη ζητηθεί από τον χρήστη (μην τους χαλάσεις):
  - Ρήματα σε χρόνους: κύρια απάντηση σε **α' ενικό** (παίζω → έπαιξα), αποδεκτό και γ' ενικό.
  - Συμπλήρωση γραμμάτων: τόσες παύλες όσα τα γράμματα (`πληρών_` → «ω»), απάντηση = μόνο τα γράμματα, δεκτή και ολόκληρη η λέξη.
  - Ανοιχτές ερωτήσεις με πολλές σωστές απαντήσεις → λίστα `acceptedAnswers` (π.χ. αισθήσεις, νησιά, ποτάμια).
  - Αντικείμενα προβλημάτων (ITEMS): μόνο ουδέτερα πληθυντικού («Πόσα ...» πάντα σωστό).
  - Ονόματα με σωστό άρθρο (Ο Νίκος / Η Μαρία), πτώσεις σωστές στις εκφωνήσεις (π.χ. «στον Αόριστο»).
  - Ύλη αυστηρά ανά τάξη (π.χ. όχι περίμετρος στην Α').
- Βαθμολόγηση (`src/utils/grading.ts`): αγνοεί τόνους/κεφαλαία/τελικό σημείο στίξης/αρχικό άρθρο.

## Firebase (project `jarveducation`, Spark δωρεάν, χωρίς κάρτα)

- Config (δημόσιο) στο `src/firebase/config.ts`. SDK **lazy-loaded** — να παραμείνει εκτός main bundle.
- Firestore (eur3): `players` (leaderboard aggregates: totalPoints=1/σωστή, testsCount, bestPercentage, name=«Όνομα Α.», photoURL), `results` (ένα doc/τεστ, με grade), `feedback` (ανά ερώτηση: ratingSum/ratingCount/reportCount — ο χρήστης το ελέγχει από το Firebase Console για QA ερωτήσεων).
- Google sign-in· τα rules τα διαχειρίζεται ο χρήστης στην κονσόλα.
- Το ιστορικό λειτουργεί και offline (localStorage), το cloud είναι προσθετικό.

## Αποφάσεις χρήστη που ισχύουν

- Firestore αντί Supabase (το free Supabase παγώνει σε αδράνεια) και αντί Data Connect/SQL (κοστίζει μετά το trial).
- Leaderboard: φωτογραφία προφίλ ΝΑΙ (βάση: γονική συναίνεση), όνομα μόνο «Μικρό Α.».
- Σελίδα απορρήτου χωρίς αναφορά σε Firebase/Google servers (μόνο «διακομιστές εντός ΕΕ»).
- Email επικοινωνίας απορρήτου: `quizgame@jarvantage.com` (στο `PrivacyScreen.vue`, από 2026-09-02).
- Anti-cheat/server-side scoring: ΜΟΝΟ αν εμφανιστούν ύποπτα σκορ (σχέδιο: Cloudflare Worker).

## Domain & email (στήθηκε 2026-09-02, δοκιμασμένο)

- `jarvantage.com`: registrar Papaki, **DNS στο Cloudflare** (free plan, nameservers connie/fred.ns.cloudflare.com). Το δωρεάν mailbox του Papaki είναι σκόπιμα νεκρό.
- **Λήψη:** Cloudflare Email Routing → όλα στο jarva77@gmail.com: `info@jarvantage.com` (γενικό εταιρικό), `contact@jarvantage.com`, `quizgame@jarvantage.com` (το app· ο χρήστης το θέλει μη δεσμευτικό, το app είναι πειραματικό).
- **Αποστολή:** Gmail «Send mail as» και για τα 3, μέσω **Resend** SMTP (`smtp.resend.com:465` SSL, user `resend`, password = Resend API key «Sending access»). Domain verified στο Resend, EU region (eu-west-1), records στο `send.jarvantage.com` + `resend._domainkey`. Free: 100/μέρα, 3000/μήνα. Αν χρειαστεί ποτέ το app να στέλνει email, το Resend είναι έτοιμο.
- DMARC: `p=quarantine; adkim=r; aspf=r` (mail-tester: fully authenticated). SPF root = Cloudflare Email Routing.
- Root `jarvantage.com`: Papaki parking page (A 195.110.124.140, μόνο HTTP). **Ο χρήστης σχεδιάζει εταιρικό site εκεί** (πιστεύει ότι το απαιτεί ο νόμος· ΙΚΕ άρθ. 47 / ΟΕ-ΕΕ άρθ. 251 Ν.4072/2012) — ΜΗΝ προτείνεις redirect στο quiz. Ξεχωριστό repo όταν ξεκινήσει· χρειάζονται επωνυμία/έδρα/ΓΕΜΗ/ΑΦΜ, τι κάνει η εταιρεία, γλώσσες, Cloudflare Pages vs GitHub Pages. Όνομα αποστολέα στο Gmail: «Jarvantage L.P.».

## Παρκαρισμένες ιδέες (εγκεκριμένες για «αργότερα»)

Κουμπί σίγασης ήχων · σερί σωστών με 🔥 · PWA (manifest+service worker) και μετά TWA για Play Store ($25) για Android.

## Συμβάσεις

- Πριν από push: `npm run build` (τρέχει και vue-tsc). Οπτικός έλεγχος σε mobile viewport (375px) στο preview.
- Commits: αγγλικά, τελειώνουν με `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Επικοινωνία με τον χρήστη στα ελληνικά.
