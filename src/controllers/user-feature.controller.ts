import {inject} from '@loopback/core';
import {
  Filter,
  repository
} from '@loopback/repository';
import {
  Response,
  RestBindings,
  get,
  getModelSchemaRef,
  param,
  response
} from '@loopback/rest';
import {UserFeatureModel} from '../models';
import {UserFeatureRepository} from '../repositories';

export class UserFeatureController {
  constructor(
    @repository(UserFeatureRepository)
    public userFeatureRepository: UserFeatureRepository,
    @inject(RestBindings.Http.RESPONSE)
    public response: Response
  ) { }

  @get('/user-features')
  @response(200, {
    description: 'Array of UserFeatureModel model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UserFeatureModel, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(UserFeatureModel) filter?: Filter<UserFeatureModel>,
  ): Promise<Response<any, Record<string, any>>> {
    await this.userFeatureRepository.find(filter).then(res => {
      this.response.status(200).send({"data": res})
    }).catch(err => {
      this.response.status(500).send({"message": "Encountered Error while fetching All Featues"})
    });
    return this.response;
  }

  @get('/user-features/{userID}')
  @response(200, {
    description: 'UserFeatureModel model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UserFeatureModel, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('userID') userID: string,
    // @param.filter(UserFeatureModel, {exclude: 'where'}) filter?: FilterExcludingWhere<UserFeatureModel>
  ): Promise<Response<any, Record<string, any>>> {
    this.userFeatureRepository.findById(userID.toUpperCase()).then(res => {
      this.response.status(200).send({"data": res})
    }).catch(err => {
      return this.response.status(404).send({"message": "No Records Found", err})
    });
    return this.response;
  }

  /****************************Not required*******************************/


  // @patch('/user-features')
  // @response(200, {
  //   description: 'UserFeatureModel PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(UserFeatureModel, {partial: true}),
  //       },
  //     },
  //   })
  //   userFeature: UserFeatureModel,
  //   @param.where(UserFeatureModel) where?: Where<UserFeatureModel>,
  // ): Promise<Count> {
  //   return this.userFeatureRepository.updateAll(userFeature, where);
  // }

  // @post('/user-features')
  // @response(200, {
  //   description: 'UserFeatureModel model instance',
  //   content: {'application/json': {schema: getModelSchemaRef(UserFeatureModel)}},
  // })
  // async create(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(UserFeatureModel, {
  //           title: 'NewUserFeature'
  //         }),
  //       },
  //     },
  //   })
  //   userFeature: UserFeatureModel,
  // ): Promise<UserFeatureModel> {
  //   return this.userFeatureRepository.create(userFeature);
  // }

  // @get('/user-features/count')
  // @response(200, {
  //   description: 'UserFeatureModel model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(UserFeatureModel) where?: Where<UserFeatureModel>,
  // ): Promise<Count> {
  //   return this.userFeatureRepository.count(where);
  // }

  // @patch('/user-features/{userID}')
  // @response(204, {
  //   description: 'UserFeatureModel PATCH success',
  // })
  // async updateById(
  //   @param.path.string('userID') userID: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(UserFeatureModel, {partial: true}),
  //       },
  //     },
  //   })
  //   userFeature: UserFeatureModel,
  // ): Promise<void> {
  //   await this.userFeatureRepository.updateById(userID, userFeature);
  // }

  //   @put('/user-features/{userID}')
  //   @response(204, {
  //     description: 'UserFeatureModel PUT success',
  //   })
  //   async replaceById(
  //     @param.path.string('userID') userID: string,
  //     @requestBody() userFeature: UserFeatureModel,
  //   ): Promise<void> {
  //     await this.userFeatureRepository.replaceById(userID, userFeature);
  //   }

  //   @del('/user-features/{userID}')
  //   @response(204, {
  //     description: 'UserFeatureModel DELETE success',
  //   })
  //   async deleteById(@param.path.string('userID') userID: string): Promise<void> {
  //     await this.userFeatureRepository.deleteById(userID);
  //   }
}
