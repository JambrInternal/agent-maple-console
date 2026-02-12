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

export const getAmplifyAuthConfig = () => ({
    region: getAppConfig().AWS_REGION,
    userPoolId: getAppConfig().COGNITO_USER_POOL_ID,
    userPoolClientId: getAppConfig().COGNITO_APP_CLIENT_ID,
});
