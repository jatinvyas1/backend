import {Entity, model, property} from '@loopback/repository';

@model()
export class eventObj extends Entity {
  @property()
  groupName?: String;
  @property()
  name?: String;
}


@model({settings: {strict: false}})
export class OutputData extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    required: true,
  })
  id: number;

  @property()
  button1Event?: eventObj;

  @property()
  button2Event?: eventObj;

  @property({
    type: 'string',
  })
  button1Text?: string;

  @property({
    type: 'string',
  })
  button2Text?: string;

  @property({
    type: 'string',
    required: true,
  })
  modality: string;

  @property({
    type: 'string',
  })
  message?: string;

  @property({
    type: 'string',
  })
  template?: string;

  @property({
    type: 'string',
  })
  templateID?: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  target?: string[];

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // [prop: string]: any;

  constructor(data?: Partial<OutputData>) {
    super(data);
  }
}

export interface OutputDataRelations {
  // describe navigational properties here
}

export type OutputDataWithRelations = OutputData & OutputDataRelations;
