import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FeatureDataSource} from '../datasources';
import {UserFeatureModel, UserFeatureRelations} from '../models';

export class UserFeatureRepository extends DefaultCrudRepository<
  UserFeatureModel,
  typeof UserFeatureModel.prototype.userID,
  UserFeatureRelations
> {
  constructor(
    @inject('datasources.feature') dataSource: FeatureDataSource,
  ) {
    super(UserFeatureModel, dataSource);
  }
}
