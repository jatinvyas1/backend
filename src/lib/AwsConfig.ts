import {AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool, ICognitoUserData, ICognitoUserPoolData} from 'amazon-cognito-identity-js';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import jwt_decode from 'jwt-decode';
let cognitoAttributeList: any[] = [];

dotenv.config();

const poolData: ICognitoUserPoolData = {
  UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID as string,
  ClientId: process.env.AWS_COGNITO_CLIENT_ID as string,
  // ClientSecret: process.env.AWS_COGNITO_CLIENT_SECRET as string
};

const attributes = (key: any, value: any) => {
  return {
    Name: key,
    Value: value
  }
};

function setCognitoAttributeList(email: string, agent: any) {
  let attributeList = [];
  attributeList.push(attributes('email', email));

  attributeList.forEach(element => {
    cognitoAttributeList.push(new CognitoUserAttribute(element));
  });
}

function getCognitoAttributeList() {
  return cognitoAttributeList;
}

function getCognitoUser(userID: string) {
  const userData: ICognitoUserData = {
    Username: userID,
    Pool: getUserPool()
  };
  return new CognitoUser(userData);
}

function getUserPool() {
  let pool = new CognitoUserPool(poolData);
  return pool;
}

function getAuthDetails(userID: string, password: string) {
  var authenticationData = {
    Username: userID,
    Password: password,
  };
  return new AuthenticationDetails(authenticationData);
}

function initAWS(region = process.env.AWS_COGNITO_REGION, identityPoolId = process.env.AWS_COGNITO_IDENTITY_POOL_ID) {
  AWS.config.region = region; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId as string,
  });
}

function decodeJWTToken(token: any) {
  const {userID, exp, auth_time, token_use, sub} = jwt_decode<any>(token.idToken);
  return {token, userID, exp, uid: sub, auth_time, token_use};
}

export {
  decodeJWTToken, getAuthDetails, getCognitoAttributeList, getCognitoUser, getUserPool, initAWS, setCognitoAttributeList
};

