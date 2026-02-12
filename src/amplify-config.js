import { Amplify } from 'aws-amplify';
import { getAppConfig } from './config/runtimeConfig';

export const configureAmplify = () => {
    const config = getAppConfig();
    const region = config.AWS_REGION;
    const userPoolId = config.COGNITO_USER_POOL_ID;
    const userPoolClientId = config.COGNITO_APP_CLIENT_ID;

    Amplify.configure({
        Auth: {
            Cognito: {
                userPoolId,
                userPoolClientId,
                region
            }
        }
    });
};

export const getAmplifyAuthConfig = () => {
    const config = getAppConfig();
    return {
        region: config.AWS_REGION,
        userPoolId: config.COGNITO_USER_POOL_ID,
        userPoolClientId: config.COGNITO_APP_CLIENT_ID,
    };
};
