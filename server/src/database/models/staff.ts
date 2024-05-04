import {
  Column,
  DataType,
  PrimaryKey,
  Table,
  Model,
  BeforeCreate,
  DefaultScope,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum Status {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}
@DefaultScope(() => ({
  where: {
    status: Status.ACTIVE,
  },
}))
@Table({ timestamps: true })
export class Staff extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'firstname is required',
      },
    },
  })
  firstname: string;

  @Column({
    type: DataType.STRING,
    validate: {
      notEmpty: {
        msg: 'lastname is required',
      },
    },
  })
  lastname!: string;

  @Column({
    type: DataType.STRING,
  })
  middlename!: string;

  @Column(DataType.VIRTUAL)
  get fullname(): unknown {
    return `${this.getDataValue('firstname')} ${this.getDataValue('lastname')}`;
  }

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'email is required',
      },
    },
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'department is required',
      },
    },
  })
  department!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date of birth is required',
      },
    },
  })
  date_of_birth!: Date;

  @Column({
    type: DataType.ENUM(Gender.MALE, Gender.FEMALE, Gender.OTHER),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'gender is required',
      },
    },
  })
  gender!: Gender;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'photo is required',
      },
    },
  })
  photo: string;

  @Column({ type: DataType.ENUM(Status.ACTIVE, Status.INACTIVE), defaultValue: Status.ACTIVE })
  status: Status;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'role is required',
      },
    },
  })
  role: string;

  @Column({
    type: DataType.STRING,
  })
  sub_role!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'phone number is required',
      },
    },
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'username is required',
      },
    },
  })
  username: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'address is required',
      },
    },
  })
  address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'password is required',
      },
    },
  })
  password!: string;

  generateAuthToken() {
    return sign(
      {
        sub: this.id,
        firstname: this.firstname,
        lastname: this.lastname,
        fullname: this.fullname,
        role: this.role,
        sub_role: this.sub_role,
        username: this.username,
        email: this.email,
        photo: this.photo,
        department: this.department,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );
  }

  @BeforeCreate
  static async hashPassword(instance: Staff) {
    // this will be called when an instance is created
    const salt = await bcrypt.genSalt(12);
    instance.password = await bcrypt.hash(instance.password, salt);
  }

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
