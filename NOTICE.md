# Third-Party Notices & Attribution

`turbowarp-ios` is distributed under **GPL-3.0** (see [`LICENSE`](LICENSE)).
It is a composite build that **combines several existing projects** with original
glue code, so copyright in this repository is held by **multiple parties** — not
by CrispStrobe alone.

## Original work in this repository

The contribution by **CrispStrobe** is © 2026 CrispStrobe, licensed GPL-3.0, and
covers only:

- the assembly/integration of the components below into a working iOS / iPadOS
  LEGO build,
- the LEGO Scratch-Link routing and extension wiring (e.g. the `inject-scratch-link.js`
  shim and LEGO-specific handling), and
- the build configuration and scripts.

CrispStrobe does **not** claim copyright over the bundled third-party code below;
each component retains its own authors' copyright and license.

## Bundled / incorporated third-party components

| Component | Author(s) | License | Location |
|---|---|---|---|
| scratch-gui (TurboWarp fork) | Scratch Foundation + TurboWarp | BSD-3-Clause (base) + GPL-3.0 (TurboWarp modifications) | `src/`, `build*/`, `public/` |
| CodePM (iOS WKWebView container + native Bluetooth bridges) | CodePM authors — <https://forge.apps.education.fr/codepm/app> | per CodePM upstream | `CodePM/` |
| Swifter (embedded HTTP server) | Damian Kołakowski | BSD — see [`CodePM/Swifter/LICENSE`](CodePM/Swifter/LICENSE) | `CodePM/Swifter/` |
| scratch-link (BLE/BT session protocol) | Scratch Foundation | BSD — see `CodePM/ScratchWebKit/Sources/ScratchWebKit/scratch-link/LICENSE` | `CodePM/ScratchWebKit/…/scratch-link/` |

The native Bluetooth bridges themselves originate from **CodePM**; this repository
adapts and routes them for the LEGO extensions rather than authoring them from
scratch.

Each component's own `LICENSE` file is retained in its directory and continues to
apply to that component. The BSD components' copyright notices and license texts
are kept intact as those licenses require.

Because a GPL-3.0 component (TurboWarp's scratch-gui) is incorporated, the
**combined work is distributed under GPL-3.0**. The permissively-licensed (BSD)
components remain under their own terms, which are GPL-compatible.

LEGO® is a trademark of the LEGO Group, which does not sponsor or endorse this software.
