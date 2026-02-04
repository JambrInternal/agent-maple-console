import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
    Amplify.configure({
        Auth: {
            Cognito: {
                userPoolId: 'us-east-1_wqrPDGoaK',
                userPoolClientId: '5smdvd292ve9rrlpm01200ttbl',
                region: 'us-east-1'
            }
        }
    });
};
