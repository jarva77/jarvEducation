# jarvEducation — Quiz app Δημοτικού

Εκπαιδευτική εφαρμογή quiz για μαθητές Δημοτικού. Ζωντανή στο
**https://quiz.jarvantage.com**.

## Stack

Vue 3 + TypeScript + Vite, client-only SPA.

```bash
npm install
npm run dev
```

## Hosting & domain

- Hosting: **GitHub Pages**, auto-deployed μέσω `.github/workflows/deploy.yml`
  σε κάθε push στο `main`.
- Custom domain: `quiz.jarvantage.com` — CNAME → `jarva77.github.io`,
  DNS-only (όχι proxied) στο Cloudflare.
- Το `quiz.jarvantage.com` είναι ανεξάρτητο subdomain από το κύριο site
  `jarvantage.com` (ξεχωριστό repo/project) — δεν επηρεάζεται από αλλαγές
  DNS εκεί.

Για πλήρες project context και συμβάσεις, δες το `CLAUDE.md`.
