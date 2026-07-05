# turbowarp-ios (LEGO build)

A WKWebView-based iOS / iPadOS app that wraps a pre-built [TurboWarp /
`scratch-gui`](https://github.com/CrispStrobe/brickwright) editor and
intercepts Scratch Link WebSocket calls into native Swift Bluetooth — so
extensions written for ScratchLink desktop work directly on iPad.

Work-in-progress hardware support:

- **LEGO® SPIKE™ Prime / Robot Inventor** — native BLE
- **LEGO® MINDSTORMS® EV3** — native Bluetooth Classic (ExternalAccessory)
- **LEGO® NXT** — Scratch Link emulation
- **TurboWarp features:** 60 FPS, compiler, dark mode, custom extensions

> **iOS Bluetooth caveat:** `navigator.bluetooth` and `navigator.serial`
> don't exist on iOS. The native Scratch-Link emulation in this app is the
> only path to LEGO hardware. Extensions written for Web BT / Web Serial
> won't work — use the ScratchLink-mode variants instead.

## Related repos

| Repo | Role |
|------|------|
| **`turbowarp-ios` (this)** | iOS WKWebView shell + native BLE/BTC Scratch-Link emulation. |
| [`CrispStrobe/brickwright`](https://github.com/CrispStrobe/brickwright) | The editor UI bundled into the app. |
| [`CrispStrobe/extensions`](https://github.com/CrispStrobe/extensions) | Extensions consumed by the editor. |
| [`CrispStrobe/turbowarp-android`](https://github.com/CrispStrobe/turbowarp-android) | Android counterpart. |
| [`CrispStrobe/turbowarp-desktop`](https://github.com/CrispStrobe/turbowarp-desktop) | Electron desktop counterpart. |
| [`CrispStrobe/turbowarp-lego`](https://github.com/CrispStrobe/turbowarp-lego) | Working sandbox + Python bridges (for desktop bridge-mode). |

## Disclaimer

Community-created modification built on:

- [CodePM](https://forge.apps.education.fr/codepm/app) — the iOS native container and Bluetooth bridges.
- [TurboWarp](https://github.com/TurboWarp) — the Scratch compiler and editor.
- [Scratch](https://github.com/LLK/scratch-gui) — the block-based language.

LEGO® is a trademark of the LEGO Group. The LEGO Group does not sponsor,
authorize, or endorse this software.

---

## 📐 Architecture

This is a "Frankenstein" build that combines the **CodePM iOS container** (a WKWebView shell with native Bluetooth bridges) with a **pre-built TurboWarp web app**.

### How It Works

1. **WKWebView** loads `editor.html` from the bundled `build/` folder via `file://`.
2. **Swifter** (an embedded HTTP server on port 8080) serves media assets from `ressources/` and temporary project files.
3. **inject-scratch-link.js** replaces `window.WebSocket` with a shim that intercepts Scratch Link connections (`/scratch/ble` and `/scratch/bt`) and routes them to native Swift code via `webkit.messageHandlers`.
4. **ScratchLink.swift** dispatches to `BLESession` (CoreBluetooth) for BLE devices or `BTSession` (ExternalAccessory) for Bluetooth Classic devices.

### Bluetooth Compatibility on iOS

Extensions using `navigator.serial` (Direct Serial mode) or `navigator.bluetooth` (Web Bluetooth) will **not work** on iOS. Only the **Scratch Link** connection mode works, as it is intercepted and routed to native code.

---

## 📂 Directory Structure

```
repo-root/
├── build/                          ← TurboWarp web app (loaded by WKWebView)
│   ├── editor.html                 ← Main entry point
│   ├── js/                         ← editor.js, chunks, addons, extension worker
│   ├── static/                     ← Block media, assets
│   └── ...
├── CodePM/
│   ├── CodePM/
│   │   ├── ressources/             ← Offline media library (sprites, sounds, ML models)
│   │   │   ├── *.png, *.svg, *.wav ← MD5-named Scratch assets
│   │   │   └── models/             ← ML models (posenet, facemesh, etc.)
│   │   ├── ScratchPMApp.swift      ← App entry point
│   │   ├── MainView.swift
│   │   ├── WebView.swift
│   │   ├── Assets.xcassets
│   │   ├── Release/Info.plist
│   │   └── Debug/
│   ├── CodePM.xcodeproj/
│   ├── ScratchWebKit/
│   │   └── Sources/ScratchWebKit/
│   │       ├── Resources/
│   │       │   └── inject-scratch-link.js   ← WebSocket interceptor
│   │       ├── ScratchLink.swift            ← Message handler & session dispatcher
│   │       ├── BTSession.swift              ← Bluetooth Classic (ExternalAccessory)
│   │       ├── WebViewController.swift      ← WKWebView + Swifter HTTP server
│   │       ├── ScratchWebViewController.swift
│   │       └── WebSocket.swift
│   └── Swifter/                    ← Embedded HTTP server library
├── src/                            ← scratch-gui source (for reference/rebuilds)
├── extensions/                     ← Custom extension source files
├── patches/                        ← Patches for scratch-blocks, scratch-vm
├── dist/                           ← scratch-gui UMD library output
└── package.json
```

**Important:** The Xcode project references `build/` at **repo root level** (`path = ../build`), not inside `CodePM/`. Do not nest it.

---

## 🛠️ Build Instructions

### Prerequisites

* macOS with Xcode 15+
* An Apple Developer account (for device deployment)
* A pre-built TurboWarp `scratch-gui` web build (see the [TurboWarp Desktop repo](https://github.com/CrispStrobe/turbowarp-desktop) for build instructions)
* An iPad running iOS 16+ (recommended)

### The Brain Transplant

Replace the CodePM web app with the TurboWarp build.

```bash
# From repo root:

# 1. Remove the old web app
rm -rf build

# 2. Copy in the TurboWarp web build
#    (Your built TurboWarp files — editor.html, js/, static/, etc.)
cp -R ../turbowarp/scratch-gui/build/* build/

# Verify the key file exists:
ls build/editor.html
# Should exist. If not, check your scratch-gui build output.
```

The `CodePM/CodePM/ressources/` folder already contains the Scratch media library (costumes, sounds, ML models). Leave it as-is.

### The Bridge Patch

The JavaScript shim that intercepts WebSocket connections must handle both Scratch's default URL (`wss://device-manager.scratch.mit.edu:20110/scratch/ble`) and TurboWarp's URL (`ws://127.0.0.1:20111/scratch/ble`).

**File:** `CodePM/ScratchWebKit/Sources/ScratchWebKit/Resources/inject-scratch-link.js`

The patched constructor uses a regex instead of a string prefix match:

```javascript
class ScratchLink {
    constructor(url) {
        // Match any WSS/WS connection ending in /scratch/ble or /scratch/bt
        // This catches 127.0.0.1, localhost, and device-manager on ANY port.
        const scratchLinkPattern = /^wss?:\/\/.*\/scratch\/(ble|bt)$/;

        if (!scratchLinkPattern.test(url)) {
            // Pass through standard WebSockets (like Multiplayer games)
            return new ScratchLink.WebSocket(url);
        }

        console.log("🚀 Intercepted Scratch Link connection:", url);
        this.url = url;
        this._open();
    }
    // ... rest of file unchanged
```

### Swift Entry Point

Ensure the app loads TurboWarp's `editor.html` instead of CodePM's `index.html`.

**File:** `CodePM/ScratchWebKit/Sources/ScratchWebKit/WebViewController.swift`

In the `load(url:)` method, change:

```swift
// BEFORE (CodePM default):
let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "build")!

// AFTER (TurboWarp):
let url = Bundle.main.url(forResource: "editor", withExtension: "html", subdirectory: "build")!
```

### Build and Run

**For development (quickest):**
1. Connect your iPad via USB.
2. Select your iPad as the build target.
3. **Product → Run** (⌘R).

**For distribution:**
1. **Product → Clean Build Folder** (⇧⌘K).
2. Select **"Any iOS Device (arm64)"** as the target.
3. **Product → Archive**.
4. Once archived, click **Distribute App → Custom → Export**.
5. Save the `.ipa` file.

---

## 🔧 How the Extensions Work

The custom LEGO extensions are **baked into the scratch-gui build** (patched into scratch-vm's extension manager and bundled at webpack build time). They are not loaded from external URLs at runtime.

Each extension supports multiple connection backends behind a unified interface:

```
┌─────────────────────┐
│   Scratch Block     │
│   (e.g. "motor on") │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   sendTelegram()    │  ← Unified API
└──────────┬──────────┘
           │
     ┌─────┼──────────────┐
     │     │              │
┌────▼───┐ ┌──▼─────┐ ┌──▼──────┐
│Scratch │ │Direct  │ │Bridge   │
│Link    │ │Serial  │ │WebSocket│
│(BT/BLE)│ │(USB)   │ │(WiFi)   │
└────┬───┘ └────────┘ └─────────┘
     │       ❌ iOS      ✅ iOS
     │
┌────▼───────────────────────────┐
│ inject-scratch-link.js         │
│ (intercepts WebSocket)         │
└────┬───────────────────────────┘
     │
┌────▼───────────────────────────┐
│ ScratchLink.swift              │
│ → BLESession (CoreBluetooth)   │
│ → BTSession (ExternalAccessory)│
└────────────────────────────────┘
```

On iOS, only **Scratch Link mode** and **Bridge mode** (if a bridge server is running on the network) are functional. Direct Serial mode requires Web Serial API which is unavailable on iOS.

---

## 📝 Known Issues & Limitations

* **Bluetooth Classic (EV3/NXT):** iOS restricts Bluetooth Classic to MFi-certified accessories via `ExternalAccessory`. These devices may not appear unless paired at the OS level / recognized as MFi.
* **No Web Serial:** `navigator.serial` is not available in WKWebView. The "Direct Serial" connection mode will not work.
* **No Web Bluetooth:** `navigator.bluetooth` is not available in WKWebView. Extensions must use the Scratch Link protocol path, which is intercepted and handled natively.
* **Asset loading:** Some Scratch assets may fail to load if they are not present in `ressources/`. The Swifter server returns 404 for missing files.
* **File saving:** Project save/download uses WKDownload delegation. Ensure iOS 14.5+ for full support.

---

## 📄 License

MIT

---

## 🙏 Credits

* **[CodePM](https://forge.apps.education.fr/codepm/app)** — iOS container, ScratchLink bridges, Swifter integration
* **[TurboWarp](https://turbowarp.org/)** — High-performance Scratch mod by [@GarboMuffin](https://github.com/GarboMuffin)
* **[Scratch](https://scratch.mit.edu/)** — By the Lifelong Kindergarten Group at MIT Media Lab
* **[Swifter](https://github.com/httpswift/swifter)** — Tiny HTTP server in Swift