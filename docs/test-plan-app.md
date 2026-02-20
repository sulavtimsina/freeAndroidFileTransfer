# Desktop App Test Plan

**Ticket:** JP-017  
**Author:** Riku (QA)  
**Date:** 2026-02-20  
**App:** Android File Transfer (Desktop)

---

## Test Case Format

| Field | Description |
|-------|-------------|
| **ID** | Unique identifier (section prefix + number) |
| **Description** | What is being tested |
| **Preconditions** | Required state before test |
| **Steps** | Numbered actions to perform |
| **Expected** | Expected outcome |
| **Priority** | P0 (critical) / P1 (high) / P2 (medium) / P3 (low) |
| **Type** | Manual / Automated / Both |

---

## 1. Device Detection

| ID | Description | Preconditions | Steps | Expected | Priority | Type |
|----|-------------|---------------|-------|----------|----------|------|
| DD-001 | Connect single device | App running, no device connected | 1. Connect Android device via USB 2. Unlock device 3. Accept MTP prompt | App detects device within 5s, shows device name and storage | P0 | Both |
| DD-002 | Disconnect device | Device connected and browsing files | 1. Unplug USB cable | App shows disconnected state, file list cleared, no crash | P0 | Both |
| DD-003 | Reconnect after disconnect | Previously connected then disconnected | 1. Reconnect USB cable 2. Accept MTP prompt | App re-detects device, shows file list | P0 | Both |
| DD-004 | Multiple devices connected | Two+ Android devices available | 1. Connect first device 2. Connect second device | App shows device selector or handles gracefully | P1 | Manual |
| DD-005 | Connection timeout | App running, device connected but MTP not accepted | 1. Connect device 2. Do NOT accept MTP prompt 3. Wait 30s | App shows timeout message with retry option | P1 | Manual |
| DD-006 | Permission denied | Device with USB debugging restrictions | 1. Connect device that denies MTP access | App shows clear permission error with troubleshooting steps | P1 | Manual |
| DD-007 | USB hub connection | App running | 1. Connect device through USB hub | Device detected normally | P2 | Manual |
| DD-008 | Rapid connect/disconnect | App running | 1. Connect device 2. Immediately disconnect 3. Reconnect | No crash, app recovers to correct state | P1 | Both |
| DD-009 | Device sleep during connection | Device connected and idle | 1. Let device screen lock/sleep 2. Wake device | Connection maintained or cleanly re-established | P2 | Manual |

---

## 2. File Browsing

| ID | Description | Preconditions | Steps | Expected | Priority | Type |
|----|-------------|---------------|-------|----------|----------|------|
| FB-001 | Navigate into folder | Device connected, root listing visible | 1. Double-click a folder | Folder contents displayed, path updated | P0 | Both |
| FB-002 | Navigate back (breadcrumb) | Inside a subfolder | 1. Click parent folder in breadcrumb | Navigates to parent, listing updated | P0 | Both |
| FB-003 | Navigate to root via breadcrumb | Deep in folder hierarchy | 1. Click root in breadcrumb | Returns to root listing | P1 | Both |
| FB-004 | Sort by name | Directory with multiple files | 1. Click "Name" column header 2. Click again | Sorts ascending then descending | P1 | Both |
| FB-005 | Sort by size | Directory with multiple files | 1. Click "Size" column header | Files sorted by size | P1 | Both |
| FB-006 | Sort by date | Directory with multiple files | 1. Click "Date" column header | Files sorted by date modified | P1 | Both |
| FB-007 | Search files | Directory with files | 1. Type query in search box | File list filtered to matching results | P1 | Both |
| FB-008 | Empty folder | Device with an empty folder | 1. Navigate into empty folder | Empty state shown ("No files") | P1 | Both |
| FB-009 | Deep path (10+ levels) | Deeply nested folder structure on device | 1. Navigate 10+ levels deep | All levels accessible, breadcrumb scrollable/truncated | P2 | Manual |
| FB-010 | Special characters in filenames | Files with spaces, unicode, emoji, quotes | 1. Navigate to folder with special-char files | All filenames rendered correctly | P1 | Both |
| FB-011 | Large directory (1000+ files) | Folder with 1000+ files | 1. Navigate to large folder | All files listed, no hang (< 5s load) | P1 | Both |
| FB-012 | Refresh file list | File list visible | 1. Add file from device side 2. Refresh/re-navigate | New file appears | P2 | Manual |

