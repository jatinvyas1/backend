import {inject} from '@loopback/core';
import {
  Filter,
  Where,
  repository
} from '@loopback/repository';
import {
  Response,
  RestBindings,
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response
} from '@loopback/rest';
import {FeatureModel, FlowIdObj, FlowModel} from '../models';
import {FeatureDataRepository, FlowModelRepository, UserFeatureRepository} from '../repositories';

export class FlowController {
  constructor(
    @repository(FlowModelRepository)
    public flowModelRepository: FlowModelRepository,
    @repository(FeatureDataRepository)
    public featureDataRepository: FeatureDataRepository,
    @repository(UserFeatureRepository)
    public userFeatureRepository: UserFeatureRepository,
    @inject(RestBindings.Http.RESPONSE)
    public response: Response
  ) { }

  @post('/api-flow')
  @response(200, {
    description: 'FlowModel model instance',
    content: {'application/json': {schema: getModelSchemaRef(FlowModel)}},
  })
  async create(
    @param.header.string('userID') userID: string,
    @param.query.string('fid') fid: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FlowModel, {
            title: 'NewFlowModel',
            exclude: ['id', 'outputBlocks', 'inputBlocks', 'logicBlocks']
          }),
        },
      },
    })
    flowModel: Omit<FlowModel, 'id'>,
  ): Promise<Response<any, Record<string, any>>> {
    const filter: Filter<FeatureModel> = {
      where: {
        'fid': fid.toString()
      }
    };
    flowModel.outputBlocks = [];
    flowModel.inputBlocks = [];
    flowModel.logicBlocks = [];
    await this.flowModelRepository.create(flowModel).then(async (flow: any) => {
      let flowData = JSON.parse(JSON.stringify(flow));
      await this.featureDataRepository.findOne(filter).then(async (res) => {
        let response = JSON.parse(JSON.stringify(res));
        let featureData = response.flows;
        let isExists = featureData.filter((el: any) => el.label.toLocaleLowerCase() === flowData.label.toLocaleLowerCase())
        if (isExists.length > 0) {
          this.flowModelRepository.deleteById(flowData.id)
          return this.response.status(409).send({"message": `Flow labeled ${flowData.label} already exists!`})
        } else {
          const appendedList: Array<FlowModel> = [...featureData, {id: flowData.id, label: flowData.label}];
          response.flows = appendedList;
          const whereFeature: Where<FeatureModel> = {'fid': fid.toString()};
          await this.featureDataRepository.updateAll(response, whereFeature);
          this.response.status(201).send({"data": flowData})
        }
      }).catch(err => {
        this.flowModelRepository.deleteById(flowData.id);
        return this.response.status(500).send({"message": "Encountered Error while fetching Flow!", err})
      })
    }).catch((err) => {
      return this.response.status(500).send({"message": "Encountered Error while fetching Flow!", err})
    })
    return this.response
  }

  @del('/api-flow/{id}')
  @response(204, {
    description: 'FlowModel DELETE success',
  })
  async deleteById(
    @param.header.string('userID') userID: string,
    @param.query.string('fid') fid: string,
    @param.path.string('id') id: string
  ): Promise<Response<any, Record<string, any>>> {
    const filter: Filter<FeatureModel> = {
      where: {
        'fid': fid.toString()
      }
    };
    await this.featureDataRepository.findOne(filter).then(async (res) => {
      let response = JSON.parse(JSON.stringify(res));
      let featureData = response.flows;
      featureData = featureData.filter((el: FlowIdObj) => el.id !== id);
      response.flows = featureData;
      const whereFeature: Where<FeatureModel> = {'fid': fid.toString()};
      await this.featureDataRepository.updateAll(response, whereFeature);
    })
    await this.flowModelRepository.deleteById(id).then(res => {
      this.response.status(200).send({"message": "Successfully deleted Flow"})
    }).catch(err => {
      this.response.status(404).send({"message": "No Records found", err})
    });
    return this.response;
  }

  @get('/api-flow/{id}')
  @response(200, {
    description: 'FlowModel model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(FlowModel, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    // @param.filter(FlowModel, {exclude: 'where'}) filter?: FilterExcludingWhere<FlowModel>
  ): Promise<Response<any, Record<string, any>>> {
    this.flowModelRepository.findById(id).then(res => {
      this.response.status(200).send({"data": res})
    }).catch(err => {
      this.response.status(500).send({"message": "No Records Found", err})
    });
    return this.response;
  }

  @patch('/api-flow/{id}')
  @response(204, {
    description: 'FlowModel PATCH success',
  })
  async updateById(
    @param.header.string('userID') userID: string,
    @param.query.string('fid') fid: string,
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FlowModel, {exclude: ['id', 'inputBlocks', 'logicBlocks', 'outputBlocks']}),
        },
      },
    })
    flowModel: FlowModel,
  ): Promise<Response<any, Record<string, any>>> {
    const filter: Filter<FeatureModel> = {
      where: {
        'fid': fid.toString()
      }
    };
    await this.featureDataRepository.findOne(filter).then(async (res) => {
      let response = JSON.parse(JSON.stringify(res));
      let featureData = response.flows;
      let isExists = featureData.filter((el: any) => el.label.toLocaleLowerCase() === flowModel.label.toLocaleLowerCase())
      if (isExists.length > 0) {
        this.response.status(409).send({"message": `Flow labeled ${flowModel.label} already exists!`})
      } else {
        let pos = featureData.findIndex((flow: any) => flow.id === id);
        if (pos !== -1) {
          const list1 = featureData.splice(0, pos)
          const list2 = featureData.splice(pos - 1, featureData.length - 1)
          const appendedList: Array<FeatureModel> = [...list1, {label: flowModel.label, id}, ...list2];
          response.flows = appendedList;
          const whereFeature: Where<FeatureModel> = {'fid': fid.toString()};
          await this.featureDataRepository.updateAll(response, whereFeature);
          await this.flowModelRepository.updateById(id, flowModel)
          this.response.status(200).send({"message": "Successfully Updated Flow!"})
        } else {
          this.response.status(400).send({"message": "Bad Request, No such flow present in feature"})
        }
      }
    }).catch(err => {
      this.response.status(500).send({"message": `Failed to Update Flow! = ${err}`})
    })
    return this.response
  }

  /********************Not Required********************/

  // @get('/api-flow/count')
  // @response(200, {
  //   description: 'FlowModel model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(FlowModel) where?: Where<FlowModel>,
  // ): Promise<Count> {
  //   return this.flowModelRepository.count(where);
  // }

  // @get('/api-flow')
  // @response(200, {
  //   description: 'Array of FlowModel model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(FlowModel, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.filter(FlowModel) filter?: Filter<FlowModel>,
  // ): Promise<FlowModel[]> {
  //   return this.flowModelRepository.find(filter);
  // }

  // @patch('/api-flow')
  // @response(200, {
  //   description: 'FlowModel PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(FlowModel, {partial: true}),
  //       },
  //     },
  //   })
  //   flowModel: FlowModel,
  //   @param.where(FlowModel) where?: Where<FlowModel>,
  // ): Promise<Count> {
  //   return this.flowModelRepository.updateAll(flowModel, where);
  // }

  // @put('/api-flow/{id}')
  // @response(204, {
  //   description: 'FlowModel PUT success',
  // })
  // async replaceById(
  //   @param.header.string('userID') userID: string,
  //   @param.query.string('fid') fid: string,
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(FlowModel, {
  //           exclude: ['id'],
  //         })
  //       }
  //     }
  //   })
  //   flowModel: Omit<FlowModel, 'id'>
  // ): Promise<Response<any, Record<string, any>>> {
  //   const filter: Filter<FeatureModel> = {
  //     where: {
  //       'fid': fid.toString()
  //     }
  //   };
  //   await this.featureDataRepository.findOne(filter).then(async (res) => {
  //     let response = JSON.parse(JSON.stringify(res));
  //     let featureData = response.flows;
  //     let isExists = featureData.filter((el: any) => el.label.toLocaleLowerCase() === flowModel.label.toLocaleLowerCase())
  //     if (isExists.length > 0) {
  //       this.response.status(409).send({"message": `Flow labeled ${flowModel.label} already exists!`})
  //     } else {
  //       await this.flowModelRepository.replaceById(id, flowModel).then(async res => {
  //         let pos = featureData.findIndex((flow: any) => flow.id === id);
  //         const list1 = featureData.splice(0, pos)
  //         const list2 = featureData.splice(pos - 1, featureData.length - 1)
  //         const appendedList: Array<FeatureModel> = [...list1, {label: flowModel.label, id}, ...list2];
  //         response.flows = appendedList;
  //         const whereFeature: Where<FeatureModel> = {'fid': fid.toString()};
  //         await this.featureDataRepository.updateAll(response, whereFeature);
  //         this.response.status(200).send({"message": "Successfully Updated Flow!"})
  //       }).catch(err => {
  //         this.response.status(500).send({"message": `Failed to Update Flow! = ${err}`})
  //       })
  //     };
  //   })
  //   return this.response
  // }
}
