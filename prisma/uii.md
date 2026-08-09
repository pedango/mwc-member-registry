# Cursor AI Prompt — Login Screen Logo Sizing & Final Polish for MWC Church Management System

## Context

Refine the **login screen** further. The overall structure (church photo left panel with name + tagline, form right panel) is working well. This pass focuses specifically on the **MWC logo's size and position**, plus a few remaining alignment/spacing issues on the right panel. Do NOT add features; this is layout/sizing/spacing refinement only.

## 1. Logo size and position

**Problem:** The logo is currently oversized and floats disconnected from the rest of the content — there's a large empty gap above it and another large gap between it and the "Sign in" heading, making the logo and the form read as two separate zones rather than one cohesive intro block. Its width is also disproportionate to the narrower form beneath it.

**Fix:**
- Reduce the logo's size to roughly 60–70% of its current rendered width/height — it should read as a supporting brand mark introducing the form, not compete with "Sign in" as the dominant element.
- Treat the logo + heading + subtext as **one connected intro block**: reduce the vertical gap between the logo and "Sign in" so they feel grouped together (use the same tight spacing you'd use between a label and its input — proximity implies relationship).
- Keep the logo horizontally centered above the heading.
- Re-balance the overall vertical space: with the smaller logo, redistribute the freed-up space so the whole content block (logo → heading → form → footer note) is **vertically centered** within the right panel, rather than sitting high with excess empty space at the bottom.

## 2. Alignment consistency

**Problem:** The heading ("Sign in") and subtext ("Manage church member records") are center-aligned, but the Email/Password labels are left-aligned. Mixing alignment axes in the same column reads as inconsistent.

**Fix:** Pick one alignment strategy for the whole form block and apply it consistently:
- **Recommended:** Keep the heading/subtext centered (they introduce the form), but the actual form fields (labels + inputs) should be left-aligned within a centered column — this is the standard, most usable pattern for forms and is fine as a deliberate contrast between "intro" (centered) and "form" (left-aligned). If keeping this pattern, ensure the email/password block as a *unit* is horizontally centered as a column, with labels/inputs left-aligned *within* that column — so the column's left edge and the button's left edge line up exactly.
- Verify the input fields and the "Sign in" button share identical width and left/right edges — confirm this alignment is pixel-consistent (it looks close but should be verified).

## 3. Theme toggle placement

- The dark/light toggle (top-right) currently floats in isolation. Keep it in the top-right corner (that's a fine, expected location) but ensure it has a comfortable, consistent margin from the edges matching the rest of the page's spacing scale, and add an accessible `aria-label` ("Toggle dark mode"). No need to relocate it — just tighten its spacing relationship to the panel edges.

## 4. General spacing pass

- Recheck the spacing scale between: logo → heading, heading → subtext, subtext → Email field, Email → Password, Password → button, button → footer note. Use a consistent, deliberate scale (e.g. tighter within the intro block, slightly more room before the button, and a clear but not excessive gap before the footer note).
- Ensure the entire right-panel content block (logo through footer note) is capped at a comfortable max-width (~420–460px) and centered within the panel both horizontally and vertically.

## Constraints

- No new features — layout, sizing, and spacing refinement only.
- Keep the left panel (church photo, name, tagline, gold accent bar) as-is — it's working well.
- Keep existing colors/tokens from prior passes; this prompt is about sizing/position/alignment, not color.
- Clean, production-ready TypeScript/React.

## Deliverable

A login screen where the logo is appropriately sized and tightly grouped with the "Sign in" heading as one cohesive intro block, the full right-panel content is vertically centered within the panel, form alignment is consistent and pixel-accurate, and spacing throughout follows a deliberate, consistent scale.