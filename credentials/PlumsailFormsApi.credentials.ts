import type { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

// The class name must match the file basename — n8n's package loader resolves the export by it.
// The `name` property stays lowercase-first camelCase per n8n convention (class name = name capitalized).
export class PlumsailFormsApi implements ICredentialType {
    name = 'plumsailFormsApi';

    displayName = 'Plumsail Forms API';

    documentationUrl = 'https://plumsail.com/docs/forms-web/';

    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: { password: true },
            default: '',
            required: true,
            description:
                'A Plumsail Forms API key. Manage API keys in Plumsail Account → Forms → API keys.'
        }
    ];

    // Every request made with this credential carries the API key header.
    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                'X-Api-Key': '={{$credentials.apiKey}}'
            }
        }
    };

    // No declarative `test` request here: the base URL is computed from the key prefix, which a
    // static test request cannot express. The Forms node provides the test via `testedBy`.
}
