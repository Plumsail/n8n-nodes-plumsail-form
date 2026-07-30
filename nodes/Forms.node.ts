import type {
    ICredentialsDecrypted,
    ICredentialTestFunctions,
    IDataObject,
    IExecuteFunctions,
    ILoadOptionsFunctions,
    INodeCredentialTestResult,
    INodeExecutionData,
    INodePropertyOptions,
    INodeType,
    INodeTypeDescription
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { getBaseUrl, loadForms, sendApiRequest } from './Utils';

// The class name must match the file basename — n8n's package loader resolves the export by it.
export class Forms implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Plumsail Forms',
        name: 'plumsailForms',
        icon: 'file:icon.svg',
        group: ['transform'],
        version: 1,
        subtitle:
            '={{$parameter["operation"] === "deleteSubmission" ? "Delete a submission" : "Delete an attachment"}}',
        description: 'Manage Plumsail Forms submissions and attachments',
        defaults: {
            name: 'Plumsail Forms'
        },
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        credentials: [
            {
                name: 'plumsailFormsApi',
                required: true,
                testedBy: 'plumsailFormsApiTest'
            }
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Delete Attachment',
                        value: 'deleteAttachment',
                        description: 'Delete an attachment by its URL',
                        action: 'Delete an attachment'
                    },
                    {
                        name: 'Delete Submission',
                        value: 'deleteSubmission',
                        description: 'Delete a form submission by its ID',
                        action: 'Delete a submission'
                    }
                ],
                default: 'deleteSubmission'
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
                displayOptions: {
                    show: {
                        operation: ['deleteSubmission']
                    }
                },
                description:
                    'The form containing the submission you want to delete. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.'
            },
            {
                displayName: 'Submission ID',
                name: 'submissionId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['deleteSubmission']
                    }
                },
                placeholder: '2020-03-31T13:00:00-7e00a789-d102-4f2a-8c3e-33987c2b0dca',
                description: 'ID of the submission to delete (its __id field)'
            },
            {
                displayName: 'File URL',
                name: 'fileUrl',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['deleteAttachment']
                    }
                },
                description: 'URL of the uploaded file to delete'
            }
        ]
    };

    methods = {
        credentialTest: {
            // "Test" button in the credential dialog. The credential itself cannot declare a static
            // test request because the base URL is computed from the key's region prefix.
            async plumsailFormsApiTest(
                this: ICredentialTestFunctions,
                credential: ICredentialsDecrypted
            ): Promise<INodeCredentialTestResult> {
                const apiKey = credential.data?.apiKey as string;

                try {
                    await this.helpers.request({
                        method: 'GET',
                        url: `${getBaseUrl(apiKey)}/v2/designer/forms`,
                        headers: { 'X-Api-Key': apiKey },
                        json: true
                    });
                } catch (error) {
                    return { status: 'Error', message: (error as Error).message };
                }

                return { status: 'OK', message: 'Authentication successful' };
            }
        },
        loadOptions: {
            async getForms(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
                return loadForms.call(this);
            }
        }
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        const operation = this.getNodeParameter('operation', 0);

        for (let i = 0; i < items.length; i++) {
            try {
                let responseData: IDataObject | IDataObject[];

                if (operation === 'deleteSubmission') {
                    const formId = this.getNodeParameter('formId', i) as string;
                    const submissionId = this.getNodeParameter('submissionId', i) as string;

                    await sendApiRequest.call(
                        this,
                        'DELETE',
                        `forms/${formId}/submissions/${encodeURIComponent(submissionId)}`
                    );
                    responseData = { success: true };
                } else if (operation === 'deleteAttachment') {
                    const fileUrl = this.getNodeParameter('fileUrl', i) as string;

                    // The endpoint expects the URL as a JSON string body: "https://..."
                    await sendApiRequest.call(this, 'DELETE', 'attachments', JSON.stringify(fileUrl), undefined, {
                        json: false,
                        headers: { 'Content-Type': 'application/json' }
                    });
                    responseData = { success: true };
                } else {
                    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported`, {
                        itemIndex: i
                    });
                }

                const executionData = this.helpers.constructExecutionMetaData(
                    this.helpers.returnJsonArray(responseData),
                    { itemData: { item: i } }
                );
                returnData.push(...executionData);
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: (error as Error).message },
                        pairedItem: { item: i }
                    });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }
}
