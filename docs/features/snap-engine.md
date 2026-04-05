# Snap Engine, Collision Detection, and Drag

## Overview

Panel drag behavior is orchestrated by the `usePanelDrag` hook (`src/renderer/hooks/usePanelDrag.ts`), which ties together four subsystems:

1. **Snap alignment** (`src/renderer/engine/snap.ts`) -- Magnetic edge snapping
2. **Collision detection** (`src/renderer/engine/collision.ts`) -- Overlap prevention
3. **Z-order management** (`src/renderer/engine/zOrder.ts`) -- Bring-to-front on drag
4. **Group movement** (`src/renderer/engine/grouping.ts`) -- Drag all group members together
5. **Boundary snap-then-breakout** -- Soft boundary clamping

## Snap Algorithm (`src/renderer/engine/snap.ts`)

The snap engine is a pure function: `calculateSnap(dragging, others, threshold) -> SnapResult`.

### Edge comparisons

For each axis, the algorithm compares the dragging rect's edges against every other rect's edges:

**X-axis (5 comparisons per other rect):**
- Left-to-left alignment
- Left-to-right adjacency (snap to right side of neighbor)
- Right-to-left adjacency (snap to left side of neighbor)
- Right-to-right alignment
- Center-to-center alignment

**Y-axis (5 comparisons per other rect):**
- Top-to-top alignment
- Top-to-bottom adjacency
- Bottom-to-top adjacency
- Bottom-to-bottom alignment
- Center-to-center alignment

### Adjacency priority bonus

Adjacency snaps (flush edge-to-edge: left-to-right, right-to-left, top-to-bottom, bottom-to-top) receive a -5px priority bonus applied to their distance score. This means when an adjacency snap and an alignment snap are close in distance, the adjacency snap wins. This makes tiling panels flush against each other feel more natural.

### Snapping logic

For each comparison, if the distance between edges is less than `snapThreshold`, a snap candidate is created. The closest candidate per axis wins (accounting for the adjacency bonus). If both axes have candidates, both are applied (corner snap).

### Snap guides

Each snap candidate generates a `SnapGuide` line (SVG). Vertical guides are drawn for X-axis snaps, horizontal guides for Y-axis snaps. All guides matching the winning snap position are included (not just the closest).

### snapStrengthToThreshold

Maps the 0-1 `snapStrength` setting to a 0-50 pixel threshold: `Math.round(snapStrength * 50)`. At the default strength of 0.8, this gives a 40px snap distance.

### SnapGuide rendering

Guides are stored in the `snapGuidesStore` and rendered by `SnapGuides` (`src/renderer/components/Canvas/SnapGuides.tsx`) as an SVG overlay with dashed blue lines (`#4a9eff44`, strokeWidth 1, dasharray "4 2").

## Collision Detection (`src/renderer/engine/collision.ts`)

Pure function: `resolveCollision(dragging, others, mode) -> CollisionResult`.

### Three overlap modes

| Mode | Behavior |
|------|----------|
| `'allow'` | Position unchanged, no overlap IDs reported |
| `'warning'` | Position unchanged, overlapping IDs reported (for visual highlighting) |
| `'none'` | Position adjusted to nearest non-overlapping spot |

### AABB overlap test

Standard axis-aligned bounding box with a 1px `OVERLAP_TOLERANCE`: two rects overlap if `a.x < b.x + b.width - 1 AND a.x + a.width > b.x + 1 AND a.y < b.y + b.height - 1 AND a.y + a.height > b.y + 1`. The 1px tolerance ensures that panels snapped flush edge-to-edge are not considered overlapping.

### Push-out resolution (mode: 'none')

For each overlapping rect, compute 4 push-out candidates:
- Push left: `x = other.x - dragging.width`
- Push right: `x = other.x + other.width`
- Push up: `y = other.y - dragging.height`
- Push down: `y = other.y + other.height`

Pick the candidate with the smallest Manhattan distance that doesn't overlap any other rect. If no clean single-push exists, fall back to the original position.

## Cascade Push Engine (`src/renderer/engine/cascade.ts`)

The cascade engine handles chain-pushing of panels when one panel grows or moves into its neighbors (used by ResizeHandle in no-overlap mode). It replaced the old single-push collision resolution for resize operations.

### Public API

`solveCascade(sourceId, newBounds, allPanels) -> CascadeResult`

