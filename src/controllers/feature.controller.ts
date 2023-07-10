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
import {FeatureIdObj, FeatureModel, FlowModel, UserFeatureModel} from '../models';
import {FeatureDataRepository, FlowModelRepository, UserFeatureRepository} from '../repositories';

export class FeatureController {
  constructor(
    @repository(FeatureDataRepository)
    public featureDataRepository: FeatureDataRepository,
    @repository(UserFeatureRepository)
    public userFeatureRepository: UserFeatureRepository,
    @repository(FlowModelRepository)
    public flowModelRepository: FlowModelRepository,
    @inject(RestBindings.Http.RESPONSE)
    public response: Response
  ) { }

  @post('/feature')
  async create(
    @param.header.string('userID') userID: String,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FeatureModel, {
            title: 'NewFeatureData',
            exclude: ['fid', 'localEvents', 'localVariables', 'flows'],
          }),
        }
      },
    })
    featureData: Omit<FeatureModel, 'fid'>,
  ): Promise<Response<any, Record<string, any>>> {
    let flowData: Omit<FlowModel, 'id'> = JSON.parse(JSON.stringify({
      label: `Flow 1`,
      logicBlocks: [],
      inputBlocks: [],
      outputBlocks: []
    }));
    await this.flowModelRepository.create(flowData).then(async (flow) => {
      const final: FeatureModel = JSON.parse(JSON.stringify(featureData));
      final.flows = [flow];
      const filterName: Filter<FeatureModel> = {
        where: {
          'featureName': {regexp: `/^${final.featureName.toString()}/i`}
        }
      };
      await this.featureDataRepository.find(filterName).then(async (result: any) => {
        if (result.length > 0) {
          await this.flowModelRepository.deleteById(flow.id);
          return this.response.status(409).send({
            message: 'Duplicate Feature Name Not Allowed'
          });
        } else {
          await this.featureDataRepository.create(final).then(async (finalData) => {
            const filter: Filter<UserFeatureModel> = {
              where: {
                'userID': userID.toString().toUpperCase()
              }
            };
            const obj: FeatureIdObj = JSON.parse(JSON.stringify({
              fid: finalData.fid,
              featureName: finalData.featureName,
              featureDescription: finalData.featureDescription
            }))
            await this.userFeatureRepository.findOne(filter).then(res => {
              let response = JSON.parse(JSON.stringify(res));
              let updatedFeatures = [...response.data, obj];
              response.data = updatedFeatures;
              const where: Where<UserFeatureModel> = {'userID': userID.toString().toUpperCase()};
              this.userFeatureRepository.updateAll(response, where);
            }).catch(err => {
              if (Object.keys(err).length > 0) {
                return this.response.status(404).send({message: `${userID} does not exist`, err})
              }
              // const obj: FeatureIdObj = JSON.parse(JSON.stringify({
              //   fid: finalData.fid,
              //   featureName: finalData.featureName,
              //   featureDescription: finalData.featureDescription
              // }))
              // this.userFeatureRepository.create({userID: userID.toString().toUpperCase(), data: [obj]})
            })
            this.response.status(200).send({data: finalData});
          }).catch(err => {
            return this.response.status(500).send({message: JSON.stringify(err)})
          })
        }
      }).catch(err => {
        return this.response.status(409).send({
          message: 'Duplicate Feature Name Not Allowed',
          date: new Date(),
        });
      });
    }).catch(err => {
      return this.response.status(500).send({message: JSON.stringify(err)})
    })
    return this.response
  }

  @get('/feature/{fid}')
  @response(200, {
    description: 'FeatureModel model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(FeatureModel, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('fid') fid: string,
    // @param.filter(FeatureModel, {exclude: 'where'}) filter?: FilterExcludingWhere<FeatureModel>
  ): Promise<Response<any, Record<string, any>>> {
    await this.featureDataRepository.findById(fid).then((res) => {
      if (res === null) this.response.status(404).send({"message": "No Records Found!"})
      this.response.status(200).send({"data": res})
    }).catch(err => {
      return this.response.status(500).send({"message": "Encountered Error while fetching Feature!", err})
    })

    return this.response
  }

  @patch('/feature/{fid}')
  @response(204, {
    description: 'FeatureModel PATCH success',
  })
  async updateById(
    @param.header.string('userID') userID: string,
    @param.path.string('fid') fid: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FeatureModel, {exclude: ['fid', 'flows', 'localEvents', 'localVariables', 'timeStamp']}),
        },
      },
    })
    featureData: FeatureModel,
  ): Promise<Response<any, Record<string, any>>> {
    const filterName: Filter<FeatureModel> = {
      where: {
        'featureName': {regexp: `/^${featureData.featureName.toString()}/i`}
      }
    };
    let oldFeatureData = await this.featureDataRepository.findById(fid);
    if (oldFeatureData.featureName !== featureData.featureName) {
      await this.featureDataRepository.find(filterName).then(async (result: any) => {
        if (result.length > 0) {
          this.response.status(409).send({
            message: "Duplicate Feature Name Not Allowed"
          });
        } else {
          const filter: Filter<UserFeatureModel> = {
            where: {
              'userID': userID.toString().toUpperCase()
            }
          };
          await this.featureDataRepository.updateById(fid, featureData);
          await this.userFeatureRepository.findOne(filter).then(res => {
            let response = JSON.parse(JSON.stringify(res));
            let toUpdate = response.data.filter((ele: any) => ele.fid === fid)[0]
            toUpdate.featureName = featureData.featureName;
            toUpdate.featureDescription = featureData.featureDescription;
            let pos = response.data.findIndex((d: any) => d.fid === fid);
            const flist1 = response.data.splice(0, pos)
            const flist2 = response.data.splice(pos, response.data.length - 1)
            const updatedFeatures = [...flist1, toUpdate, ...flist2];
            response.data = updatedFeatures;
            const where: Where<UserFeatureModel> = {'userID': userID.toString().toUpperCase()};
            this.userFeatureRepository.updateAll(response, where);
            this.response.status(200).send({"message": "Renamed Featued Successfully!"})
          }).catch(err => {
            this.response.status(500).send({"message": "Renamed Featued Failed!"})
          })
        }
      }).catch(err => {
        this.response.status(409).send({"message": "Duplicate Feature Name Not Allowed"})
      })
    } else {
      const filter: Filter<UserFeatureModel> = {
        where: {
          'userID': userID.toString().toUpperCase()
        }
      };
      await this.featureDataRepository.updateById(fid, featureData);
      await this.userFeatureRepository.findOne(filter).then(res => {
        let response = JSON.parse(JSON.stringify(res));
        let toUpdate = response.data.filter((ele: any) => ele.fid === fid)[0]
        toUpdate.featureName = featureData.featureName;
        toUpdate.featureDescription = featureData.featureDescription;
        let pos = response.data.findIndex((d: any) => d.fid === fid);
        const flist1 = response.data.splice(0, pos)
        const flist2 = response.data.splice(pos, response.data.length - 1)
        const updatedFeatures = [...flist1, toUpdate, ...flist2];
        response.data = updatedFeatures;
        const where: Where<UserFeatureModel> = {'userID': userID.toString().toUpperCase()};
        this.userFeatureRepository.updateAll(response, where);
        this.response.status(200).send({"message": "Renamed Featued Successfully!"})
      }).catch(err => {
        this.response.status(500).send({"message": "Renamed Featued Failed!"})
      })
    }
    return this.response
  }

  @del('/feature/{fid}')
  @response(204, {
    description: 'FeatureModel DELETE success',
  })
  async deleteById(
    @param.header.string('userID') userID: string,
    @param.path.string('fid') fid: string
  ): Promise<Response<any, Record<string, any>>> {
    await this.featureDataRepository.findById(fid).then((featureData: any) => {
      let fData = JSON.parse(JSON.stringify(featureData));
      fData.flows.forEach(async (el: any) => {
        await this.flowModelRepository.deleteById(el.id)
      });
    })
    const filter: Filter<UserFeatureModel> = {
      where: {
        'userID': userID.toString().toUpperCase()
      }
    };
    await this.userFeatureRepository.findOne(filter).then(res => {
      let response = JSON.parse(JSON.stringify(res));
      let features = response.data;
      features = features.filter((el: any) => el.fid !== fid);
      response.data = features;
      const where: Where<UserFeatureModel> = {'userID': userID.toString().toUpperCase()};
      this.userFeatureRepository.updateAll(response, where);
    })
    await this.featureDataRepository.deleteById(fid).then(res => {
      this.response.status(200).send({"message": "Successfully deleted Feature"})
    }).catch(err => {
      this.response.status(404).send({"message": "No Records found"})
    });
    return this.response;
  }

  /****************************Not Required**********************************/


  // @put('/feature/{fid}')
  // @response(204, {
  //   description: 'FeatureModel PUT success',
  // })
  // async replaceById(
  //   @param.header.string('userID') userID: string,
  //   @param.path.string('fid') fid: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(FeatureModel, {
  //           title: 'NewFeatureData',
  //           exclude: ['fid'],
  //         }),
  //       }
  //     },
  //   })
  //   featureData: FeatureModel,
  // ): Promise<void> {
  //   await this.featureDataRepository.replaceById(fid, featureData);
  //   const filterQuery: Filter<UserFeatureModel> = {
  //     where: {
  //       'userID': userID.toString().toUpperCase()
  //     }
  //   };
  //   await this.userFeatureRepository.findOne(filterQuery).then(async res => {
  //     let response = JSON.parse(JSON.stringify(res));
  //     let updatedData = response.data.filter((ele: any) => ele.fid !== fid)
  //     let updatedFeature = {...featureData, fid}
  //     let updatedFeatures = [...updatedData, updatedFeature];
  //     response.data = updatedFeatures;
  //     const where: Where<UserFeatureModel> = {'userID': userID.toString().toUpperCase()};
  //     await this.userFeatureRepository.updateAll(response, where)
  //   }).catch(err => {
  //     console.error("Encountered an error!! User Data not found", JSON.stringify(err))
  //   })
  // }

  // @get('/feature/count')
  // @response(200, {
  //   description: 'FeatureModel model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(FeatureModel) where?: Where<FeatureModel>,
  // ): Promise<Count> {
  //   return this.featureDataRepository.count(where);
  // }

  // @get('/feature')
  // @response(200, {
  //   description: 'Array of FeatureModel model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(FeatureModel, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.filter(FeatureModel) filter?: Filter<FeatureModel>,
  // ): Promise<FeatureModel[]> {
  //   return this.featureDataRepository.find(filter);
  // }

  // @patch('/feature')
  // @response(200, {
  //   description: 'FeatureModel PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(FeatureModel, {partial: true}),
  //       },
  //     },
  //   })
  //   featureData: FeatureModel,
  //   @param.where(FeatureModel) where?: Where<FeatureModel>,
  // ): Promise<Count> {
  //   return this.featureDataRepository.updateAll(featureData, where);
  // }

}
