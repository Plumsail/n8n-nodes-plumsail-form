import type {
    IHookFunctions,
    ILoadOptionsFunctions,
    INodePropertyOptions,
    INodeType,
    INodeTypeDescription,
    IWebhookFunctions,
    IWebhookResponseData
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { loadForms, sendApiRequest } from '../Utils';

// The class name must match the file basename — n8n's package loader resolves the export by it.
export class PlumsailFormsTrigger implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Plumsail Forms Trigger',
        name: 'plumsailFormsTrigger',
        icon: 'file:../icon.svg',
        group: ['trigger'],
        version: 1,
        usableAsTool: true,
        subtitle: 'New submission',
        description: 'Starts the workflow when a Plumsail form is submitted',
        defaults: {
            name: 'Plumsail form is submitted'
        },
        inputs: [],
        outputs: [NodeConnectionTypes.Main],
        credentials: [
            {
                name: 'plumsailFormsApi',
                required: true
            }
        ],
        webhooks: [
            {
                name: 'default',
                httpMethod: 'POST',
                responseMode: 'onReceived',
                path: 'webhook'
            }
        ],
        properties: [
            {
                displayName: 'Event',
                name: 'event',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Form Submitted',
                        value: 'formSubmitted',
                        description: 'Starts the workflow when a Plumsail form is submitted',
                        action: 'Form is submitted'
                    }
                ],
                default: 'formSubmitted'
            },
            {
                displayName: 'Form Name or ID',
                name: 'formId',
                type: 'options',
                typeOptions: {
                    loadOptionsMethod: 'getForms'
                },
                default: '',
                required: true,
                description:
                    'The Plumsail form to watch for new submissions. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.'
            }
        ]
    };

    methods = {
        loadOptions: {
            async getForms(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
                return loadForms.call(this);
            }
        }
    };

    webhookMethods = {
        default: {
            async checkExists(this: IHookFunctions): Promise<boolean> {
                const webhookData = this.getWorkflowStaticData('node');
                return webhookData.subscriberId !== undefined;
            },

            // POST api/submissions { formId, callbackUrl } responds with the subscriber ID (a GUID).
            async create(this: IHookFunctions): Promise<boolean> {
                const webhookUrl = this.getNodeWebhookUrl('default');
                const formId = this.getNodeParameter('formId') as string;

                const subscriberId = await sendApiRequest.call(this, 'POST', 'submissions', {
                    formId,
                    callbackUrl: webhookUrl
                });

                const webhookData = this.getWorkflowStaticData('node');
                webhookData.subscriberId = subscriberId;

                return true;
            },

            async delete(this: IHookFunctions): Promise<boolean> {
                const webhookData = this.getWorkflowStaticData('node');
                if (webhookData.subscriberId === undefined) {
                    return true;
                }

                try {
                    await sendApiRequest.call(this, 'DELETE', `submissions/${webhookData.subscriberId}`);
                } catch (error) {
                    this.logger.error('Failed to delete Plumsail Forms webhook subscription', { error });
                    return false;
                }

                delete webhookData.subscriberId;
                return true;
            }
        }
    };

    // The service POSTs the submission payload as-is; pass it through to the workflow.
    async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
        const body = this.getBodyData();

        return {
            workflowData: [this.helpers.returnJsonArray(body)]
        };
    }
}
