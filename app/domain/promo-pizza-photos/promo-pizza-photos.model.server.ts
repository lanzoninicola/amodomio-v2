import { createFirestoreModel } from "~/lib/firestore-model/src";

export interface PromoPizzaPhotoPizzaIncluded {
  name: string;
  ingredients: string;
  value: string;
  promoValue: string;
}

export interface PromoPizzaPhotoCustomer {
  bairro: string;
  cep: string;
  endereço: string;
  name: string;
  phoneNumber: string;
}

export interface PromoPizzaPhoto {
  id?: string;
  isSelected: boolean;
  pizza: PromoPizzaPhotoPizzaIncluded;
  promoCode: string;
  selectedBy?: PromoPizzaPhotoCustomer | null;
  public?: boolean;
  checkedTerms?: boolean;
  vegetarian?: boolean;
}

const PromoPizzaPhotoModel =
  createFirestoreModel<PromoPizzaPhoto>("promo-pizza-photos");

export { PromoPizzaPhotoModel };
