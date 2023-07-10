import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FeatureDataSource} from '../datasources';
import {FlowModel, FlowModelRelations} from '../models';

export class FlowModelRepository extends DefaultCrudRepository<
  FlowModel,
  typeof FlowModel.prototype.id,
  FlowModelRelations
> {
  constructor(
    @inject('datasources.feature') dataSource: FeatureDataSource,
  ) {
    super(FlowModel, dataSource);
  }
}
