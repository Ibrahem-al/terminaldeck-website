# Layouts and Presets

Auto-arrange layouts and saved presets are managed by the layout engine (`src/renderer/engine/layout.ts`, `src/renderer/engine/presets.ts`) and the LayoutPicker UI (`src/renderer/components/LayoutPicker.tsx`).

## Layout Algorithms

All layout functions are pure: `(instances, viewport, gap?) -> LayoutResult` where `LayoutResult = Map<string, { x, y, w, h }>`. Positions are centered on origin (0,0).

### Constants
- `MIN_WIDTH = 300` -- Minimum instance width enforced by all layouts
- `MIN_HEIGHT = 200` -- Minimum instance height
- `DEFAULT_GAP = 4` -- Default gap between tiles

### Grid Layout (`gridLayout`)

Equal-sized tiles in a grid closest to square.

1. `cols = ceil(sqrt(n))`, `rows = ceil(n / cols)`
2. Tile width = `max(MIN_WIDTH, (viewport.width - gaps) / cols)`
3. Tile height = `max(MIN_HEIGHT, (viewport.height - gaps) / rows)`
4. Centered on origin

### Columns Layout (`columnsLayout`)

Each instance gets an equal-width column spanning full viewport height.

1. Column width = `max(MIN_WIDTH, (viewport.width - gaps) / n)`
2. Column height = `max(MIN_HEIGHT, viewport.height - gap * 2)`
3. Centered on origin

### Rows Layout (`rowsLayout`)

Each instance gets an equal-height row spanning full viewport width.

1. Row width = `max(MIN_WIDTH, viewport.width - gap * 2)`
2. Row height = `max(MIN_HEIGHT, (viewport.height - gaps) / n)`
3. Centered on origin

### Full Screen Stack Layout (`fullScreenStackLayout`)

Each instance takes the full viewport width and height, stacked vertically with a gap between them. The user scrolls vertically between instances.

1. Tile width = `max(MIN_WIDTH, viewport.width - gap * 2)`
2. Tile height = `max(MIN_HEIGHT, viewport.height - gap * 2)`
3. Instances are stacked vertically, each offset by `(tileHeight + gap)`
4. Centered horizontally on origin

## Layout Application (LayoutPicker)

When a layout button is clicked:

1. Collect all visible (non-minimized) instances from the active workspace
2. Compute the canvas viewport size (window width minus sidebar width)
3. Run the layout algorithm with viewport-sized input (minus padding)
4. The algorithm returns positions centered on (0,0) -- shift them so the top-left of the bounding box sits at `(gap, gap)` in world space
5. Apply positions and sizes to each instance via `moveInstance` + `resizeInstance`
6. Reset zoom to 1.0 and pan to (0,0) so the layout fills the canvas exactly

## Presets (`src/renderer/engine/presets.ts`)

### Saving a preset (`savePreset`)

Captures current positions and sizes of all instances into a `LayoutPreset`:

```typescript
{
  id: generateId(),
  name: userProvidedName,
  positions: instances.map(inst => ({
    instanceId: inst.id,
    x: inst.position.x,
    y: inst.position.y,
    w: inst.size.width,
    h: inst.size.height,
  }))
}
```

Stored in `workspace.layoutPresets[]`.

### Applying a preset (`applyPreset`)

Maps saved positions back to current instances using a two-pass strategy:

1. **ID-based matching:** Try to match each instance's ID to a preset position's `instanceId`
2. **If most IDs matched:** Fill unmatched instances with remaining unused preset positions
3. **If no IDs matched** (e.g., all instances were recreated): Fall back to pure index-based mapping

After applying, zoom resets to 1.0 and pan to (0,0).

### Deleting a preset

Shows an inline confirmation within the preset list item. Clicking "Delete" removes the preset from `workspace.layoutPresets[]`.

## LayoutPicker UI (`src/renderer/components/LayoutPicker.tsx`)

A floating panel (fixed position, positioned above the Layout button at `bottom: 46, left: 12`, 236px wide, z-index 9999) with:

1. **Auto-Arrange section:** Four buttons (Grid, Columns, Rows, Full Screen) with unicode icons. The Full Screen button uses the white large square icon (U+2B1C).
2. **Saved Presets section:** List of saved presets, each clickable to apply
   - Delete button on each preset (shows inline confirmation)
3. **Save section:** Text input + Save button to capture current layout as a preset

Closes on outside click (with delayed listener to avoid self-close).
