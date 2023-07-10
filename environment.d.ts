declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_COGNITO_USER_POOL_ID: string;
      AWS_COGNITO_CLIENT_ID: string;
      AWS_COGNITO_REGION: string;
      AWS_COGNITO_IDENTITY_POOL_ID: string;
      AWS_COGNITO_CLIENT_SECRET?: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { };

