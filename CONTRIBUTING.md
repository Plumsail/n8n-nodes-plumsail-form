# Plumsail Forms — n8n connector (contributing)

For the end-user-facing description, see [README.md](README.md).

## Layout
```
.
├── credentials/PlumsailFormsApi.credentials.ts
├── nodes/
│   ├── Forms/PlumsailForms.node.ts               # actions + credential test
│   ├── FormsTrigger/PlumsailFormsTrigger.node.ts # submission webhook trigger
│   ├── Utils.ts                                  # request helper, base URL, forms loader
│   └── icon.svg
└── package.json               # "n8n" section registers nodes/credentials
```

## Setup (once)

```bash
npm install -g n8n
yarn install && yarn build
npm link

mkdir -p ~/.n8n/custom && cd ~/.n8n/custom   # %USERPROFILE%\.n8n\custom on Windows
npm init -y
npm link @plumsail/n8n-nodes-plumsail-forms
```

## Run (dev, local API)

`getBaseUrl()` in `nodes/Utils.ts` always derives the API URL from the credential's key prefix
(e.g. `us_...` → `https://us-forms.plumsail.com/api`). To point it at a local API instead,
temporarily replace its body — **do not commit this change**:

```ts
export function getBaseUrl(apiKey: string): string {
    return 'http://localhost:32101/api'; // TEMP: local dev only, revert before committing
}
```

```bash
yarn build   # after any code change
n8n start
```

Open http://localhost:5678

## Run (prod)

```bash
yarn build
n8n start
```

The trigger needs a reachable callback URL. If n8n has no public URL bound (no `WEBHOOK_URL` set), expose it with ngrok:

```bash
ngrok http 5678

WEBHOOK_URL=https://<id>.ngrok.io/ n8n start   # bash
$env:WEBHOOK_URL="https://<id>.ngrok.io/"; n8n start # PowerShell
```

Open http://localhost:5678

## Publish

```bash
yarn build
yarn npm publish
```

Installed via **Settings → Community Nodes**. Verified-node badge needs a [review submission](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/).
