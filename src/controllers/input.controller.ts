import {inject} from '@loopback/core';
import {
  Filter,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  Response,
  response,
  RestBindings,
} from '@loopback/rest';
import {FlowModel, InputBlockModel} from '../models';
import {FeatureDataRepository, FlowModelRepository, InputBlockModelRepository, UserFeatureRepository} from '../repositories';

export class InputController {
  constructor(
    @repository(InputBlockModelRepository)
    public InputBlockModelRepository: InputBlockModelRepository,
    @repository(FlowModelRepository)
    public flowModelRepository: FlowModelRepository,
    @repository(FeatureDataRepository)
    public featureDataRepository: FeatureDataRepository,
    @repository(UserFeatureRepository)
    public userFeatureRepository: UserFeatureRepository,
    @inject(RestBindings.Http.RESPONSE)
    public response: Response
  ) { }

  @post('/input-block')
  async create(
    @param.header.string('userID') userID: string,
    @param.query.string('fid') fid: string,
    @param.query.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(InputBlockModel, {
            title: 'NewInputBlockModel',
            exclude: ['block_id', 'in', 'out']
          }),
        },
      },
    })
    inputBlockModel: Omit<InputBlockModel, 'block_id'>,
  ): Promise<Response<any, Record<string, any>>> {
    await this.InputBlockModelRepository.create(inputBlockModel).then(res => {
      const response = JSON.parse(JSON.stringify(res));
      this.flowModelRepository.findById(id).then(async (flowData) => {
        let inputBlockData: any = flowData.inputBlocks;
        let sameTitleExists: any = inputBlockData?.filter((el: any) => el.title === response.title);
        if (sameTitleExists?.length > 0) {
          this.InputBlockModelRepository.deleteById(response.block_id)
          return this.response.status(409).send({"message": "Duplicate Title cannot exist"});
        } else {
          inputBlockData?.push({id: response.block_id, title: response.title});
          flowData.inputBlocks = inputBlockData;
          const whereFeature: Where<FlowModel> = {'id': id.toString()};
          await this.flowModelRepository.updateAll(flowData, whereFeature);
        }
      }).catch((err) => {
        this.InputBlockModelRepository.deleteById(response.block_id);
        return this.response.status(404).send({message: 'Flow Data not found', err})
      })
      this.response.status(200).send({data: response})
    }).catch(err => {
      return this.response.status(500).send({message: "Error occured while creating block data", err})
    });
    return this.response;
  }

  @get('/input-block')
  @response(200, {
    description: 'Array of InputBlockModel model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(InputBlockModel, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    // @param.filter(InputBlockModel) filter?: Filter<InputBlockModel>,
  ): Promise<Response<any, Record<string, any>>> {
    await this.InputBlockModelRepository.find().then(res => {
      console.log(res)
      this.response.status(200).send({data: res})
    }).catch(err => {
      this.response.status(404).send({message: "Record not found", err})
    });
    return this.response;
  }


  /*************Yet to be implemented***************/
  @patch('/input-block/{block_id}')
  @response(204, {
    description: 'InputBlockModel PATCH success',
  })
  async updateById(
    @param.path.string('block_id') block_id: string,
    @param.query.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(InputBlockModel, {exclude: ['block_id', 'data', 'in', 'out']}),
        },
      },
    })
    inputBlockModel: InputBlockModel,
  ): Promise<Response<any, Record<string, any>>> {
    const filter: Filter<FlowModel> = {
      where: {
        'id': id.toString()
      }
    };
    await this.flowModelRepository.findOne(filter).then(async (res) => {
      let response = JSON.parse(JSON.stringify(res));
      let blockData = response.inputBlocks;
      let isExists = blockData.filter((el: any) => el.title.toLocaleLowerCase() === inputBlockModel.title.toLocaleLowerCase())
      if (isExists.length > 0) {
        this.response.status(409).send({"message": `Flow labeled ${inputBlockModel.title} already exists!`})
      } else {
        let pos = blockData.findIndex((flow: any) => flow.id === block_id);
        if (pos !== -1) {
          const list1 = blockData.splice(0, pos)
          const list2 = blockData.splice(pos - 1, blockData.length - 1)
          const appendedList: Array<FlowModel> = [...list1, {title: inputBlockModel.title, id: block_id}, ...list2];
          response.inputBlocks = appendedList;
          const whereFeature: Where<FlowModel> = {'id': id};
          await this.featureDataRepository.updateAll(response, whereFeature).then(async () => {
            await this.InputBlockModelRepository.updateById(block_id, inputBlockModel)
            this.response.status(200).send({"message": "Successfully renamed Input Block Data"})
          }).catch((err) => {
            return this.response.status(500).send({message: 'Internal Server Error', err})
          });
        } else {
          return this.response.status(400).send({message: 'Bad Request, No such block data found in flow'})
        }
      }
    }).catch((err) => {
      this.response.status(500).send({message: 'Failed to update Block Data', err})
    });
    return this.response
  }

  @put('/input-block/{id}')
  @response(204, {
    description: 'InputBlockModel PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() inputBlockModel: InputBlockModel,
  ): Promise<void> {
    await this.InputBlockModelRepository.replaceById(id, inputBlockModel);
  }

  @del('/input-block/{id}')
  @response(204, {
    description: 'InputBlockModel DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.InputBlockModelRepository.deleteById(id);
  }
}


/*************************************/
// @get('/input-block/count')
//   @response(200, {
//     description: 'InputBlockModel model count',
//     content: {'application/json': {schema: CountSchema}},
//   })
//   async count(
//     @param.where(InputBlockModel) where?: Where<InputBlockModel>,
//   ): Promise<Count> {
//     return this.InputBlockModelRepository.count(where);
//   }

// @get('/input-block/{id}')
//   @response(200, {
//     description: 'InputBlockModel model instance',
//     content: {
//       'application/json': {
//         schema: getModelSchemaRef(InputBlockModel, {includeRelations: true}),
//       },
//     },
//   })
//   async findById(
//     @param.path.string('id') id: string,
//     @param.filter(InputBlockModel, {exclude: 'where'}) filter?: FilterExcludingWhere<InputBlockModel>
//   ): Promise<InputBlockModel> {
//     return this.InputBlockModelRepository.findById(id, filter);
//   }

// @patch('/input-block')
//   @response(200, {
//     description: 'InputBlockModel PATCH success count',
//     content: {'application/json': {schema: CountSchema}},
//   })
//   async updateAll(
//     @requestBody({
//       content: {
//         'application/json': {
//           schema: getModelSchemaRef(InputBlockModel, {partial: true}),
//         },
//       },
//     })
//     inputBlockModel: InputBlockModel,
//     @param.where(InputBlockModel) where?: Where<InputBlockModel>,
//   ): Promise<Count> {
//     return this.InputBlockModelRepository.updateAll(inputBlockModel, where);
//   }
