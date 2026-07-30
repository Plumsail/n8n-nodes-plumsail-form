# Plumsail Forms — n8n connector (contributing)

For the end-user-facing description, see [README.md](README.md).

## Layout
```
apps/n8n/
├── credentials/PlumsailFormsApi.credentials.ts
├── nodes/
│   ├── Forms.node.ts         # actions + credential test
│   ├── FormsTrigger.node.ts  # submission webhook trigger
│   ├── Utils.ts              # request helper, base URL, forms loader
│   └── icon.svg
└── package.json               # "n8n" section registers nodes/credentials
```

## Setup (once)

```bash
npm install -g n8n
cd apps/n8n && yarn install && yarn build
npm link

mkdir -p ~/.n8n/custom && cd ~/.n8n/custom   # %USERPROFILE%\.n8n\custom on Windows
npm init -y
npm link n8n-nodes-plumsail-forms
```

## Run (dev, local API)

```bash
yarn build   # after any code change

PLUMSAIL_FORMS_BASE_URL=http://localhost:32101/api n8n start   # bash
$env:PLUMSAIL_FORMS_BASE_URL="http://localhost:32101/api"; n8n start   # PowerShell
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
