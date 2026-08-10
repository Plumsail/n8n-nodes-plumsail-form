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

The trigger outputs the submitted form data. For example:

```json
[
  {
    "Text1": "Sample text",
    "Date1": "2026-01-01T00:00:00Z",
    "DropDown1": "Option 1",
    "Attachments1": [
      {
        "id": ".../9f2c4d81-6b3e-4a57-8d10-2e7f5c9a1b34/4c81a7e6-Document.pdf",
        "file": "Document.pdf",
        "url": "https://plumsailforms.blob.core.windows.net/.../4c81a7e6-Document.pdf",
        "uid": "4c81a7e6-2d95-4b13-9f08-7a6e3c5d0182",
        "size": 12345
      }
    ],
    "__id": "9f2c4d81-6b3e-4a57-8d10-2e7f5c9a1b34"
  }
]
```

`__id` is a system field present in every form submission. It contains the ID of the submission and can be used in the **Submission → Delete** action to remove the submission from your Plumsail Account once you no longer need it.

The attachment `url` can be used in the **Attachment → Delete** action to remove an attachment from Plumsail storage once it has been processed.

### Actions

Add the *Plumsail Forms* node, select an operation (Submission → Delete or Attachment → Delete), and provide the required fields.
