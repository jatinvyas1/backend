import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FeatureDataSource} from '../datasources';
import {OutputData, OutputDataRelations} from '../models';

export class OutputDataRepository extends DefaultCrudRepository<
  OutputData,
  typeof OutputData.prototype.id,
  OutputDataRelations
> {
  constructor(
    @inject('datasources.FeatureDataSource') dataSource: FeatureDataSource,
  ) {
    super(OutputData, dataSource);
  }
}
