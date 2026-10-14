<p align="center">
  <img src="https://www.seven.io/wp-content/uploads/Logo.svg" width="250" alt="seven logo" />
</p>

<h1 align="center">seven Nodes for n8n</h1>

<p align="center">
  Official community nodes for <a href="https://n8n.io">n8n</a>: send SMS, RCS and WhatsApp messages, place text-to-speech calls, run number lookups, manage contacts, groups, numbers and subaccounts - and react to inbound events with the seven Trigger.
</p>

<p align="center">
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/License-MIT-teal.svg" alt="MIT License" /></a>
  <a href="https://www.npmjs.com/package/n8n-nodes-seven"><img src="https://img.shields.io/npm/v/n8n-nodes-seven" alt="npm" /></a>
  <img src="https://img.shields.io/badge/n8n-community%20node-ea4b71" alt="n8n community node" />
  <img src="https://img.shields.io/badge/Node.js-20.15%2B-brightgreen" alt="Node.js 20.15+" />
</p>

---

## Features

- **seven Node** - Full API coverage: SMS, Voice, RCS, WhatsApp, Lookup, Account, Journal, Sender Identifier, Numbers, Contacts, Groups and Subaccounts
- **seven Trigger Node** - Webhook trigger for inbound SMS, delivery reports (DLR), voice events, RCS and WhatsApp, with optional HMAC-SHA256 signature verification
- **API-Key or OAuth2** - Authenticate with `SevenApi` (API key) or `SevenOAuth2Api` (OAuth2)
- **Usable as AI tool** - The seven node can be used as a tool by n8n AI agents

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

### Migrating from `@seven.io/n8n-nodes-seven`

Version 0.2.0 was briefly published as `@seven.io/n8n-nodes-seven`. n8n cannot resolve node types from npm scopes containing a dot, so workflows fail with `Unrecognized node type: @seven.io/n8n-nodes-seven`. Uninstall that package, install `n8n-nodes-seven` and re-add the seven nodes to affected workflows.

## Configuration

Add credentials in **Credentials > New** and pick either:

| Credential | When to use |
|------------|-------------|
| `SevenApi` | Plain API-key auth (most users) |
| `SevenOAuth2Api` | OAuth2-based auth (multi-tenant setups) |

Reference the credential in any *seven* node.

## Operations

The seven node exposes the seven REST API as discrete operations:

- **SMS** - Send (schedule, flash, performance tracking, ...) and delete
- **Voice** - Place text-to-speech calls, hang up running calls
- **RCS** - Send messages and rich content, send events, revoke messages
- **WhatsApp** - Send text, template, media, location, contacts and interactive messages, send events, delete messages
- **Lookup** - HLR / MNP / CNAM / Format / RCS capabilities
- **Account** - Balance, pricing, analytics
- **Journal** - Outbound, inbound and voice history
- **Sender Identifier** - Validate caller IDs for voice
- **Number** - Browse available numbers, order, update and delete active numbers
- **Contact** - Full CRUD with pagination
- **Group** - Full CRUD with pagination
- **Subaccount** - Create, list, auto-transfer, credit transfer, delete

The seven Trigger node subscribes to webhooks for these events: inbound SMS, delivery reports (DLR), performance tracking, voice call / status / DTMF, RCS and inbound WhatsApp. Optionally verifies the `X-Signature` header with your signing key.

See `nodes/Seven/description/` in the source for the full per-operation parameter list.

## Development

```bash
pnpm install
pnpm dev             # tsc watch
pnpm build           # production build + icon copy
pnpm lint            # eslint
pnpm test            # jest unit tests
```

### Releasing

Releases are published to npm by the `Publish to npm` GitHub Action with provenance, as n8n requires for community nodes. Bump `version` in `package.json`, merge to `master`, then create a GitHub release with the tag `v<version>`. The action authenticates via npm trusted publishing (OIDC), no npm token is needed.

## Support

Need help? Feel free to [contact us](https://www.seven.io/en/company/contact/) or [open an issue](https://github.com/seven-io/n8n-nodes/issues).

## License

[MIT](LICENSE.md)
