import {Entity, model, property} from '@loopback/repository';
import {OutputData} from './output-data.model';

@model({settings: {strict: false}})
export class OutputBlockData extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  block_id: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  out?: string[];

  @property({
    type: 'array',
    itemType: 'string',
  })
  in?: string[];

  @property({
    type: 'array',
    itemType: OutputData,
    required: true,
  })
  data: object[];

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // [prop: string]: any;

  constructor(data?: Partial<OutputBlockData>) {
    super(data);
  }
}

export interface OutputBlockDataRelations {
  // describe navigational properties here
}

export type OutputBlockDataWithRelations = OutputBlockData & OutputBlockDataRelations;
