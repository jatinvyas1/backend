import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FeatureDataSource} from '../datasources';
import {LogicData, LogicDataRelations} from '../models';

export class LogicDataRepository extends DefaultCrudRepository<
  LogicData,
  typeof LogicData.prototype.id,
  LogicDataRelations
> {
  constructor(
    @inject('datasources.FeatureDataSource') dataSource: FeatureDataSource,
  ) {
    super(LogicData, dataSource);
  }
}
