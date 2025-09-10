import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Staff } from '../staff';
import { GeneralStoreRequestItem } from './generalStoreRequestItem';
import { RequestStatus, Priority } from './types';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../../core/helpers/helper';

@Table({
  timestamps: true,
  tableName: 'General_Store_Requests',
  indexes: [
    {
      name: 'idx_general_store_request_number',
      fields: ['request_number'],
      unique: true,
    },
    {
      name: 'idx_general_store_request_department',
      fields: ['requesting_department'],
    },
    {
      name: 'idx_general_store_request_status',
      fields: ['status'],
    },
    {
      name: 'idx_general_store_request_priority',
      fields: ['priority'],
    },
    {
      name: 'idx_general_store_request_date',
      fields: ['request_date'],
    },
    {
      name: 'idx_general_store_request_required_date',
      fields: ['required_date'],
    },
    {
      name: 'idx_general_store_request_requester',
      fields: ['requested_by'],
    },
    {
      name: 'idx_general_store_request_approver',
      fields: ['approved_by'],
    },
    {
      name: 'idx_general_store_request_composite_status_priority',
      fields: ['status', 'priority'],
    },
  ],
})
export class GeneralStoreRequest extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Request number is required',
      },
    },
  })
  request_number: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Requesting department is required',
      },
    },
  })
  requesting_department: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'staffs', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  requested_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    references: { model: 'staffs', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  approved_by: number;

  @Column({
    type: DataType.ENUM(...Object.values(RequestStatus)),
    allowNull: false,
    defaultValue: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({
    type: DataType.ENUM(...Object.values(Priority)),
    allowNull: false,
    defaultValue: Priority.MEDIUM,
  })
  priority: Priority;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  request_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      isFutureDate(value: Date) {
        if (value <= new Date()) {
          throw new Error('Required date must be in the future');
        }
      },
    },
  })
  required_date: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Total cost cannot be negative',
      },
    },
  })
  total_cost: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  rejection_reason: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updatedAt: Date;

  // Relationships
  @BelongsTo(() => Staff, { as: 'requester', foreignKey: 'requested_by' })
  requester: Staff;

  @BelongsTo(() => Staff, { as: 'approver', foreignKey: 'approved_by' })
  approver: Staff;

  @HasMany(() => GeneralStoreRequestItem, { foreignKey: 'request_id' })
  requestItems: GeneralStoreRequestItem[];

  // Helper methods
  isPending(): boolean {
    return this.status === RequestStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === RequestStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === RequestStatus.REJECTED;
  }

  isFulfilled(): boolean {
    return this.status === RequestStatus.FULFILLED;
  }

  isPartiallyFulfilled(): boolean {
    return this.status === RequestStatus.PARTIALLY_FULFILLED;
  }

  isUrgent(): boolean {
    return this.priority === Priority.URGENT;
  }

  isHighPriority(): boolean {
    return this.priority === Priority.HIGH || this.priority === Priority.URGENT;
  }

  canBeApproved(): boolean {
    return this.status === RequestStatus.PENDING;
  }

  canBeRejected(): boolean {
    return this.status === RequestStatus.PENDING;
  }

  canBeFulfilled(): boolean {
    return this.status === RequestStatus.APPROVED;
  }

  isOverdue(): boolean {
    return new Date() > this.required_date && !this.isFulfilled();
  }

  getDaysUntilRequired(): number {
    const today = new Date();
    const required = new Date(this.required_date);
    const diffTime = required.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusColor(): string {
    switch (this.status) {
      case RequestStatus.PENDING:
        return 'warning';
      case RequestStatus.APPROVED:
        return 'info';
      case RequestStatus.REJECTED:
        return 'danger';
      case RequestStatus.FULFILLED:
        return 'success';
      case RequestStatus.PARTIALLY_FULFILLED:
        return 'primary';
      default:
        return 'secondary';
    }
  }

  getPriorityColor(): string {
    switch (this.priority) {
      case Priority.LOW:
        return 'success';
      case Priority.MEDIUM:
        return 'info';
      case Priority.HIGH:
        return 'warning';
      case Priority.URGENT:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getFormattedRequestDate(): string {
    return this.request_date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getFormattedRequiredDate(): string {
    return this.required_date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Static methods for pagination
  static async paginate(param: {
    paginate: number;
    attributes?: FindAttributeOptions;
    where?: WhereOptions<any>;
    page?: number;
    order?: Order;
    group?: GroupOption;
    include?: Includeable | Includeable[];
  }) {
    const { limit, offset } = calcLimitAndOffset(param.page, param.paginate);
    const options = Object.assign({ limit, offset }, param);
    const data = await this.findAndCountAll(options);
    return paginate(data, param.page, limit);
  }
}
