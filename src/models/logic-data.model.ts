import {Entity, model, property} from '@loopback/repository';

@model()
export class RhsObj extends Entity {
  @property()
  rhsValue?: String;
  @property()
  rhsConstant?: Boolean;
  @property()
  valueId?: String;
}
@model()
export class LhsObj extends Entity {
  @property()
  serviceName?: String;
  @property()
  name?: String;
  @property()
  serviceId?: String;
  @property()
  propertyId?: String;
}

@model({settings: {strict: false}})
export class LogicData extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    required: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  type?: string;

  @property({
    type: 'string',
  })
  op?: string;

  @property()
  lhs: LhsObj;

  @property()
  rhs: RhsObj;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // [prop: string]: any;

  constructor(data?: Partial<LogicData>) {
    super(data);
  }
}

export interface LogicDataRelations {
  // describe navigational properties here
}

export type LogicDataWithRelations = LogicData & LogicDataRelations;
