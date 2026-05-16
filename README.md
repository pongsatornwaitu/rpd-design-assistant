# RPD Design Assistant v2

เครื่องมือช่วยออกแบบ Removable Partial Denture สำหรับนักศึกษาทันตแพทย์และทันตแพทย์

## Stack

- **SvelteKit 2 + Svelte 5 (runes)** + TypeScript
- **Tailwind CSS v4** + custom design tokens (teal/coral/gold)
- **Zod** สำหรับ schema validation + v1 → v2 migration
- **IndexedDB** (idb-keyval) สำหรับเก็บหลายเคส
- **Vitest** สำหรับ unit tests
- **Service Worker** (SvelteKit native) สำหรับ offline + PWA

## Scripts

```bash
npm install          # ติดตั้ง dependencies
npm run dev          # dev server ที่ http://localhost:5173
npm run check        # type check + svelte-check
npm run test         # unit tests
npm run build        # production build → build/
npm run preview      # preview production build
```

## Features

### M1 — Tooth Chart
- FDI grid 32 ซี่ (4 quadrants)
- คลิก = เลือกฟัน, Shift+คลิก = สลับมี/หายไป
- aria-pressed, aria-label, keyboard friendly

### M2 — Survey Editor
- Segmented controls + toggles
- Per-tooth: undercut location/depth, guide plane, vestibule, prognosis, C:R, tipped, alteration, notes
- Autosave 300ms (debounced)
- Mobile: scrolls into view เมื่อเลือกฟัน

### M3 — Kennedy Classification
- Pure domain logic ใน `src/lib/domain/`
- Class I-IV + Modifications + completely edentulous
- พร้อม reason + clinical references (McCracken, Phoenix, Applegate)
- 12 unit tests

### M4 — Design Sheet
- SVG arch diagram (maxilla + mandible)
- Abutments highlighted, fulcrum line, rest seat triangles
- Screen reader support (title/desc)
- Print stylesheet สำหรับนักศึกษา

### M5 — Case Management
- บันทึก/โหลดเคสได้หลายเคส (IndexedDB)
- Export/import JSON ด้วย Zod validation
- Migrate v1 case format → v2 อัตโนมัติ
- Size limit 5 MB

### M6 — PWA
- Manifest + service worker
- Offline-first (cache app shell)
- Update prompt เมื่อมี version ใหม่
- Install เป็น app บน mobile/desktop

### M7 — Settings
- Theme: auto/light/dark
- Mode: learning (มี rationale) vs practice (กระชับ)
- Toggle รวมฟันกรามซี่ที่สาม

### M8 — Tests & Deployment
- 24 unit tests pass
- TypeScript strict mode, 0 errors
- Build size: ~257 KB total, initial JS gzipped ~30 KB
- Deploy ผ่าน Netlify (config ใน `netlify.toml`)

## Deploy ไป Netlify

1. Push project ขึ้น GitHub
2. New site from Git → เลือก repo
3. (netlify.toml ในโฟลเดอร์ `rpd-v2/` จะตั้งค่าเองอัตโนมัติ)

## Migration จาก v1

Import button รับไฟล์ JSON จาก v1 format อัตโนมัติ — `parseCase()` ใน `src/lib/schemas/caseSchema.ts` จะ migrate `remaining` array + `survey` object ไปเป็น v2 schema

## Clinical References

อ้างอิงในแอป:
- **McCracken's Removable Partial Prosthodontics** (Carr & Brown, 13th ed.) — major connectors, clasp design
- **Stewart's Clinical RPD** (Phoenix, 4th ed.) — direct retainer selection
- **Essentials of Removable Partial Denture Prosthesis** (Applegate, 3rd ed.) — classification

## โครงสร้างโฟลเดอร์

```
rpd-v2/
├── src/
│   ├── lib/
│   │   ├── components/       # Svelte components
│   │   ├── domain/           # Clinical logic (pure functions, tested)
│   │   │   ├── kennedy.ts
│   │   │   ├── spans.ts
│   │   │   ├── recommendations.ts
│   │   │   └── geometry.ts
│   │   ├── schemas/          # Zod schemas + migration
│   │   ├── stores/           # Svelte 5 runes-based stores
│   │   ├── i18n/             # Thai labels (English coming)
│   │   └── types.ts          # Domain types (FDI, ToothSurvey, CaseData)
│   ├── routes/
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   ├── service-worker.ts
│   ├── app.html
│   └── app.css               # Design tokens + base styles
├── static/                   # manifest, icon, robots
└── ...
```
