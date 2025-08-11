# Style Guide (Landing + App Shell)

Brand Direction
- Tone: Professional, modern, confident
- Audience: Used car dealership owners and managers
- Design values: High contrast, clarity, speed, trust

Color Palette
- Primary Blue: #3B82F6 (CTA, links, highlights)
- Success Green: #22C55E (secondary CTA, confirmation)
- Background Gradient: from #0B1020 via #0C1226 to #0E1530
- Surface: White with low opacity on dark (glass) — rgba(255,255,255,0.04–0.08)
- Borders/Dividers: rgba(255,255,255,0.1–0.2)
- Text:
  - Primary: #FFFFFF
  - Secondary: rgba(255,255,255,0.7)
  - Tertiary: rgba(255,255,255,0.5)
- Accent Variations:
  - Purple: #A855F7 (charts, non-primary highlights)
  - Rose: #F43F5E (warnings)

Typography
- Base font: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial
- Scale:
  - Display/Hero: 48–60px (700–800 weight)
  - Headings: 20–32px (600–700 weight)
  - Body: 14–18px (400–500 weight)
  - Small/Meta: 12–14px (400–500 weight)
- Line-height: 1.2–1.5
- Tracking: Slight +0.2–0.4 for caps or labels

Layout
- Container: max-width: 1280px (max-w-7xl), 24px padding sides on mobile (px-6), 48px on desktop when applicable
- AppShell: Sidebar (fixed), Topbar (sticky), Content area, Toast region
- Sections: 64–96px vertical rhythm (py-12 to py-24)

Components
- Buttons:
  - Primary: bg #3B82F6 on dark, white text, large shadow glow; hover brightness + scale 1.02; active scale 0.99
  - Secondary: border white/20, text white/90; hover border white/40
  - Success: bg #22C55E, dark text (#0A0F1F)
- Cards/Panels:
  - Rounded: 12–16px
  - Border: white/10–20
  - Background: white/5–10 (glass)
  - Shadows: soft glow using color-coded shadows for accents
- Drawers/Modals:
  - Use 24–32px radius
  - Backdrop blur; keyboard esc closes
- Tables:
  - Sticky headers
  - Row hover
  - 12–16px padding
  - Zebra optional with low-contrast bands

Motion
- Duration: 150–250ms for most transitions
- Easing: ease-out for hover, ease-in-out for layout transitions
- Scale micro-interactions on CTAs (1.02 on hover, 0.99 on active)
- Staggered list entrance optional with 50–75ms delay per item

Icons
- Use react-icons/FontAwesome consistently
- Size: 16–24px for inline, 32–48px for hero and feature cards

Accessibility
- Contrast: Keep text and actions above WCAG AA
- Focus Ring: Visible, 2px outline (e.g., focus:ring-2 focus:ring-[#3B82F6])
- Keyboard:
  - Enter submits forms
  - Esc closes modals/drawers

Content Guidelines (Landing)
- Headline: Clear “All-in-one app for used car dealers”
- Subheading: Explain value concisely (inventory, sales with auto-journaling, P&L)
- Primary CTA: Try Demo
- Secondary CTA: Login
- Social Proof/Outcome: “Know your profit today”, “Faster turn-around”, “Print-ready reports”
- Features Grid: Inventory, Sales, Purchases, Journal/Ledger, P&L/Balance Sheet, PDF Export, COA, Roles
- Pricing: One-time tiers aligned with app_summary.md

Charts and Data Viz
- Use simple line/area for trends; bar for comparisons
- Colors:
  - Line primary: #3B82F6
  - Area fill: rgba(59,130,246,0.15)
  - Profit: #22C55E
  - Warning: #F59E0B
  - Danger: #EF4444

Forms
- Validation: zod-based; inline error beneath fields
- Labels: Always visible
- Hints: Small, muted text (white/50–60)
- Success: Green border/light glow
- Error: Red border, helpful message

PDF/Reports
- Use consistent margins, font sizes
- Section headings with clear separators
- Watermark optional for demo mode

Usage in Codebase
- Tailwind classes mirror the above (as seen in src/app/page.tsx)
- Accent variables can be centralized via CSS variables if expanding theming:
  - --color-primary: #3B82F6
  - --color-success: #22C55E
  - --bg-start: #0B1020; --bg-mid: #0C1226; --bg-end: #0E1530

Future Enhancements
- Themable accents from Settings (company branding)
- Light theme variant for PDFs while keeping dark UI
- Motion presets for drawer transitions and list reveals