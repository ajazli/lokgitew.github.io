# Mobile Customer Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the static Lok Gitew website so mobile visitors can quickly view the menu, reserve, get directions, or WhatsApp the cafe.

**Architecture:** Keep the existing static HTML/CSS/JS structure. Add compact markup in `index.html`, visual styling in `style.css`, and a small open-status helper in `script.js` without restructuring the whole site.

**Tech Stack:** HTML, CSS, vanilla JavaScript.

---

### Task 1: Content and Action Markup

**Files:**
- Modify: `index.html`

- [ ] Add a hero status block below the existing hero meta with open-status and Thursday closure copy.
- [ ] Add menu shortcut chips above the menu-book viewer.
- [ ] Add reservation guidance bullets inside the reservation info panel.
- [ ] Add mobile sticky actions before the back-to-top button.

### Task 2: Styling

**Files:**
- Modify: `style.css`

- [ ] Style the hero status block to fit the existing brand.
- [ ] Style menu shortcut chips as compact category buttons.
- [ ] Style reservation guidance as dense, readable customer hints.
- [ ] Style mobile sticky actions for small screens only, with enough bottom padding to avoid overlap.

### Task 3: Open Status Helper

**Files:**
- Modify: `script.js`

- [ ] Add a small helper that updates the hero status based on local browser day and hour.
- [ ] Keep Thursday closed.
- [ ] Treat 10:00 AM through 12:59 AM as open on non-Thursday business days.
- [ ] Fall back safely if the hero status element is absent.

### Task 4: Verification

**Files:**
- Verify: `index.html`, `style.css`, `script.js`

- [ ] Run `node --check script.js`.
- [ ] Search for the new customer actions and status IDs/classes.
- [ ] Search for stale or contradictory hours.
- [ ] Review `git diff` to confirm the change is scoped to the approved UX pass.
