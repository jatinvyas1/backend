import {Entity, model, property} from '@loopback/repository';
import {LogicData} from './logic-data.model';

@model({settings: {strict: false}})
export class LogicBlockModel extends Entity {
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
    itemType: 'string'
  })
  out?: string[];

  @property({
    type: 'array',
    itemType: 'string',
  })
  in?: string[];

  @property({
    type: 'array',
    itemType: LogicData,
    required: true,
  })
  data: object[];

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // [prop: string]: any;

  constructor(data?: Partial<LogicBlockModel>) {
    super(data);
  }
}

export interface LogicBlockModelRelations {
  // describe navigational properties here
}

export type LogicBlockModelWithRelations = LogicBlockModel & LogicBlockModelRelations;
