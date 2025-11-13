export default {
  inventory: null,
  inventories: [],

  items: [],
  item: null,
  total: 0,
  pages: 0,

  itemHistories: [],
  totalItemHistory: 0,
  itemHistoryPages: 0,

  selectedItems: [],

  returnRequests: [],
  totalReturnRequests: 0,
  returnRequestsPages: 0,

  summary: null,
  loadingSummary: false,

  pendingPrescriptions: {
    prescribedDrugs: [],
    prescribedAdditionalItems: [],
    totalDrugs: 0,
    totalAdditionalItems: 0,
    drugsPages: 0,
    additionalItemsPages: 0,
  },
  loadingPendingPrescriptions: false,

  transferLoading: false,
};
