import { BaseEntity } from '../../../../shared/domain/entity.base';

interface ColumnProps {
  id: string;
  title: string;
  order: number;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ColumnEntity extends BaseEntity {
  readonly title: string;
  readonly order: number;
  readonly color: string | null;

  constructor(props: ColumnProps) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.title = props.title;
    this.order = props.order;
    this.color = props.color;
  }
}
