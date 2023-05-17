export interface Order {
  [propName: string]: number | number[] | string;
  id: number;
  productsIds: string;
  address: string;
  userId: number;
  stage: string;
  deliveryMethod: string;
  paymentMethod: string;
  phoneNumber: string;
}
