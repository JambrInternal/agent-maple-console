import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
    const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
    const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_dDp9djoZz';
    const userPoolClientId = import.meta.env.VITE_COGNITO_APP_CLIENT_ID || '2j77g0duot54vs8461u4tbbenp';

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
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_dDp9djoZz',
    userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID || '2j77g0duot54vs8461u4tbbenp',
});
