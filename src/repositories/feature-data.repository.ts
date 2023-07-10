import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FeatureDataSource} from '../datasources';
import {FeatureDataRelations, FeatureModel} from '../models';

export class FeatureDataRepository extends DefaultCrudRepository<
  FeatureModel,
  typeof FeatureModel.prototype.fid,
  FeatureDataRelations
> {
  constructor(
    @inject('datasources.feature') dataSource: FeatureDataSource,
  ) {
    super(FeatureModel, dataSource);
  }
}
