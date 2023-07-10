import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FeatureDataSource} from '../datasources';
import {OutputBlockData, OutputBlockDataRelations} from '../models';

export class OutputBlockDataRepository extends DefaultCrudRepository<
  OutputBlockData,
  typeof OutputBlockData.prototype.block_id,
  OutputBlockDataRelations
> {
  constructor(
    @inject('datasources.FeatureDataSource') dataSource: FeatureDataSource,
  ) {
    super(OutputBlockData, dataSource);
  }
}
