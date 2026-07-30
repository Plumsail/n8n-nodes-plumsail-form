import type {
    IDataObject,
    IExecuteFunctions,
    IHookFunctions,
    IHttpRequestMethods,
    IHttpRequestOptions,
    ILoadOptionsFunctions,
    INodePropertyOptions,
    IWebhookFunctions,
    JsonObject
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Derives the API base URL from the key's region prefix (keys look like "us_ab12...").
 * eu (the primary region) lives on the apex domain; any other prefix maps to its own
 * subdomain ({region}-forms.plumsail.com), so new regions work without a package update.
 * A key without a region prefix is not a valid Forms API key and is rejected.
 *
 * PLUMSAIL_FORMS_BASE_URL overrides this entirely when set, for pointing a local n8n
 * instance at a local API during development — see README "Run (dev, local API)". It has no
 * effect on the published package's default behavior, which always targets production.
 */
export function getBaseUrl(apiKey: string): string {
    if (process.env.PLUMSAIL_FORMS_BASE_URL) {
        return process.env.PLUMSAIL_FORMS_BASE_URL.replace(/\/+$/, '');
    }

    const separator = apiKey.indexOf('_');
    if (separator <= 0) {
        throw new Error('Invalid API key');
    }

    const region = apiKey.slice(0, separator).toLowerCase();

    return region === 'eu'
        ? 'https://forms.plumsail.com/api'
        : `https://${region}-forms.plumsail.com/api`;
}

/**
 * Makes a request to the Plumsail Forms API with the X-Api-Key header attached
 * by the plumsailFormsApi credential.
 *
 * @param method
 * @param endpoint path relative to the base URL, without a leading slash, e.g. "v2/designer/forms"
 * @param body
 * @param qs
 * @param option   extra request options merged in last (e.g. raw body + custom headers)
 */
export async function sendApiRequest(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body?: unknown,
    qs?: IDataObject,
    option: Partial<IHttpRequestOptions> = {}
) {
    const credentials = await this.getCredentials('plumsailFormsApi');
    const baseUrl = getBaseUrl(credentials.apiKey as string);

    const options: IHttpRequestOptions = {
        method,
        url: `${baseUrl}/${endpoint}`,
        qs,
        json: true,
        ...option
    };

    if (body !== undefined) {
        options.body = body;
    }

    try {
        return await this.helpers.httpRequestWithAuthentication.call(this, 'plumsailFormsApi', options);
    } catch (error) {
        throw new NodeApiError(this.getNode(), error as JsonObject);
    }
}

/**
 * Loads the user's public forms for "Form" drop-downs.
 */
export async function loadForms(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const forms = (await sendApiRequest.call(this, 'GET', 'v2/designer/forms')) as Array<{
        id: string;
        name: string;
    }>;

    return forms
        .map((form) => ({ name: form.name || form.id, value: form.id }))
        .sort((a, b) => a.name.localeCompare(b.name));
}
