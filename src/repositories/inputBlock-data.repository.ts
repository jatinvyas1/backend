import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FeatureDataSource} from '../datasources';
import {InputBlockModel, InputBlockModelRelations} from '../models';

export class InputBlockModelRepository extends DefaultCrudRepository<
  InputBlockModel,
  typeof InputBlockModel.prototype.block_id,
  InputBlockModelRelations
> {
  constructor(
    @inject('datasources.feature') dataSource: FeatureDataSource,
  ) {
    super(InputBlockModel, dataSource);
  }
}
