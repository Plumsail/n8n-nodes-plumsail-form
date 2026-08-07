# Plumsail Forms n8n Connector

Integrate [Plumsail Forms](https://plumsail.com/forms/public-forms/) with your [n8n](https://n8n.io/) workflows.

## Nodes

- **Plumsail Forms Trigger** — starts a workflow when a form is submitted.
- **Plumsail Forms** — provides the following actions:
  - Submission → Delete
  - Attachment → Delete

## Installation

In n8n, go to **Settings → Community Nodes → Install** and enter:

```
@plumsail/n8n-nodes-plumsail-forms
```

## Credentials

You need a [Plumsail Forms API key](https://account.plumsail.com/forms/api-keys). You can create one in **Plumsail Account → Forms → API keys**.

In n8n, create a **Plumsail Forms API** credential and paste the API key. Click **Test** to verify that the connection works.

## Usage

### Trigger

Add the *Plumsail Forms Trigger* node, select a form from the dropdown, and activate the workflow. New submissions to the selected form will automatically trigger the workflow.

### Actions

Add the *Plumsail Forms* node, select an operation (Submission → Delete or Attachment → Delete), and provide the required fields.
