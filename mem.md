# Vanaxi Webflow Project - Memory File

## Project Overview
This is a Webflow website project for Vanaxi (ونکسی) - a transportation/car service company in Iran. The site is in Persian (RTL layout).

## Project Instructions
1. **index.html** - COPY of Webflow site. **DO NOT MODIFY** - changes won't apply to live site
2. **current-styles.css** - Existing Webflow styles. **DO NOT MODIFY** - changes won't apply in Webflow
3. **styles.css** - For ALL new styles and CSS animations. Override existing styles here with comments
4. **script.js** - For ALL new JavaScript interactions
5. **Delivery method**: Scripts and styles added to Webflow via CDN

## Files Status
- ❌ index.html - Read-only reference
- ❌ current-styles.css - Read-only reference
- ✅ styles.css - Created & active (all new CSS)
- ✅ script.js - Created & active (all new JS)
- ✅ mem.md - This memory file

---

## Features Implemented

### 1. Mobile Menu System

#### Structure
- `.nav_burger` - Container for burger/close/back icons
  - `.burger-icon` - hamburger menu icon
  - `[icon-action="close-main"].close-icon.is-step1` - close entire menu
  - `[icon-action="back"].back-icon` - go back to level 1
- `.menu_open-wrapper` - Mobile menu container (only visible <991px)
  - `.menu_open.is-main` - Level 1 menu
  - `.menu_open.is-services` - Level 2 services submenu
  - `.menu_open.is-about` - Level 2 about submenu

#### Menu Items (Level 1)
- `#nav-services` - خدمات (Services)
- `#nav-plans` - پلن ها (Plans)
- `#nav-drivers` - رانندگان (Drivers)
- `#nav-about` - درباره ما (About Us)

### 2. Two-Level Navigation

#### Opening Level 2
- Main menu slides left: `transform: translateX(-100%)`
- Submenu slides in from right: `transform: translateX(100%) → translateX(0)`
- Animation: 0.35s easeInOutQuint
- Icons toggle: burger → back icon
- Account icons toggle: icon-24 → close-layers
- Logo fades out with blur, title fades in

#### Closing Level 2 (Back Button)
- Submenu slides right: `transform: translateX(0) → translateX(100%)`
- Main menu slides back: `transform: translateX(-100%) → translateX(0)`
- Icons toggle back: back → burger icon
- Title fades out, logo fades in with unblur

#### Closing Entire Menu (Close-Main / Close-Layers)
- Menu wrapper fades out: opacity + translateY(-20px)
- Submenu fades out (no slide): opacity 1 → 0
- All icons reset to initial state
- Main menu position reset

### 3. Icon Animations

#### State Classes
- `.is-hidden` - Element is hidden
- `.is-visible` - Element is shown
- `.is-active` - Submenu is active/shown
- `.is-pushed` - Main menu is pushed left
- `.is-menu-open` - Menu is open (on nav_burger)
- `.is-closing` - Submenu is fading out (not sliding)
- `.is-submenu-open` - A submenu is open

#### Burger/Close/Back Icon Animations
- Hide: `opacity: 0, transform: scale(0.8) rotate(90deg)`
- Show: `opacity: 1, transform: scale(1) rotate(0deg)`
- Duration: 0.3s easeInOutQuint

#### Close-Layers Icon (in nav_account-mob)
- Initial: `opacity: 0, transform: scale(0.8) rotate(-90deg)`
- Active: `opacity: 1, transform: scale(1) rotate(0deg)`
- Position: absolute within .nav_account-mob

### 4. Logo & Title Transitions

#### Elements
- `.nav_logo-link-center` - Logo in navbar center
- `.menu_title.is-services` - "خدمات" title
- `.menu_title.is-about` - "درباره ما" title

#### Animation Details
- Logo hide: opacity 0, scale(0.9), blur(8px)
- Logo show: opacity 1, scale(1), blur(0px)
- Title hide: opacity 0, translateY(-10px)
- Title show: opacity 1, translateY(0)
- Duration: 0.2s easeInOutQuint
- Staggered with 100ms delay in JavaScript

### 5. Scroll-Based Navbar Hide/Show

#### Behavior
- Scroll down >10px: Navbar hides (slides up)
- Scroll up >10px: Navbar shows (slides down)
- Works on ALL breakpoints
- Disabled when any menu/dropdown is open

