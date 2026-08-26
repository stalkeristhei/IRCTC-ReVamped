# IRCTC prototype — icon assets

8 PNG icons, renamed and mapped to the placeholder letter badges on the homepage.

| File | Replaces | Section |
|---|---|---|
| `check-pnr.png` | P | Quick actions |
| `train-status.png` | T | Quick actions |
| `track-refund.png` | ₹ | Quick actions |
| `chart-vacancy.png` | C | Quick actions |
| `e-catering.png` | E | Associates |
| `flights.png` | F | Associates |
| `hotels.png` | H | Associates |
| `bus.png` | B | Associates |

## How to use in VS Code

1. Copy the `assets` folder into your project (e.g. `public/icons/` or wherever your existing image assets live).
2. In each card's markup, replace the letter text inside the circle badge with an `<img>` tag pointing to the matching file, e.g.:

```html
<div class="icon-badge">
  <img src="/icons/check-pnr.png" alt="Check PNR" width="24" height="24" />
</div>
```

3. Keep the existing circle badge background/size/color CSS as-is — only swap the letter text node for the `<img>`.
4. Since these are black/dark PNGs on a light badge background, they should show up fine as-is. If a badge has a dark/colored background, you may want re-exported white versions instead (let me know if you need those).
