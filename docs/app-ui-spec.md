# MacDroid Desktop App — UI Specification

> **Version:** 1.0  
> **Author:** Coco Chanel, UI/UX Designer  
> **Ticket:** JP-005  
> **Date:** 2026-02-20  

---

## Table of Contents

1. [Window Layout](#1-window-layout)
2. [Toolbar](#2-toolbar)
3. [File List Panel](#3-file-list-panel)
4. [Sidebar](#4-sidebar)
5. [Connection States](#5-connection-states)
6. [Transfer UI](#6-transfer-ui)
7. [Drag & Drop](#7-drag--drop)
8. [Context Menu](#8-context-menu)
9. [Component States](#9-component-states)
10. [Theme Variations](#10-theme-variations)

---

## 1. Window Layout

### Structure

```
┌──────────────────────────────────────────────────────────┐
│  Toolbar                                                  │
├────────────┬─────────────────────────────────────────────┤
│            │                                              │
│  Sidebar   │  Main Panel (File List)                     │
│  240px     │  flex: 1                                     │
│            │                                              │
│            │                                              │
│            │                                              │
│            │                                              │
├────────────┴─────────────────────────────────────────────┤
│  Status Bar                                               │
└──────────────────────────────────────────────────────────┘
```

### Dimensions

| Property | Value |
|----------|-------|
| Min window size | 800 × 500px |
| Default window size | 1100 × 700px |
| Sidebar width | 240px (resizable, min 200px, max 360px) |
| Toolbar height | 48px |
| Status bar height | 28px |

### Tokens

- **Window background:** `--color-bg-secondary`
- **Sidebar background:** `--color-bg-primary`
- **Main panel background:** `--color-bg-primary`
- **Sidebar border-right:** 1px solid `--color-border-subtle`
- **Sidebar resize handle:** 4px invisible grip, cursor `col-resize`

### Status Bar

- Left: item count ("42 items" or "3 of 42 selected")
- Right: connection status icon + label, storage summary
- Font: `caption` (12px), `--color-text-secondary`
- Background: `--color-bg-secondary`
- Border-top: 1px solid `--color-border-subtle`

---

## 2. Toolbar

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [←] [→] │ / Internal Storage / DCIM / Camera    🔍  ≡ ☷ │+ 🗑│
└─────────────────────────────────────────────────────────────┘
```

### Specifications

| Element | Size | Spacing | Notes |
|---------|------|---------|-------|
| Toolbar container | height: 48px | padding: 0 `space-3` | `--color-bg-primary`, border-bottom 1px `--color-border-subtle` |
| Nav buttons (back/forward) | 32×32px | gap: `space-1` (4px) | Icon-only, `icon-sm` (20px) |
| Breadcrumb | flex: 1 | margin: 0 `space-3` | Truncate from left if overflow |
| Search | 32×32px (collapsed) / 240px (expanded) | — | Expands on click with animation 200ms |
| View toggle | 32×32px | gap: `space-1` | Two-button group: list / grid |
| New Folder | 32×32px | margin-left: `space-2` | `folder-plus` icon |
| Delete | 32×32px | margin-left: `space-1` | `trash-2` icon, `error-500` on hover |

### Breadcrumb Path

- Segments separated by `/` (chevron icon, `icon-xs`, `--color-text-tertiary`)
- Each segment: `body-sm` (14px), `medium` weight, `--color-text-secondary`
- Last segment: `--color-text-primary`, `semibold`
- Hover on segment: underline, `--color-action`
- Click segment: navigate to that directory
- Overflow: show `...` for middle segments, always show first + last two

### Search Field

- **Collapsed:** Icon button, `search` icon
- **Expanded:** Input field with `search` icon left, `x` clear button right
- Height: 32px, `radius-sm` (6px), `--color-bg-secondary` background
- Placeholder: "Search files…", `--color-text-tertiary`
- Focus: border `--color-action`, ring 2px `primary-500/20`
- Animation: width from 32px → 240px, `200ms ease`

---

## 3. File List Panel

### List View

```
┌──────────────────────────────────────────────────────────┐
│ ☐  Name ▲           Size      Date Modified     Type    │
├──────────────────────────────────────────────────────────┤
│ ☐ 📁 DCIM           —         Feb 18, 2026     Folder  │
│ ☐ 📁 Documents       —         Feb 15, 2026     Folder  │
│ ☐ 📁 Download        —         Feb 20, 2026     Folder  │
│ ☐ 🖼 photo_001.jpg   3.2 MB   Feb 20, 2026     JPEG    │
│ ☐ 🎵 song.mp3        4.8 MB   Feb 19, 2026     MP3     │
└──────────────────────────────────────────────────────────┘
```

#### Column Specifications

| Column | Width | Alignment | Font |
|--------|-------|-----------|------|
| Checkbox | 32px fixed | center | — |
| Icon | 24px fixed | center | `icon-md` (24px) |
| Name | flex: 1, min 200px | left | `body-sm`, `regular` |
| Size | 100px fixed | right | `body-sm`, `--color-text-secondary` |
| Date Modified | 160px fixed | left | `body-sm`, `--color-text-secondary` |
| Type | 80px fixed | left | `caption`, `--color-text-tertiary` |

#### Header Row

- Height: 32px
- Background: `--color-bg-secondary`
- Font: `caption` (12px), `semibold`, `--color-text-secondary`, uppercase, `letter-spacing: 0.08em`
- Sort indicator: `chevron-up` or `chevron-down`, `icon-xs`, next to sorted column
- Hover on header: `--color-text-primary`, cursor pointer
- Border-bottom: 1px solid `--color-border`

#### File Row

- Height: 36px
- Padding: 0 `space-3`
- Border-bottom: 1px solid `--color-border-subtle`
- **Default:** transparent background
- **Hover:** `--color-bg-secondary`
- **Selected:** `primary-50` (light) / `rgba(41,151,255,0.1)` (dark), border-left 2px `--color-action`
- **Multi-select:** checkbox visible, filled with `--color-action`
- **Focused (keyboard):** 2px ring inset `--color-action`
- **Dragging:** opacity 0.5, ghost preview follows cursor
- Double-click folder → navigate into; double-click file → open/download

#### File Icons

- Folders: `folder` icon, `warning-500` (#FF9500) fill
- Images: `image` icon, `accent-500`
- Audio: `music` icon, `primary-500`
- Video: `video` icon, `error-500`
- Documents: `file-text` icon, `--color-text-secondary`
- Archives: `archive` icon, `--color-text-secondary`
- Unknown: `file` icon, `--color-text-tertiary`

### Grid View

- Card size: 120×140px
- Grid gap: `space-3` (12px)
- Padding: `space-4` (16px)
- Thumbnail area: 120×96px, `radius-sm`, `--color-bg-secondary`, centered icon or preview
- Label: below thumbnail, `body-sm`, truncated with ellipsis, center-aligned
- File size: `caption`, `--color-text-tertiary`, below label
- **Hover:** `shadow-sm`, translateY(-1px)
- **Selected:** ring 2px `--color-action`, `primary-50` background

### Empty State

- Centered in panel
- Icon: `folder-open`, `icon-xl` (48px), `--color-text-tertiary`
- Text: "This folder is empty", `body-md`, `--color-text-secondary`
- Subtext: "Drag files here or use the toolbar to create a new folder", `body-sm`, `--color-text-tertiary`

---

## 4. Sidebar

### Layout

```
┌──────────────┐
│ 📱 Pixel 8   │  ← Device header
│ ████████░░░  │  ← Storage bar
│ 48.2 / 128GB │  ← Storage label
├──────────────┤
│ ▶ Internal   │  ← Folder tree
│   ▶ DCIM     │
│     📁Camera │
│   ▶ Download │
│   ▶ Documents│
│   ▶ Music    │
│ ▶ SD Card    │
├──────────────┤
│ Bookmarks    │  ← Quick access
│  ⭐ DCIM     │
│  ⭐ Downloads│
└──────────────┘
```

### Device Header

- Padding: `space-4`
- Icon: `smartphone`, `icon-lg` (32px), `accent-500`
- Device name: `heading-sm` (20px), `semibold`, `--color-text-primary`
- Connection badge: pill, `caption`, `accent-500` bg, white text, "Connected"
- Disconnect button: ghost, `caption`, `--color-text-tertiary`, right-aligned

### Storage Bar

- Margin: `space-2` top, inside device header padding
- Height: 8px
- Background: `--color-bg-tertiary`
- Fill: linear gradient left→right `primary-500` → `accent-500`
- Border-radius: `radius-full`
- **Warning (>80%):** fill becomes `warning-500`
- **Critical (>95%):** fill becomes `error-500`
- Label below: `caption`, `--color-text-secondary`, format: "48.2 GB of 128 GB used"

### Folder Tree

- Padding: `space-2` horizontal
- Section header: `overline` (12px, semibold, uppercase), `--color-text-tertiary`, padding `space-3` top
- Tree item height: 32px
- Indent per level: 16px
- Expand/collapse: `chevron-right` → rotates 90° on expand, `icon-xs`, `--color-text-tertiary`
- Folder icon: `folder`, `icon-sm`, `warning-500`
- Label: `body-sm`, `--color-text-primary`
- **Hover:** `--color-bg-secondary`, `radius-sm`
- **Selected (current directory):** `primary-50` bg (light) / `rgba(41,151,255,0.1)` (dark), `--color-action` text, `semibold`
- **Active (pressed):** `primary-100` bg

### Bookmarks Section

- Divider: 1px `--color-border-subtle`, margin `space-3` vertical
- Section header: "Bookmarks", `overline`
- Star icon: `star`, `icon-xs`, `warning-500`
- Same item styling as folder tree
- Right-click to remove bookmark

---

## 5. Connection States

### 5.1 Disconnected

```
┌──────────────────────────────────────────┐
│                                          │
│           📱 ── ✕ ── 💻                 │
│                                          │
│     No Android Device Connected          │
│                                          │
│  Connect your device via USB or Wi-Fi    │
│  to start transferring files.            │
│                                          │
│      [ Connect via USB ]  (primary)      │
│      [ Connect via Wi-Fi ] (secondary)   │
│                                          │
│   Having trouble? View setup guide →     │
│                                          │
└──────────────────────────────────────────┘
```

- Full panel takeover (replaces file list + sidebar)
- Centered vertically and horizontally
- Icon composition: `smartphone` + dashed line + `x-circle` + dashed line + `laptop`, `icon-xl`, `--color-text-tertiary`
- Heading: `heading-lg`, `--color-text-primary`
- Description: `body-md`, `--color-text-secondary`, max-width 400px
- CTA: primary button `md`, secondary button `md`, vertical stack, `space-3` gap
- Help link: `body-sm`, `--color-action`, underline on hover

### 5.2 Connecting

- Same layout as disconnected but:
- Icon replaced with animated spinner (24px, `--color-action`, 1s rotation)
- Heading: "Connecting to device…"
- Description: "Please accept the connection prompt on your Android device."
- No buttons, but "Cancel" ghost button below
- Subtle pulse animation on the spinner ring

### 5.3 Connected

- Normal app layout appears (sidebar + file list + toolbar)
- Brief toast notification (bottom-right): "Connected to Pixel 8", `accent-500` left border
- Toast auto-dismisses after 3s, slide-up enter / fade-out exit

### 5.4 Connection Error

- Same centered layout as disconnected
- Icon: `alert-triangle`, `icon-xl`, `error-500`
- Heading: "Connection Failed", `--color-text-primary`
- Description: specific error message, `body-md`, `--color-text-secondary`
- Error detail: monospace box, `body-sm`, `--color-bg-secondary`, `radius-sm`, padding `space-3`
- Buttons: "Try Again" (primary), "View Troubleshooting" (ghost)

### 5.5 Connection Lost (mid-session)

- Overlay banner at top of main panel: 48px height, `error-100` bg, `error-500` left border 3px
- Icon: `wifi-off`, `icon-sm`, `error-500`
- Text: "Connection lost. Attempting to reconnect…", `body-sm`, `--color-text-primary`
- Spinner inline (16px)
- "Dismiss" ghost button right-aligned
- File list beneath becomes disabled (opacity 0.5, no interaction)

---

## 6. Transfer UI

### Progress Modal

```
┌──────────────────────────────────────────┐
│  Transferring Files                   ✕  │
├──────────────────────────────────────────┤
│                                          │
│  📄 vacation_photo_032.jpg               │
│  ████████████████░░░░░░  67%             │
│                                          │
│  3.2 MB of 4.8 MB  •  2.1 MB/s          │
│  ~1 second remaining                     │
│                                          │
│  File 12 of 47                           │
│  ████████░░░░░░░░░░░░░  25% overall      │
│                                          │
├──────────────────────────────────────────┤
│                    [ Cancel ]  [ Pause ] │
└──────────────────────────────────────────┘
```

#### Specifications

| Element | Style |
|---------|-------|
| Modal | 480px width, `radius-lg`, `shadow-xl`, centered with backdrop `rgba(0,0,0,0.4)` |
| Header | `heading-sm`, `--color-text-primary`, padding `space-4`, border-bottom 1px `--color-border-subtle` |
| Close button | `x` icon, `icon-sm`, `--color-text-tertiary`, top-right, hover: `--color-text-primary` |
| Current file icon | type-based, `icon-sm` |
| Current file name | `body-md`, `semibold`, `--color-text-primary`, truncate with ellipsis |
| Progress bar (current) | height 8px, `radius-full`, bg `--color-bg-tertiary`, fill `--color-action` |
| Progress bar (overall) | height 6px, `radius-full`, bg `--color-bg-tertiary`, fill `accent-500` |
| Transfer stats | `body-sm`, `--color-text-secondary` |
| Time remaining | `body-sm`, `--color-text-tertiary` |
| File counter | `caption`, `--color-text-tertiary` |
| Body padding | `space-5` |
| Footer | padding `space-3` `space-4`, border-top 1px `--color-border-subtle`, buttons right-aligned |
| Cancel button | destructive variant, `sm` |
| Pause button | secondary variant, `sm` |

#### Progress Bar Animation

- Fill transitions: width `300ms ease`
- Indeterminate state (unknown size): animated gradient shimmer, left→right, `1.5s infinite`
- Complete: fill `accent-500`, brief pulse animation

#### Transfer Complete State

- Progress bars → 100%, fill `accent-500`
- Icon: `check-circle`, `accent-500`
- Heading: "Transfer Complete"
- Stats: "47 files transferred (312 MB) in 2m 34s"
- Single button: "Done" (primary)

#### Transfer Error State

- Failed file highlighted in `error-100` bg
- Icon: `alert-circle`, `error-500`
- Error message: `body-sm`, `error-500`
- Buttons: "Skip" (ghost), "Retry" (secondary), "Cancel All" (destructive)

### Background Transfer (minimized)

- When modal is minimized, show transfer bar in status bar
- Height: 28px (replaces status bar content)
- Mini progress bar: 120px width, inline
- Text: "Transferring 12/47…", `caption`
- Click to re-open modal

---

## 7. Drag & Drop

### Drop Zone Overlay

When files are dragged from Finder/desktop into the app window:

```
┌──────────────────────────────────────────┐
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│                                          │
│ │         ⬇ Drop files here            │ │
│           to copy to device              │
│ │                                      │ │
│                                          │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
└──────────────────────────────────────────┘
```

#### Specifications

- Overlay covers entire main panel
- Background: `primary-50` with `0.92` opacity (light) / `rgba(41,151,255,0.08)` (dark)
- Dashed border: 3px dashed `--color-action`, `radius-lg`, inset 16px from edges
- Icon: `download`, `icon-xl` (48px), `--color-action`
- Text: "Drop files here", `heading-md`, `--color-action`
- Subtext: "to copy to {current folder name}", `body-sm`, `--color-text-secondary`
- Animation: fade in 150ms, icon gentle bounce (translateY 0→-4px→0, 1s infinite)
- **Drag over valid target:** border becomes solid, bg opacity increases
- **Drag over invalid target:** border becomes `error-500`, icon `x-circle`, text "Cannot drop here"

### Drag Out (device → Mac)

- File row becomes semi-transparent (opacity 0.5) when being dragged
- Ghost preview: file icon + name, `shadow-lg`, slight rotation (2deg)
- Multi-file drag: stacked icon effect (3 cards offset 2px each) + badge count

---

## 8. Context Menu

### Appearance

- Width: 220px
- Background: `--color-surface-elevated`
- Border: 1px solid `--color-border`
- Border-radius: `radius-md` (10px)
- Shadow: `shadow-lg`
- Padding: `space-1` (4px) vertical
- Animation: scale(0.95) → scale(1) + fade in, `100ms ease`

### Menu Items

| Item | Icon | Shortcut | Notes |
|------|------|----------|-------|
| Open | `external-link` | ⌘O | Folders: navigate; Files: open |
| — | — | — | *Separator* |
| Copy to Mac | `download` | ⌘C | Copy from device to Mac |
| Copy to Device | `upload` | ⌘⇧C | Copy from Mac to device |
| Move | `move` | ⌘M | Opens destination picker |
| — | — | — | *Separator* |
| New Folder | `folder-plus` | ⌘⇧N | Creates in current dir |
| Rename | `edit-3` | Enter | Inline rename |
| — | — | — | *Separator* |
| Delete | `trash-2` | ⌘⌫ | `error-500` text color |
| — | — | — | *Separator* |
| Properties | `info` | ⌘I | Opens properties panel |
| Add to Bookmarks | `star` | ⌘D | Folders only |

### Menu Item Styling

- Height: 32px
- Padding: 0 `space-3`
- Icon: `icon-sm` (20px), `--color-text-secondary`, margin-right `space-2`
- Label: `body-sm`, `--color-text-primary`
- Shortcut: `caption`, `--color-text-tertiary`, right-aligned
- **Hover:** `primary-50` bg (light) / `rgba(41,151,255,0.1)` (dark), `radius-sm`
- **Disabled:** opacity 0.4, no hover effect, cursor default
- **Destructive (Delete):** label + icon `error-500`, hover bg `error-100`
- Separator: 1px solid `--color-border-subtle`, margin `space-1` vertical

### Delete Confirmation Dialog

- Modal: 360px width, `radius-lg`, `shadow-xl`
- Icon: `alert-triangle`, `icon-lg`, `warning-500`
- Heading: "Delete {n} item(s)?", `heading-sm`
- Description: "This action cannot be undone. Files will be permanently removed from the device.", `body-sm`, `--color-text-secondary`
- Buttons: "Cancel" (secondary), "Delete" (destructive), right-aligned, `space-2` gap

### Properties Panel

- Slide-in panel from right, 320px width, or modal 400px
- Sections: Preview (thumbnail), General (name, type, size, location, modified, created), Permissions
- Each property: label (`caption`, `--color-text-tertiary`) + value (`body-sm`, `--color-text-primary`)
- File preview: 280×200px max, `radius-md`, `--color-bg-secondary` if no preview

---

## 9. Component States

### 9.1 Toolbar Buttons (Icon Buttons)

| State | Style |
|-------|-------|
| **Default** | bg transparent, icon `--color-text-secondary`, `radius-sm` |
| **Hover** | bg `--color-bg-secondary`, icon `--color-text-primary` |
| **Active** | bg `--color-bg-tertiary`, scale(0.95) |
| **Disabled** | opacity 0.3, cursor not-allowed, no hover effect |
| **Selected** (view toggle) | bg `--color-action`, icon `#FFFFFF` |
| **Focus** | 2px ring `--color-action` offset 1px |

### 9.2 Sidebar Tree Items

| State | Style |
|-------|-------|
| **Default** | bg transparent, text `--color-text-primary` |
| **Hover** | bg `--color-bg-secondary`, `radius-sm` |
| **Active** | bg `primary-100` (light) / `rgba(41,151,255,0.15)` (dark) |
| **Selected** | bg `primary-50` (light) / `rgba(41,151,255,0.1)` (dark), text `--color-action`, `semibold` |
| **Disabled** | opacity 0.4 |
| **Drop target** | bg `primary-100`, dashed border 1px `--color-action` |
| **Focus** | 2px ring inset `--color-action` |

### 9.3 File List Rows

| State | Style |
|-------|-------|
| **Default** | bg transparent |
| **Hover** | bg `--color-bg-secondary` |
| **Selected** | bg `primary-50` / `rgba(41,151,255,0.1)`, left border 2px `--color-action` |
| **Multi-selected** | same as selected, checkbox filled `--color-action` |
| **Active (pressed)** | bg `primary-100` / `rgba(41,151,255,0.15)` |
| **Disabled** | opacity 0.5, no pointer events |
| **Dragging** | opacity 0.5, dashed outline |
| **Drop target** | bg `primary-50`, bottom border 2px `--color-action` (insert indicator) |
| **Rename active** | inline text input replaces name, auto-selected, 2px border `--color-action` |
| **Error** | bg `error-100`, left border 2px `error-500` |
| **Focus (keyboard)** | 2px ring inset `--color-action` |

### 9.4 Grid View Cards

| State | Style |
|-------|-------|
| **Default** | bg `--color-surface`, border 1px `--color-border-subtle`, `radius-md` |
| **Hover** | `shadow-sm`, translateY(-1px) |
| **Selected** | ring 2px `--color-action`, bg `primary-50` |
| **Active** | scale(0.98) |
| **Disabled** | opacity 0.4 |
| **Focus** | 2px ring `--color-action` |

### 9.5 Buttons (all variants follow design system §7)

Refer to design system for Primary, Secondary, Ghost, and Destructive button states: default, hover, active, focus, disabled.

### 9.6 Checkboxes

| State | Style |
|-------|-------|
| **Unchecked** | 16×16px, border 1.5px `--color-border`, `radius-sm` (4px), bg `--color-surface` |
| **Checked** | bg `--color-action`, white checkmark icon, border `--color-action` |
| **Indeterminate** | bg `--color-action`, white dash icon |
| **Hover** | border `neutral-400` (unchecked) / darken fill (checked) |
| **Disabled** | opacity 0.4 |
| **Focus** | 2px ring `--color-action` |

### 9.7 Search Input

| State | Style |
|-------|-------|
| **Collapsed** | icon button, matches toolbar button states |
| **Expanded default** | bg `--color-bg-secondary`, border 1px `--color-border-subtle` |
| **Focus** | border `--color-action`, ring 2px `primary-500/20` |
| **With value** | clear `x` button appears right |
| **No results** | input border `warning-500`, subtle shake animation |
| **Error** | border `error-500` |

### 9.8 Storage Bar

| State | Style |
|-------|-------|
| **Normal (<80%)** | gradient fill `primary-500` → `accent-500` |
| **Warning (80-95%)** | fill `warning-500` |
| **Critical (>95%)** | fill `error-500`, label `error-500` |
| **Loading** | shimmer animation, no fill |

### 9.9 Toast Notifications

| State | Style |
|-------|-------|
| **Success** | left border 3px `accent-500`, `check-circle` icon |
| **Error** | left border 3px `error-500`, `alert-circle` icon |
| **Warning** | left border 3px `warning-500`, `alert-triangle` icon |
| **Info** | left border 3px `info-500`, `info` icon |

Common: bg `--color-surface-elevated`, `shadow-lg`, `radius-md`, padding `space-3`, max-width 360px, bottom-right position, 16px from edges. Enter: slide-up 200ms. Exit: fade-out 150ms. Auto-dismiss: 3–5s.

---

## 10. Theme Variations

### Light Theme

Uses all `Light Theme` tokens from the design system (§2).

Key characteristics:
- Clean white surfaces (`#FFFFFF`)
- Subtle gray backgrounds (`#F2F2F7`) for secondary areas
- High contrast text (`#1D1D1F` on white)
- Soft shadows for depth
- Sidebar: white bg, subtle right border

### Dark Theme

Uses all `Dark Theme` tokens from the design system (§2).

Key characteristics:
- True black window chrome (`#000000`)
- Elevated surfaces use `#1C1C1E` and `#2C2C2E`
- Action color shifts to `#2997FF` (brighter blue for dark bg)
- Borders become `#3A3A3C` (subtle on dark)
- Shadows increase opacity to `0.32`
- File icons retain their semantic colors but with slight brightness boost
- Selected rows: `rgba(41,151,255,0.1)` — subtle blue tint
- Storage bar gradient remains the same
- Progress bars: same colors, slightly more luminous

### Theme-Specific Overrides

| Element | Light | Dark |
|---------|-------|------|
| Toolbar bg | `#FFFFFF` | `#1C1C1E` |
| Sidebar bg | `#FFFFFF` | `#1C1C1E` |
| Main panel bg | `#FFFFFF` | `#000000` |
| File row hover | `#F2F2F7` | `#2C2C2E` |
| Selected row bg | `#F5F9FF` | `rgba(41,151,255,0.1)` |
| Context menu bg | `#FFFFFF` | `#2C2C2E` |
| Modal backdrop | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.6)` |
| Drop zone overlay | `rgba(245,249,255,0.92)` | `rgba(41,151,255,0.08)` |
| Breadcrumb separator | `#AEAEB2` | `#6E6E73` |
| Status bar bg | `#F2F2F7` | `#1C1C1E` |

### System Theme Detection

- Respect `prefers-color-scheme` by default
- Manual override in app preferences: Auto / Light / Dark
- Transition between themes: `200ms ease` on all color properties

---

## Appendix: Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Back | ⌘[ |
| Forward | ⌘] |
| Search | ⌘F |
| Select all | ⌘A |
| Copy | ⌘C |
| Paste (upload) | ⌘V |
| Delete | ⌘⌫ |
| New folder | ⌘⇧N |
| Rename | Enter (when selected) |
| Properties | ⌘I |
| Toggle view | ⌘1 (list) / ⌘2 (grid) |
| Refresh | ⌘R |
| Bookmark | ⌘D |

---

*This specification follows the MacDroid Design System v1.0. All tokens, colors, and spacing values reference the shared design system document.*
