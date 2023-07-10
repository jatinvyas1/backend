import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FeatureDataSource} from '../datasources';
import {AuthData, AuthDataRelations} from '../models';

export class AuthDataRepository extends DefaultCrudRepository<
  AuthData,
  typeof AuthData.prototype.userID,
  AuthDataRelations
> {
  constructor(
    @inject('datasources.feature') dataSource: FeatureDataSource,
  ) {
    super(AuthData, dataSource);
  }
}
