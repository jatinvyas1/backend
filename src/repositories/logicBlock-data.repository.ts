import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FeatureDataSource} from '../datasources';
import {LogicBlockModel, LogicBlockModelRelations} from '../models';

export class LogicBlockModelRepository extends DefaultCrudRepository<
  LogicBlockModel,
  typeof LogicBlockModel.prototype.block_id,
  LogicBlockModelRelations
> {
  constructor(
    @inject('datasources.FeatureDataSource') dataSource: FeatureDataSource,
  ) {
    super(LogicBlockModel, dataSource);
  }
}
