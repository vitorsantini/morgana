import { BaseEntity } from '../../../../shared/domain/entity.base';

interface ProjectProps {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  icon: string | null;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectEntity extends BaseEntity {
  readonly userId: string;
  readonly name: string;
  readonly color: string | null;
  readonly icon: string | null;
  readonly archived: boolean;

  constructor(props: ProjectProps) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.userId = props.userId;
    this.name = props.name;
    this.color = props.color;
    this.icon = props.icon;
    this.archived = props.archived;
  }
}
