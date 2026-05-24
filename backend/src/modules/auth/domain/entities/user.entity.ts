import { BaseEntity } from '../../../../shared/domain/entity.base';

interface UserProps {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity extends BaseEntity {
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string | null;
  readonly googleId: string | null;

  constructor(props: UserProps) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.email = props.email;
    this.name = props.name;
    this.passwordHash = props.passwordHash;
    this.googleId = props.googleId;
  }

  hasPassword(): boolean {
    return this.passwordHash !== null;
  }

  hasGoogleAuth(): boolean {
    return this.googleId !== null;
  }
}
