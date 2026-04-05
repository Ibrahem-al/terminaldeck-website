# Notifications

Sound and desktop notifications for terminal task completion. When a terminal finishes a task (indicator light transitions from blue to green), TerminalDeck can play an audible chime and/or show a native OS notification. Both notification types are independently togglable in the Notifications tab of Settings.

## When Notifications Fire

Notifications are triggered by the indicator light state machine in `useIndicatorLight`. Specifically, when the indicator transitions from `blue` (actively receiving output) to `green` (task completed), the hook calls `notifyTaskComplete(instanceName)`.

**Important:** Notifications only fire on burst 2 or later. Burst 1 is shell startup (initial prompt rendering), which transitions blue -> off rather than blue -> green. This prevents false notifications when a terminal is first created.

See [Indicator Lights](indicator-lights.md) for full details on burst tracking and the state machine.

## notifyTaskComplete(instanceName)

The main entry point in `src/renderer/utils/notifications.ts`. Fires both notification types in parallel, each respecting its own toggle:

```typescript
export function notifyTaskComplete(instanceName: string): void {
  playNotificationSound();
  showDesktopNotification('Task Complete', `${instanceName} has finished`);
}
```

The instance name is resolved from the store at call time in `useIndicatorLight`, falling back to the raw `instanceId` if the instance can't be found.

## Sound Notifications

A two-tone chime synthesized via the Web Audio API. Controlled by the `soundNotifications` toggle and `notificationVolume` setting.

### Chime Details

| Tone | Frequency | Start | Duration | Waveform |
|------|-----------|-------|----------|----------|
| First (C5) | 523 Hz | 0 ms | 150 ms | sine |
| Second (E5) | 659 Hz | 120 ms | 180 ms | sine |

Both tones use an exponential gain ramp to 0.001 for a smooth fade-out. Peak gain is `notificationVolume * 0.4`.

### AudioContext Handling

- The `AudioContext` is created lazily on first use (not at module load)
- If the context is in a `suspended` state (due to browser/Electron autoplay policy), `resume()` is called before scheduling tones
- If the Web Audio API is unavailable, errors are silently caught

### Early Exit

`playNotificationSound()` returns immediately without creating any audio nodes if:
- `soundNotifications` is `false`, or
- `notificationVolume` is `<= 0`

## Desktop Notifications

Native OS notifications via the `Notification` API. Controlled by the `toastNotifications` toggle.

### Permission Handling

1. If `Notification.permission` is `'granted'` -- show the notification immediately
2. If permission is `'default'` (not yet decided) -- request permission, then show if granted
3. If permission is `'denied'` -- do nothing (no way to re-request)

### Notification Content

- **Title:** `"Task Complete"`
- **Body:** `"<instanceName> has finished"`

If the Notification API is unavailable, errors are silently caught.

## Settings

All notification settings live in `AppSettings` and are configured in the Notifications tab (`NotificationsTab.tsx`).

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `toastNotifications` | boolean | false | Enable native OS desktop notifications |
| `soundNotifications` | boolean | false | Enable audible chime notifications |
| `notificationVolume` | number (0-1) | 0.5 | Chime volume; shown as a 0-100% slider in the UI |

The volume slider (`SliderControl`) is only visible when `soundNotifications` is enabled. It displays integer percentages (0-100) and maps to the 0-1 float stored in `notificationVolume` via `v / 100` on change and `Math.round(v * 100)` on display.

## Key Files

| File | Purpose |
|------|---------|
| `src/renderer/utils/notifications.ts` | `playNotificationSound()`, `showDesktopNotification()`, `notifyTaskComplete()` |
| `src/renderer/hooks/useIndicatorLight.ts` | Calls `notifyTaskComplete` on blue -> green transition (burst 2+) |
| `src/renderer/components/Settings/NotificationsTab.tsx` | Settings UI for toggles and volume slider |
| `src/shared/types.ts` | `AppSettings` fields: `toastNotifications`, `soundNotifications`, `notificationVolume` |