#### CSS Classes
- `.navbar.is-hidden` - Navbar is hidden
- `.navbar.menu-open` - Menu is open (disables scroll hide)

#### Animation
- Transform: translateY(-100%)
- Opacity: 0
- Duration: 0.4s easeInOutQuint
- Uses requestAnimationFrame for performance

### 6. Desktop Dropdowns

#### Monitored Elements
- `.w-dropdown` - Webflow dropdown containers
- `.w-dropdown--open` - Class added when dropdown is open

#### Behavior
- When any dropdown opens: `.menu-open` added to navbar
- When all dropdowns close: `.menu-open` removed from navbar
- Uses MutationObserver to detect class changes

### 7. Menu Wrapper Responsive Behavior

#### CSS
- Default: `display: none`
- Mobile (<991px): `display: flex` via media query
- Position: fixed, z-index: 10000000000

---

## CSS Custom Properties (Easing Functions)

```css
:root {
  --ease-in-out-quint: cubic-bezier(0.83, 0, 0.17, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-base: 0.4s var(--ease-in-out-quint);
  --transition-fast: 0.3s var(--ease-in-out-quint);
}
```

---

## JavaScript API

### Public API (window.MenuController)
```javascript
window.MenuController.open()      // Open mobile menu
window.MenuController.close()     // Close mobile menu
window.MenuController.toggle()    // Toggle menu
window.MenuController.isOpen()    // Check if menu is open
window.MenuController.openSubMenu(type)  // Open submenu ('services' or 'about')
window.MenuController.closeSubMenu()     // Close submenu
```

### Key Functions
- `openMenu()` - Opens mobile menu
- `closeMenu()` - Closes entire menu
- `toggleMenu()` - Toggles menu open/close
- `openSubMenu(type)` - Opens level 2 submenu
- `closeSubMenu()` - Closes level 2, returns to level 1
- `toggleNavBurgerIcons(isSubMenuOpen)` - Toggles burger/back icons
- `toggleNavAccountIcons(showCloseLayers)` - Toggles icon-24/close-layers
- `toggleLogoAndTitle(subMenuType, showTitle)` - Toggles logo/title
- `setupScrollHide()` - Initializes scroll-based navbar hide/show
- `animateSubMenuItems(menuContainer)` - Stagger animation for submenu items

### State Object
```javascript
MenuState = {
  isOpen: false,           // Is mobile menu open
  currentSubMenu: null,    // 'services', 'about', or null
  isAnimating: false       // Prevents animation conflicts
}
```

---

## Important Implementation Notes

### Use Attribute Selectors for Icons
Always use attribute selectors for icon event handlers to avoid conflicts:
```javascript
// ✓ Correct
document.querySelector('[icon-action="close-main"]')
document.querySelector('[icon-action="back"]')
document.querySelector('[icon-action="close-layers"]')

// ✗ Avoid
document.querySelector('.close-icon.is-step1')  // Can conflict with other close icons
```

### Override current-styles.css
When current-styles.css has conflicting styles (like `display: none`), override in styles.css with `!important`:
```css
.close-icon.is-step1 {
  display: flex !important;  /* Override display: none from current-styles.css */
}
```

### Submenu Display Issue
`.menu_open.is-services` and `.menu_open.is-about` have `display: none` in current-styles.css. Override with:
```css
.menu_open.is-services,
.menu_open.is-about {
  display: flex !important;
}
```

### Animation Timing
- Icon transitions: 0.3s
- Menu slide animations: 0.35s
- Menu wrapper fade: 0.4s
- Logo/title transitions: 0.2s with 100ms stagger
- All use easeInOutQuint: cubic-bezier(0.83, 0, 0.17, 1)

### closeMenu() vs closeSubMenu()
- `closeMenu()` - Closes entire menu (no submenu slide animation)
- `closeSubMenu()` - Closes submenu, returns to level 1 (with slide animation)

### Scroll Hide Disable
The navbar scroll hide is disabled when:
- Mobile menu is open (`MenuState.isOpen === true`)
- Any desktop dropdown is open (`.w-dropdown--open` exists)
- Both are detected via MutationObserver

---

## Current Status
- All basic menu interactions working
- Push animations for level 2 navigation
- Scroll-based navbar hide/show
- Desktop dropdown detection
- User is planning to add GSAP animations

## TODO / Future Work
- Add GSAP animations for enhanced effects
- User wants to analyze godaylight.com for GSAP inspiration

---

## Last Updated
August 7, 2026
