import { RequestStatus } from '../../../database/models/request';

export class CreateBulkRequestBody {
  quantity: number;
  inventory_id: number;
  item_id: number;
  requested_by: number;
}

export class UpdateRequestStatus {
  status: RequestStatus;
  id: number;
}
