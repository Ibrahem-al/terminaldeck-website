# Startup Commands

Startup commands are automatically executed when a terminal instance is created. They follow a three-level cascade: Global > Project > Instance.

## Command Cascade

Defined in `src/main/pty/startupCommands.ts`.

### resolveStartupCommands(global, project, instance, mode)

- **`'extend'` mode (default):** Final commands = `[...global, ...project, ...instance]`
- **`'override'` mode:** Final commands = `[...instance]` (global and project commands are skipped)

Empty strings are filtered out after concatenation.

### Where commands are defined

| Level | Storage | Configured in |
|-------|---------|---------------|
| Global | `settings.globalStartupCommands` | Settings panel > Startup tab |
| Project | `project.startupCommands` | Project Settings dialog or New Project dialog |
| Instance | `instance.startupCommands` | Instance Settings dialog |

### Working directory inheritance

When a new instance is created (`createInstance` action in the store):
1. If instance belongs to a project with a `workingDirectory`, use that
2. Otherwise, if `settings.defaultWorkingDirectory` is set, use that
3. Otherwise, `undefined` (node-pty falls back to `HOME`/`USERPROFILE`/`cwd`)

The instance's `workingDirectory` can also be overridden per-instance via Instance Settings.

## Execution (`executeStartupCommands` in `src/main/pty/startupCommands.ts`)

### Trigger

Called in `pty:create` IPC handler (`src/main/pty/ptyIpc.ts`, line 37) when `startupCommands` is non-empty.

### Execution flow

1. Register an exit listener to set `exited = true` (stops sending commands to dead PTY)
2. Register a data listener that fires once on first data event:
   - Set `initialized = true` (prevents re-entry)
   - Wait **1500ms** for the shell prompt to fully render
   - Send first command via `ptyManager.write(id, command + '\r')`
   - For each subsequent command, wait **1500ms** then send (to give interactive programs like `claude` time to initialize)
   - If PTY exits during sequence, stop immediately

### Timing

```
PTY spawned
  |
  v
First data event (shell init output)
  |-- wait 1500ms
  |
  v
Send command[0] + '\r'
  |-- wait 1500ms
  |
  v
Send command[1] + '\r'
  |-- wait 1500ms
  ...
```

### Key details

- Commands are sent by writing directly to the PTY with a `\r` (carriage return) appended
- The 1500ms initial delay allows the shell prompt to render (important for shells like PowerShell that take time to initialize)
- The 1500ms inter-command delay gives interactive programs like `claude` time to initialize before the next command is sent
- If the PTY process exits during command execution, remaining commands are skipped
- Errors in `ptyManager.write()` are caught and logged, but execution continues to the next command (PTY may have been killed for one command but recoverable)

## How commands reach the PTY

The flow from UI to execution:

1. User creates instance (via sidebar button, command palette, etc.)
2. Store's `createInstance` action inherits project startup commands into `instance.startupCommands`
3. `TerminalPanel` component mounts, reads `startupCommands` from store
4. `useTerminal` hook passes `startupCommands` in PTY options
5. `ptyCreate()` IPC sends commands to main process
6. `ptyIpc.ts` handler calls `executeStartupCommands()` if commands are provided
7. `executeStartupCommands()` waits for shell init then sends commands sequentially

## startupMode

The `startupMode` field on `Instance` controls how instance-level commands combine with global and project commands:

- **`'extend'`** (default): Instance commands are appended after global and project commands
- **`'override'`**: Only instance commands are used; global and project commands are skipped

This is resolved by `resolveStartupCommands()` before the commands are passed to `executeStartupCommands()`.

Note: Currently, the resolution of the cascade happens at instance creation time in the store, not at PTY creation time. The `startupCommands` array passed to `ptyCreate` is already the final resolved list.