- Takes the source panel's new bounds and all panel rects
- Returns `{ changes: CascadeChange[] }` with updated positions for all affected panels

### Algorithm

1. Build a mutable `Map<string, PanelRect>` of all panels, applying the source's new bounds
2. Call `pushAllOverlaps(sourceId, panels)` which iterates up to 50 times:
   - For each panel overlapping the source, compute overlap on all 4 sides
   - Push the overlapping panel flush against the source on the axis with the **shortest escape** (minimum overlap)
   - Recursively call `pushOverlapsFrom(pushedId, panels, visited, depth)` to chain-push any panels that the pushed panel now overlaps
3. `pushOverlapsFrom` recurses up to depth 30, using a `visited` set to prevent cycles
4. Collect all panels that changed position (>0.5px difference) and return rounded integer coordinates

### Key characteristics

- **No viewport clamping:** Panels can be pushed past the screen edge
- **Flush positioning:** Pushed panels are placed exactly flush against the pusher (no gap)
- **1px overlap tolerance:** Same as collision.ts -- flush panels do not trigger cascade
- **Used by ResizeHandle:** When `overlapMode === 'none'`, ResizeHandle calls `solveCascade` on every mouse move during resize, then applies neighbor changes via `batchUpdateInstances`

## Z-Order Management (`src/renderer/engine/zOrder.ts`)

A Zustand store (not persisted) that tracks panel stacking order:

- `order: string[]` -- Instance IDs sorted back-to-front (last = highest z-index)
- `bringToFront(id)` -- Moves ID to the end of the array
- `getZIndex(id)` -- Returns 1-based position (0 if untracked)

Z-order resets each session. Panels brought to front during drag start get the highest z-index.

## Group Drag (`src/renderer/engine/grouping.ts`)

When a panel with a `groupId` is dragged, all members of the group move by the same delta.

`moveGroup(groupId, deltaX, deltaY, instances)` returns a `Map<string, {x, y}>` of new positions for all group members. The delta is applied to the **starting positions** captured at drag start (not current positions), so movement is always relative to where the drag began.

During group drag, snap guides are not shown (too complex with multiple moving rects).

### Group validation

`canGroup(instanceIds, instances)` returns true if:
- At least 2 instances
- All instances exist
- No instance is already in a different group (all must be ungrouped or in the same group)

## usePanelDrag Hook (`src/renderer/hooks/usePanelDrag.ts`)

### Drag start (`onMouseDown`)
1. Find the instance in the store
2. Call `bringToFront(instanceId)` on z-order store
3. Record starting mouse position and instance position
4. If instance is in a group, record all group members' starting positions
5. Compute boundary edges snapshot from other panels' positions
6. Reset breakout state, clear snap guides
7. Attach `mousemove` and `mouseup` listeners on `document`

### Drag move (mousemove handler)

**Single instance:**
1. Compute delta in world coordinates: `delta = (mousePos - startMouse) / zoom`
2. Compute candidate position: `start + delta`
3. Run snap engine against other panels
4. Apply snap adjustments to position
5. Update snap guides store
6. Run collision detection
7. Apply collision adjustments
8. Apply boundary snap-then-breakout (see below)
9. Commit to store via `moveInstance()`

**Group drag:**
1. Compute delta in world coordinates
2. Call `moveGroup()` with delta applied to starting positions
3. Commit each member's new position to store
4. Clear snap guides (no snapping for groups)

### Drag end (mouseup handler)
1. Clear `isDragging` state
2. Clear snap guides
3. Clear all drag refs
4. Remove event listeners

## Boundary Snap-Then-Breakout

At drag start, the boundary edges are computed from other panels' positions and frozen for the duration of the drag. This prevents the boundary from expanding as the dragged panel moves.

**Boundary edges:**
- `minX = otherBounds.minX - instance.width` (tight top/left)
- `maxX = otherBounds.maxX + canvasMargin` (margin bottom/right)
- `minY = otherBounds.minY - instance.height`
- `maxY = otherBounds.maxY + canvasMargin`

**Behavior per axis:**
1. If the panel position goes past a boundary edge, **snap it to the edge** (clamp).
2. If the user keeps pushing **100px past the edge** (`BREAKOUT_THRESHOLD`), **break through** and allow free movement.
3. Once broken out, if the user pulls back inside the boundary, reset to snapping mode.

This creates a "sticky edge" effect that discourages accidental separation from the panel cluster but allows intentional repositioning.
