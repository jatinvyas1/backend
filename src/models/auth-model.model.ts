import {Entity, model, property} from '@loopback/repository';

@model()
export class AuthData extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true
  })
  userID: string
  @property({
    type: 'string',
    required: true,
    validators: {
      email: true
    }
  })
  email: string
  @property({
    type: 'string',
    required: true
  })
  password: string

  constructor(data?: Partial<AuthData>) {
    super(data);
  }
}

export interface AuthDataRelations {
  // describe navigational properties here
}

export type AuthDataWithRelations = AuthData & AuthDataRelations;
