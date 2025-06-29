# Debugging Notes – Item Viewer Not Rendering Uploaded Image

## Current Symptom
After an image is uploaded (or selected from the film-strip) the central "file viewer" area remains blank / black, while the thumbnail appears correctly below.

* `<img alt="Uploaded image">` **is in the DOM** and has `width: 100% ; height: 100%`.
* The `<img>` uses a valid base-64 data-URI (verified by opening the thumbnail in a new tab).
* Therefore React state is correct – the picture reaches the viewer, but it is not visible.

## Timeline of Attempts
1. **Cleared stale screen-share stream**
   * Added `setShareStream(null)` in every path that sets `ImageSrcAtom`.
   * Ensures `<video>` element is never rendered once an image is chosen.

2. **Fallback logic (`effectiveImageSrc`)**
   * `Content.tsx` now uses the first `uploadedImages` entry if `ImageSrcAtom` is null.

3. **Conditional render guard**
   * Show `<video>` only when `stream && !effectiveImageSrc`.

4. **Verified DOM**
   * DevTools shows `<img>` mounted, full width/height.
   * Still invisible in viewer.

5. **Suspected overlay**
   * Bounding-box overlay (`<div class="absolute inset-0">`) may have a background or higher z-index.
   * Quick DevTools test toggling overlay background / z-index to confirm.

## Root Cause Hypothesis
A sibling overlay that covers the same area is either
* painted *over* the `<img>` (higher `z-index`) **or**
* has a non-transparent background (blocking the picture).

The overlay exists to host bounding-boxes & drawing. A regression likely added a Tailwind utility (e.g. `bg-black` / `bg-slate-800`) or `z-[n]` class.

## Repro Steps (for future debugging)
1. Upload an image.
2. In DevTools select the blank viewer area.
3. Inspect layers:
   * `<img>` occupies 100%.
   * Immediately above it is the overlay div.
4. Toggle `background-color` on that overlay off. If image appears → CSS issue.
5. Toggle `z-index` (set to 0). If image appears → stacking issue.

## Minimal Code Fix (expected)
```tsx
/* Content.tsx – inside overlay wrapper */
<div
  className="absolute inset-0 pointer-events-none"
  style={{ background: 'transparent', zIndex: 2 }} // ensure transparent & under boxes
  ref={boundingBoxContainerRef}
  …
>
```
And ensure the `<img>` has a higher (e.g. `zIndex: 1`) only if overlay is `0`.

## Next-Session Plan
1. **Confirm overlay styles**
   * `git grep "absolute inset-0"` to find all potential overlays.
2. **Lock transparent background**
   * Remove any `bg-*` or `bg-black` on overlay div.
3. **Explicit z-index ordering**
   * `img` → `zIndex: 0`
   * overlay → `zIndex: 1`
   * bounding-boxes / selection indicators → `zIndex: 2+`
4. **Add Cypress/Playwright visual test**
   * Upload fixture image and assert that the viewer `<img>` has `offsetHeight > 0`.
5. **Code-review changes**
   * Guard future PRs with ESLint rule forbidding background color on overlay component.

## Environment / Setup Info
* React 19 + Vite 6.3
* TailwindCSS 4.1
* State managed by Jotai atoms (`ImageSrcAtom`, `UploadedImagesAtom`, `ShareStream`).

---
_If the overlay hypothesis is disproved, focus next on GPU layers (e.g. a CSS `filter: blur(0)` bug) or inspect whether Tailwind's dark-mode plugin injects an all-covering pseudo-element._ 