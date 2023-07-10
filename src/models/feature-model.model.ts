import {Entity, model, property} from '@loopback/repository';

@model()
export class FlowIdObj extends Entity {
  @property()
  id: String;
  @property()
  label: String;
}
@model()
export class LocalEventNameObj extends Entity {
  @property()
  groupName: String;
  @property()
  name: String;
  @property()
  mode: String;
}

@model()
export class LocalVariableObj extends Entity {
  @property()
  variableName: String;
  @property()
  propertyName: String;
  @property()
  type: String;
}

@model()
export class LocalEventObj extends Entity {
  @property()
  displayType: String;
  @property()
  eventName: LocalEventNameObj;
  @property()
  mode: String;
}

@model()
export class FeatureModel extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true
  })
  fid: string;

  @property({
    type: 'string',
    required: true,
    index: {
      unique: true
    },
  })
  featureName: string;

  @property({
    type: 'string',
    required: true,
  })
  featureDescription: string;

  @property({
    type: 'array',
    itemType: LocalEventObj,
    default: [],
  })
  localEvents?: LocalEventObj[] | [];

  @property({
    type: 'array',
    itemType: LocalVariableObj,
    default: [],
  })
  localVariables?: LocalVariableObj[] | [];

  @property({
    type: 'date',
    required: true,
  })
  timeStamp: string;

  @property({
    type: 'array',
    itemType: FlowIdObj,
    default: [],
    required: true
  })
  flows: FlowIdObj[] | [];


  constructor(data?: Partial<FeatureModel>) {
    super(data);
  }
}

export interface FeatureDataRelations {
  // describe navigational properties here
}

export type FeatureDataWithRelations = FeatureModel & FeatureDataRelations;
