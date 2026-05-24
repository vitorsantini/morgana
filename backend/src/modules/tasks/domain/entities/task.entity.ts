import { Priority } from '@prisma/client';
import { BaseEntity } from '../../../../shared/domain/entity.base';

interface TaskProps {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  priority: Priority;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskEntity extends BaseEntity {
  readonly projectId: string;
  readonly columnId: string;
  readonly title: string;
  readonly priority: Priority;
  readonly order: number;

  constructor(props: TaskProps) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.projectId = props.projectId;
    this.columnId = props.columnId;
    this.title = props.title;
    this.priority = props.priority;
    this.order = props.order;
  }
}
