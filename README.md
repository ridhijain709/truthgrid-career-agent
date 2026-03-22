# TruthGrid Final App — Quick Access

If you want to access the final app without complications, use the **UI app**:

```bash
cd /home/runner/work/truthgrid-career-agent/truthgrid-career-agent/truthgrid-ui
npm install
npm run dev
```

Then open: **http://localhost:3000/dashboard**

---

## Full setup (UI + scoring agent)

### 1) Start the UI (frontend)

```bash
cd /home/runner/work/truthgrid-career-agent/truthgrid-career-agent/truthgrid-ui
npm install
cp .env.example .env.local
npm run dev
```

UI URL: **http://localhost:3000/dashboard**

### 2) Start the TruthGrid scoring agent (backend CLI)

```bash
cd /home/runner/work/truthgrid-career-agent/truthgrid-career-agent
npm install
cp .env.example .env
# add ANTHROPIC_API_KEY in .env
npm run dev
```

This generates the scoring output report at:
- `output_report.md`

---

## Troubleshooting

- **`next: not found`**
  - Run `npm install` inside `truthgrid-ui` and retry.
- **`ANTHROPIC_API_KEY not set`**
  - Add your key to `/home/runner/work/truthgrid-career-agent/truthgrid-career-agent/.env`.
- **Permission errors with `tsx`/`ts-node` in restricted environments**
  - Validate with `npm run build` first.
