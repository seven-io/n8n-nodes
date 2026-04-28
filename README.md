<p align="center">
  <img src="https://www.seven.io/wp-content/uploads/Logo.svg" width="250" alt="seven logo" />
</p>

<h1 align="center">seven Nodes for n8n</h1>

<p align="center">
  Official community node for <a href="https://n8n.io">n8n</a> that lets you send SMS, place text-to-speech calls and run number lookups via the seven gateway.
</p>

<p align="center">
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/License-MIT-teal.svg" alt="MIT License" /></a>
  <a href="https://www.npmjs.com/package/n8n-nodes-seven"><img src="https://img.shields.io/npm/v/n8n-nodes-seven" alt="npm" /></a>
  <img src="https://img.shields.io/badge/n8n-community%20node-ea4b71" alt="n8n community node" />
  <img src="https://img.shields.io/badge/Node.js-20.15%2B-brightgreen" alt="Node.js 20.15+" />
</p>

---

## Features

- **Seven Node** - Drop-in n8n node with operations for SMS, Voice and number lookups
- **API-Key or OAuth2** - Authenticate with `SevenApi` (API key) or `SevenOAuth2Api` (OAuth2)
- **Submit-on-Save Forms** - Standard n8n parameter UI for every operation

## Prerequisites

- A self-hosted [n8n](https://n8n.io) instance
- A [seven account](https://www.seven.io/) with API key ([How to get your API key](https://help.seven.io/en/developer/where-do-i-find-my-api-key))

## Installation

### From the n8n community node manager

In n8n, go to **Settings > Community Nodes**, install `n8n-nodes-seven`.

### Manual

```bash
cd ~/.n8n/custom
npm install n8n-nodes-seven
```

Restart n8n so the node appears in the palette.

## Configuration

Add credentials in **Credentials > New** and pick either:

| Credential | When to use |
|------------|-------------|
| `SevenApi` | Plain API-key auth (most users) |
| `SevenOAuth2Api` | OAuth2-based auth (multi-tenant setups) |

Reference the credential in any *Seven* node.

## Operations

The Seven node exposes the seven REST API as discrete operations:

- **SMS** - Send SMS, schedule, flash, performance tracking
- **Voice** - Place text-to-speech calls
- **Lookup** - HLR / MNP / CNAM / Format

See `nodes/Seven/description/` in the source for the full per-operation parameter list.

## Development

```bash
npm install
npm run dev          # tsc watch
npm run build        # production build + icon copy
npm run lint         # eslint
```

## Support

Need help? Feel free to [contact us](https://www.seven.io/en/company/contact/) or [open an issue](https://github.com/seven-io/n8n-nodes/issues).

## License

[MIT](LICENSE.md)
