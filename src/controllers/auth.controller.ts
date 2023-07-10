import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  Response,
  RestBindings,
  getModelSchemaRef,
  post,
  requestBody,
} from '@loopback/rest';
import {signIn, signUp} from '../cognito/index';
import {AuthData} from '../models';
import {AuthDataRepository, UserFeatureRepository} from '../repositories';

export interface IResponseType {
  statusCode: number;
  response: object;
}

export class AuthController {
  constructor(
    @repository(AuthDataRepository)
    public authDataRepository: AuthDataRepository,
    @repository(UserFeatureRepository)
    public userFeatureRepository: UserFeatureRepository,
    @inject(RestBindings.Http.RESPONSE)
    public response: Response,
  ) {}

  @post('/register')
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthData, {}),
        },
      },
    })
    body: AuthData,
  ): Promise<Response<any, Record<string, any>>> {
    const response: IResponseType = await signUp(
      body.userID,
      body.email,
      body.password,
    );
    if (response.statusCode === 201) {
      await this.userFeatureRepository.create({
        userID: body.userID.toString().toUpperCase(),
        data: [],
      });
    }
    return this.response.status(response.statusCode).send(response.response);
  }

  @post('/login')
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthData, {
            exclude: ['email'],
          }),
        },
      },
    })
    body: Omit<AuthData, 'email'>,
  ): Promise<Response<any, Record<string, any>>> {
    const response: IResponseType = await signIn(body.userID, body.password);
    return this.response.status(response.statusCode).send(response.response);
  }
}
