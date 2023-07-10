import {Entity, model, property} from '@loopback/repository';
import {eventObj} from './output-data.model';

@model({settings: {strict: false}})
export class InputData extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    required: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  modality: string;

  @property({
    type: 'string',
  })
  serviceId?: string;

  @property({
    type: 'string',
  })
  serviceName?: string;

  @property({
    type: 'string',
  })
  source?: string;

  @property()
  event?: eventObj;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // [prop: string]: any;

  constructor(data?: Partial<InputData>) {
    super(data);
  }
}

export interface InputDataRelations {
  // describe navigational properties here
}

export type InputDataWithRelations = InputData & InputDataRelations;
