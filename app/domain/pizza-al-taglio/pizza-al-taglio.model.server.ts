import { createFirestoreModel } from "~/lib/firestore-model/src";

export type PizzaSliceCategory = "vegetariana" | "carne" | "margherita";

export interface PizzaSlice {
  id?: string;
  toppings: string;
  category: PizzaSliceCategory;
}

export const PizzaSliceModel = createFirestoreModel<PizzaSlice>("pizza_slices");
