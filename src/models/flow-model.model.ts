import {Entity, model, property} from '@loopback/repository';

@model()
export class BlockObj extends Entity {
  @property()
  id: String;
  @property()
  title: String;
}
@model({settings: {strict: false}})
export class FlowModel extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  label: string;

  @property({
    type: 'array',
    itemType: BlockObj,
  })
  logicBlocks?: BlockObj[] | [];

  @property({
    type: "array",
    itemType: BlockObj,
  })
  inputBlocks?: BlockObj[] | [];

  @property({
    type: 'array',
    itemType: BlockObj,
  })
  outputBlocks?: BlockObj[] | [];

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // [prop: string]: any;

  constructor(data?: Partial<FlowModel>) {
    super(data);
  }
}

export interface FlowModelRelations {
  // describe navigational properties here
}

export type FlowModelWithRelations = FlowModel & FlowModelRelations;
