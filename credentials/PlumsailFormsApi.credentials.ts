import type {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties
} from 'n8n-workflow';

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

    // A credential's `test` can only be a declarative request (n8n-workflow's ICredentialTestRequest
    // has no function-valued fields), so it can't call the real getBaseUrl() in Utils.ts. This
    // expression mirrors that function's region-prefix logic — keep the two in sync if it changes.
    // (No $env.PLUMSAIL_FORMS_BASE_URL override here: n8n blocks env access in expressions by
    // default, and that override is a local-dev convenience, not something end users need.)
    test: ICredentialTestRequest = {
        request: {
            baseURL: `={{
                $credentials.apiKey.split("_")[0].toLowerCase() === "eu"
                    ? "https://forms.plumsail.com/api"
                    : "https://" + $credentials.apiKey.split("_")[0].toLowerCase() + "-forms.plumsail.com/api"
            }}`,
            url: '/v2/designer/forms',
            headers: {
                'X-Api-Key': '={{$credentials.apiKey}}'
            }
        }
    };
}
