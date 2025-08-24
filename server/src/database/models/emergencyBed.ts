import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Index,
} from 'sequelize-typescript';
import { Ward } from './ward';
import { Staff } from './staff';
import { EmergencyVisit } from './emergencyVisit';

export enum EmergencyBedStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export enum EmergencyBedType {
  RESUSCITATION = 'RESUSCITATION',     // For critical patients
  MONITORING = 'MONITORING',           // For patients needing monitoring
  OBSERVATION = 'OBSERVATION',         // For short-term observation
  ISOLATION = 'ISOLATION',             // For infectious patients
  PEDIATRIC = 'PEDIATRIC',             // For pediatric patients
  OBSTETRIC = 'OBSTETRIC',             // For obstetric emergencies
  PSYCHIATRIC = 'PSYCHIATRIC',         // For psychiatric emergencies
  TRAUMA = 'TRAUMA',                   // For trauma patients
}

@Table({ 
  timestamps: true, 
  tableName: 'Emergency_Beds',
  indexes: [
    {
      name: 'idx_emergency_bed_number',
      fields: ['bed_number']
    },
    {
      name: 'idx_emergency_bed_type',
      fields: ['bed_type']
    },
    {
      name: 'idx_emergency_bed_status',
      fields: ['status']
    },
    {
      name: 'idx_emergency_bed_ward',
      fields: ['ward_id']
    },
    {
      name: 'idx_emergency_bed_zone',
      fields: ['zone']
    },
    {
      name: 'idx_emergency_bed_composite',
      fields: ['status', 'bed_type', 'zone']
    }
  ]
})
export class EmergencyBed extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'bed number is required',
      },
    },
  })
  bed_number: string;

  @Column({
    type: DataType.ENUM(...Object.values(EmergencyBedType)),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'bed type is required',
      },
    },
  })
  bed_type: EmergencyBedType;

  @Column({
    type: DataType.ENUM(...Object.values(EmergencyBedStatus)),
    defaultValue: EmergencyBedStatus.AVAILABLE,
  })
  status: EmergencyBedStatus;

  @ForeignKey(() => Ward)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'ward is required',
      },
    },
  })
  ward_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'zone is required',
      },
    },
  })
  zone: string; // A, B, C, D zones for organization

  @Column({
    type: DataType.STRING,
  })
  room_number: string;

  @Column({
    type: DataType.STRING,
  })
  description: string;

  // Emergency equipment
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  has_monitoring: boolean; // ECG, BP, Pulse oximeter

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  has_ventilator: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  has_defibrillator: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  has_suction: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  has_oxygen: boolean;

  @Column({
    type: DataType.TEXT,
  })
  equipment_notes: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
  })
  hourly_rate: number;

  @Column({
    type: DataType.TEXT,
  })
  notes: string;

  // Current assignment (if occupied)
  @ForeignKey(() => EmergencyVisit)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  current_emergency_visit_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  assigned_nurse_id: number;

  @Column({
    type: DataType.DATE,
  })
  assigned_time: Date;

  @Column({
    type: DataType.DATE,
  })
  expected_discharge_time: Date;

  // Relationships
  @BelongsTo(() => Ward)
  ward: Ward;

  @BelongsTo(() => EmergencyVisit)
  current_emergency_visit: EmergencyVisit;

  @BelongsTo(() => Staff)
  assigned_nurse: Staff;

  // Helper method to check if bed is available
  isAvailable(): boolean {
    return this.status === EmergencyBedStatus.AVAILABLE;
  }

  // Helper method to check if bed has required equipment
  hasRequiredEquipment(requiredEquipment: string[]): boolean {
    const availableEquipment = [];
    
    if (this.has_monitoring) availableEquipment.push('monitoring');
    if (this.has_ventilator) availableEquipment.push('ventilator');
    if (this.has_defibrillator) availableEquipment.push('defibrillator');
    if (this.has_suction) availableEquipment.push('suction');
    if (this.has_oxygen) availableEquipment.push('oxygen');

    return requiredEquipment.every(equipment => 
      availableEquipment.includes(equipment)
    );
  }

  // Helper method to get bed location string
  getLocationString(): string {
    return `${this.zone}${this.room_number ? ` - Room ${this.room_number}` : ''} - Bed ${this.bed_number}`;
  }
}
