export class Price {
  insurance_id: number;
  hmo_id: number;
  price: number;
}
export class TestTariffDto {
  test_id: number;
  prices: Price[];
}
