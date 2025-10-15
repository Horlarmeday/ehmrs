import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { InvestigationResult } from './investigationResult';
import { Staff } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum ImageFileType {
  DICOM = 'DICOM',
  JPEG = 'JPEG',
  PNG = 'PNG',
  GIF = 'GIF',
  TIFF = 'TIFF',
}

@Table({ timestamps: true, tableName: 'Investigation_Result_Images' })
export class InvestigationResultImage extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => InvestigationResult)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'investigation result id is required',
      },
    },
  })
  investigation_result_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'file path is required',
      },
    },
  })
  file_path: string;

  @Column({
    type: DataType.ENUM(
      ImageFileType.DICOM,
      ImageFileType.JPEG,
      ImageFileType.PNG,
      ImageFileType.GIF,
      ImageFileType.TIFF
    ),
    allowNull: false,
    defaultValue: ImageFileType.JPEG,
  })
  file_type: ImageFileType;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'File size in bytes',
  })
  file_size: number;

  @Column({
    type: DataType.TEXT,
    comment: 'DICOM metadata stored as JSON string',
  })
  dicom_metadata: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  upload_date: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'uploaded by staff id is required',
      },
    },
  })
  uploaded_by: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Indicates if this is the primary/featured image for the result',
  })
  is_primary: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: 'Display order for sorting images',
  })
  display_order: number;

  @Column({
    type: DataType.STRING,
    comment: 'Original filename',
  })
  original_filename: string;

  @Column({
    type: DataType.STRING,
    comment: 'Thumbnail path for quick preview',
  })
  thumbnail_path: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Optional description or notes about the image',
  })
  description: string;

  // Relationships
  @BelongsTo(() => InvestigationResult)
  investigationResult: InvestigationResult;

  @BelongsTo(() => Staff)
  uploader: Staff;

  /**
   * Paginate investigation result images
   * @param param Pagination parameters
   */
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

  /**
   * Find all images for a specific investigation result
   * @param resultId Investigation result ID
   * @param options Additional query options
   */
  static async findByResultId(
    resultId: number,
    options?: {
      include?: Includeable | Includeable[];
      order?: Order;
    }
  ) {
    return this.findAll({
      where: { investigation_result_id: resultId },
      order: options?.order || [['display_order', 'ASC'], ['upload_date', 'ASC']],
      include: options?.include,
    });
  }

  /**
   * Get primary image for an investigation result
   * @param resultId Investigation result ID
   */
  static async findPrimaryImage(resultId: number) {
    return this.findOne({
      where: {
        investigation_result_id: resultId,
        is_primary: true,
      },
    });
  }

  /**
   * Set an image as primary and unset others
   * @param imageId Image ID to set as primary
   */
  static async setAsPrimary(imageId: number) {
    const image = await this.findByPk(imageId);
    if (!image) {
      throw new Error('Image not found');
    }

    // Unset all other primary images for this result
    await this.update(
      { is_primary: false },
      { where: { investigation_result_id: image.investigation_result_id } }
    );

    // Set this image as primary
    await image.update({ is_primary: true });

    return image;
  }

  /**
   * Count images for a specific investigation result
   * @param resultId Investigation result ID
   */
  static async countByResultId(resultId: number) {
    return this.count({
      where: { investigation_result_id: resultId },
    });
  }

  /**
   * Get DICOM images only for a result
   * @param resultId Investigation result ID
   */
  static async findDicomImages(resultId: number) {
    return this.findAll({
      where: {
        investigation_result_id: resultId,
        file_type: ImageFileType.DICOM,
      },
      order: [['display_order', 'ASC'], ['upload_date', 'ASC']],
    });
  }
}
