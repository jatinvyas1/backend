import {Entity, model, property} from '@loopback/repository';

@model()
export class FeatureIdObj extends Entity {
  @property()
  fid: String
  @property()
  featureName: String
  @property()
  featureDescription: String
}

@model()
export class UserFeatureModel extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    // required: true,
  })
  userID?: string;

  @property({
    type: 'array',
    itemType: FeatureIdObj,
    default: [],
  })
  data?: FeatureIdObj[];

  constructor(data?: Partial<UserFeatureModel>) {
    super(data);
  }
}

export interface UserFeatureRelations {
  // describe navigational properties here
}

export type UserFeatureWithRelations = UserFeatureModel & UserFeatureRelations;
