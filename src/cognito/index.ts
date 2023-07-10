import {IResponseType} from '../controllers';
import {
  decodeJWTToken,
  getAuthDetails,
  getCognitoAttributeList,
  getCognitoUser,
  getUserPool,
  initAWS,
  setCognitoAttributeList,
} from './../lib/AwsConfig';

const signUp = (
  userID: string,
  email: string,
  password: string,
  agent = 'none',
): Promise<IResponseType> => {
  return new Promise(resolve => {
    initAWS();
    setCognitoAttributeList(email, agent);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    getUserPool().signUp(
      userID,
      password,
      getCognitoAttributeList(),
      null,
      function (err: any, result: any) {
        if (err) {
          return resolve({statusCode: 422, response: err});
        }
        const response = {
          username: result.user.username,
          userConfirmed: result.userConfirmed,
          userAgent: result.user.client.userAgent,
        };
        return resolve({statusCode: 201, response: response});
      },
    );
  });
};

const verify = (userID: string, code: string): Promise<IResponseType> => {
  return new Promise(resolve => {
    getCognitoUser(userID).confirmRegistration(
      code,
      true,
      (err: any, result: any) => {
        if (err) {
          return resolve({statusCode: 422, response: err});
        }
        return resolve({statusCode: 400, response: result});
      },
    );
  });
};

const signIn = (userID: string, password: string): Promise<IResponseType> => {
  return new Promise(resolve => {
    getCognitoUser(userID).authenticateUser(getAuthDetails(userID, password), {
      onSuccess: (result: any) => {
        const token = {
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        };
        let payload = {
          tid: result.idToken.payload['cognito:username'],
          email: result.idToken.payload['email'],
          name: result.idToken.payload['name'],
          designation: result.idToken.payload['profile'],
        };

        return resolve({
          statusCode: 200,
          response: {token: decodeJWTToken(token), payload},
        });
      },

      onFailure: (err: any) => {
        return resolve({
          statusCode: 400,
          response: err.message || JSON.stringify(err),
        });
      },
    });
  });
};

export {signIn, signUp, verify};