---

## 3. File Transfer

| ID | Description | Preconditions | Steps | Expected | Priority | Type |
|----|-------------|---------------|-------|----------|----------|------|
| FT-001 | Transfer small file (< 1MB) | Device connected | 1. Select small file 2. Initiate download | File transferred successfully, matches source | P0 | Both |
| FT-002 | Transfer large file (> 1GB) | Device connected, sufficient disk space | 1. Select large file 2. Initiate download | File transferred completely, progress shown, matches source | P0 | Both |
| FT-003 | Transfer multiple files | Device connected | 1. Select multiple files 2. Initiate download | All files transferred, progress for each shown | P0 | Both |
| FT-004 | Transfer folder with subfolders | Device connected, folder hierarchy on device | 1. Select folder 2. Initiate download | Entire folder structure recreated locally with all files | P0 | Both |
| FT-005 | Cancel mid-transfer | Large file transfer in progress | 1. Start large file transfer 2. Click cancel | Transfer stops, partial file cleaned up, app stable | P0 | Both |
| FT-006 | Upload file to device | Device connected with write access | 1. Select local file 2. Upload to device | File appears on device, matches source | P0 | Both |
| FT-007 | Upload folder to device | Device connected with write access | 1. Select local folder 2. Upload to device | Folder structure recreated on device | P1 | Both |
| FT-008 | Transfer resume after interruption | Transfer was interrupted | 1. Start large transfer 2. Disconnect briefly 3. Reconnect | Transfer resumes or restarts cleanly (no corruption) | P1 | Manual |
| FT-009 | Full storage on destination | Device nearly full | 1. Transfer file larger than available space | Clear error message about insufficient storage | P0 | Both |
| FT-010 | Permission denied on write | Read-only area on device | 1. Try to upload file to restricted path | Clear permission error, no crash | P1 | Manual |
| FT-011 | Overwrite existing file | File with same name exists at destination | 1. Transfer file with same name as existing | Prompt to overwrite/skip/rename | P1 | Both |
| FT-012 | Transfer progress accuracy | Large file transfer | 1. Start transfer 2. Observe progress bar and percentage | Progress reflects actual transfer state, ETA reasonable | P1 | Manual |
| FT-013 | Concurrent transfers | Device connected | 1. Start transfer of file A 2. Start transfer of file B | Both transfers proceed (queued or parallel), both complete | P2 | Both |
| FT-014 | USB disconnect during transfer | Transfer in progress | 1. Start large file transfer 2. Unplug USB cable | Transfer stops with error, app recovers, no corruption | P0 | Manual |

---

## 4. File Operations

| ID | Description | Preconditions | Steps | Expected | Priority | Type |
|----|-------------|---------------|-------|----------|----------|------|
| FO-001 | Create folder | Device connected, in writable directory | 1. Click "New Folder" 2. Enter name 3. Confirm | Folder created on device, appears in listing | P0 | Both |
| FO-002 | Rename file | Device connected, file selected | 1. Right-click file 2. Select rename 3. Enter new name 4. Confirm | File renamed on device | P1 | Both |
| FO-003 | Rename folder | Device connected, folder selected | 1. Right-click folder 2. Select rename 3. Enter new name | Folder renamed on device | P1 | Both |
| FO-004 | Delete single file | Device connected, file selected | 1. Select file 2. Delete 3. Confirm prompt | File removed from device | P0 | Both |
| FO-005 | Delete non-empty folder | Folder with contents selected | 1. Select non-empty folder 2. Delete 3. Confirm | Folder and all contents deleted, or clear warning shown | P1 | Both |
| FO-006 | Rename to existing name | Two files in same directory | 1. Rename file A to file B's name | Error/prompt about name conflict | P1 | Both |
| FO-007 | Create folder with special chars | Device connected | 1. Create folder with unicode/spaces/special chars | Folder created or clear error if chars not supported | P2 | Both |
| FO-008 | Delete confirmation | File selected | 1. Select file 2. Press delete | Confirmation dialog shown before deletion | P0 | Both |
| FO-009 | Cancel delete | File selected, confirm dialog shown | 1. Select file 2. Press delete 3. Cancel confirmation | File not deleted, app returns to normal state | P1 | Both |

---

## 5. Drag and Drop

| ID | Description | Preconditions | Steps | Expected | Priority | Type |
|----|-------------|---------------|-------|----------|----------|------|
| DND-001 | Drag single file from device to desktop | Device connected, file visible | 1. Drag file from app to desktop/Finder | File transferred to drop location | P0 | Manual |
| DND-002 | Drag multiple files from device | Multiple files selected | 1. Select multiple files 2. Drag to desktop | All files transferred | P1 | Manual |
| DND-003 | Drag folder from device | Folder visible in listing | 1. Drag folder to desktop | Entire folder structure transferred | P1 | Manual |
| DND-004 | Drag file from desktop to app | Device connected, local file ready | 1. Drag file from Finder into app window | File uploaded to current device directory | P0 | Manual |
| DND-005 | Drag multiple files into app | Device connected, local files ready | 1. Drag multiple files from Finder into app | All files uploaded | P1 | Manual |
| DND-006 | Drag folder into app | Device connected, local folder ready | 1. Drag folder from Finder into app | Folder and contents uploaded | P1 | Manual |
| DND-007 | Drop zone visual feedback | Device connected | 1. Start dragging file over app window | Drop zone highlighted/indicated | P2 | Manual |
| DND-008 | Drag out of app to invalid target | File selected | 1. Drag file to non-filesystem target | No crash, graceful handling | P2 | Manual |

---

## 6. UI States

| ID | Description | Preconditions | Steps | Expected | Priority | Type |
|----|-------------|---------------|-------|----------|----------|------|
| UI-001 | No device connected state | App launched, no device | 1. Launch app with no device | "Connect a device" prompt with instructions | P0 | Both |
| UI-002 | Connecting state | App running | 1. Connect device | Connecting/loading indicator shown | P1 | Both |
| UI-003 | Connected state | Device connected | 1. Observe UI | Device name, storage info, file listing shown | P0 | Both |
| UI-004 | Disconnected state | Device was connected then removed | 1. Disconnect device | Clear disconnected message, retry option | P0 | Both |
| UI-005 | Loading state (file list) | Navigate to large directory | 1. Open folder with many files | Loading spinner/indicator visible | P1 | Both |
| UI-006 | Error state (generic) | Force an error condition | 1. Trigger error (e.g., read protected dir) | Error message displayed, not raw exception | P1 | Manual |
| UI-007 | Empty state (no files) | Navigate to empty folder | 1. Open empty folder | "No files" or equivalent empty state | P1 | Both |
| UI-008 | Transfer progress state | Transfer in progress | 1. Start file transfer | Progress bar, file name, percentage, ETA visible | P0 | Both |
| UI-009 | Window resize | App running with file list | 1. Resize window to various sizes | Layout adapts, no content clipping, min-size respected | P2 | Manual |
| UI-010 | Dark/light mode | System theme set | 1. Switch OS theme | App follows system theme or has own toggle | P3 | Manual |

---

## 7. Performance

| ID | Description | Preconditions | Steps | Expected | Priority | Type |
|----|-------------|---------------|-------|----------|----------|------|
| PF-001 | App startup time | App closed | 1. Launch app 2. Measure time to interactive | App interactive within 3s (cold start) | P1 | Automated |
| PF-002 | Large directory listing | Folder with 1000+ files on device | 1. Navigate to large folder 2. Measure load time | List renders within 5s, scrolling smooth | P1 | Automated |
| PF-003 | Concurrent transfers performance | Device connected | 1. Start 5+ file transfers simultaneously 2. Monitor CPU/memory | Transfers complete, app responsive, no memory leak | P1 | Automated |
| PF-004 | Memory usage during large transfer | Large file (> 2GB) | 1. Transfer large file 2. Monitor memory | Memory stays bounded (streaming, not buffered entirely) | P1 | Automated |
| PF-005 | Sustained operation | App running with device | 1. Use app continuously for 1 hour | No memory leak, no degradation | P2 | Automated |

