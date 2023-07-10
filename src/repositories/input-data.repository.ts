import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FeatureDataSource} from '../datasources';
import {InputData, InputDataRelations} from '../models';

export class InputDataRepository extends DefaultCrudRepository<
  InputData,
  typeof InputData.prototype.id,
  InputDataRelations
> {
  constructor(
    @inject('datasources.feature') dataSource: FeatureDataSource,
  ) {
    super(InputData, dataSource);
  }
}
