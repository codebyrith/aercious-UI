# AERCIOUS — Shopify Dawn Theme Integration Guide

This guide enables you to apply the exact **AERCIOUS Monochromatic Avant-Garde Luxury Streetwear UI** directly into your Shopify Dawn theme (e.g. `d:\Dfren\Dawn theme\`).

---

### Step 1: Copy Custom CSS
Copy `shopify-theme-integration/aercious-custom.css` into your Dawn theme's `assets/` directory:
- Source: `C:\Users\DELL\.gemini\antigravity-ide\scratch\aercious-luxury-streetwear\shopify-theme-integration\aercious-custom.css`
- Destination: `d:\Dfren\Dawn theme\assets\aercious-custom.css`

---

### Step 2: Link CSS in `layout/theme.liquid`
Open `layout/theme.liquid` and add this line inside `<head>` right after `{{ 'base.css' | asset_url | stylesheet_tag }}`:

```liquid
{{ 'aercious-custom.css' | asset_url | stylesheet_tag }}
```

---

### Step 3: Color Schemes in `config/settings_data.json`
To match the pitch black theme throughout all Shopify Dawn native sections, set Scheme 1 or your primary scheme background to pitch black `#000000` and text to `#ffffff`:

```json
"scheme-1": {
  "settings": {
    "background": "#000000",
    "text": "#ffffff",
    "button": "#ffffff",
    "button_label": "#000000",
    "secondary_button_label": "#ffffff",
    "shadow": "#000000"
  }
}
```

---

### Step 4: Standalone Prototype & Assets
The complete standalone working interactive prototype with all features (lookbook reels, mega-menu, cart drawer with free shipping progress bar, store locator, search modal, and currency converter) is running at:
- **Project Directory:** `C:\Users\DELL\.gemini\antigravity-ide\scratch\aercious-luxury-streetwear`
- **Local Dev Server:** `http://localhost:4173`
- **Generated High-Res Streetwear Assets:**
  - `assets/images/hero-editorial.jpg` (Editorial Streetwear Hero)
  - `assets/images/racing-jacket.jpg` (AERCIOUS RACING 01 Leather Bomber)
  - `assets/images/jacquard-hoodie.jpg` (Archival Monochrome Jacquard Knit)
  - `assets/images/flagship-store.jpg` (Brutalist Flagship Boutique Interior)