---

## 8. Accessibility

| ID | Description | Preconditions | Steps | Expected | Priority | Type |
|----|-------------|---------------|-------|----------|----------|------|
| A11Y-001 | Keyboard navigation - file list | Device connected, file list visible | 1. Tab to file list 2. Use arrow keys 3. Enter to open | All items reachable via keyboard, enter opens folders/files | P1 | Manual |
| A11Y-002 | Keyboard navigation - toolbar | App running | 1. Tab through toolbar buttons | All buttons focusable and activatable via keyboard | P1 | Manual |
| A11Y-003 | Screen reader - file list | Screen reader active (VoiceOver/NVDA) | 1. Navigate file list with screen reader | File names, types, sizes announced correctly | P1 | Manual |
| A11Y-004 | Screen reader - status changes | Screen reader active | 1. Connect/disconnect device 2. Start transfer | State changes announced (connected, progress, complete) | P2 | Manual |
| A11Y-005 | Focus management - dialogs | App running | 1. Open dialog (rename, delete confirm) | Focus moves to dialog, trapped in dialog, returns on close | P1 | Manual |
| A11Y-006 | Focus management - navigation | Navigating folders | 1. Enter folder 2. Go back | Focus position logical after navigation | P2 | Manual |
| A11Y-007 | Keyboard shortcut - delete | File selected | 1. Press Delete/Backspace key | Delete confirmation shown | P2 | Manual |
| A11Y-008 | High contrast / zoom | OS high contrast or zoom enabled | 1. Enable high contrast / 200% zoom 2. Use app | All elements visible and usable | P3 | Manual |

---

## 9. Edge Cases

| ID | Description | Preconditions | Steps | Expected | Priority | Type |
|----|-------------|---------------|-------|----------|----------|------|
| EC-001 | Disconnect during file operation | Rename/delete in progress | 1. Start rename 2. Disconnect USB | Operation fails gracefully with error message | P0 | Manual |
| EC-002 | Very long filename (255+ chars) | File with 255+ char name on device | 1. Navigate to folder with long-name file | Filename displayed (truncated if needed), file operable | P1 | Manual |
| EC-003 | Zero-byte file | Empty file on device | 1. Transfer zero-byte file | File transferred successfully (0 bytes at destination) | P1 | Both |
| EC-004 | Symlinks on device | Symlink present in file listing | 1. Navigate to directory with symlinks | Symlinks shown correctly (or clearly indicated), follow or skip | P2 | Manual |
| EC-005 | Deeply nested path (260+ chars total) | Very deep directory tree | 1. Navigate to deep path | Accessible or clear error about path length | P2 | Manual |
| EC-006 | File changes during listing | Device files changing while browsing | 1. Browse directory 2. Add/delete file from device side 3. Refresh | List updates correctly, no stale entries | P2 | Manual |
| EC-007 | Rapid repeated operations | Device connected | 1. Quickly create/delete/rename multiple items | All operations complete or error cleanly, no race conditions | P1 | Manual |
| EC-008 | App launched with device already connected | Device plugged in before app launch | 1. Connect device 2. Launch app | Device detected on startup | P1 | Both |
| EC-009 | Transfer file with no extension | File without extension on device | 1. Transfer extensionless file | File transfers correctly, no added extension | P2 | Both |
| EC-010 | Hidden files (dot-prefix) | Device has .hidden files | 1. Check if hidden files are shown/toggleable | Hidden files handled per app setting | P2 | Manual |

---

## Test Execution Strategy

### Automated Tests (CI)
- All tests marked **Automated** or **Both** should have automated coverage
- Run on every PR and nightly
- Use mock MTP device for unit/integration tests
- Use real device in nightly E2E suite

### Manual Tests
- Execute before each release
- Focus on drag-and-drop, accessibility, and hardware-specific edge cases
- Maintain manual test session logs

### Priority Execution Order
1. **P0** — Must pass for any release (blockers)
2. **P1** — Must pass for minor/major releases
3. **P2** — Should pass, defer only with justification
4. **P3** — Nice-to-have, test when time permits

---

**Total test cases:** 77  
**P0:** 16 | **P1:** 38 | **P2:** 19 | **P3:** 4
