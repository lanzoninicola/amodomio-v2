import { createFirestoreModel } from "~/lib/firestore-model/src";

export interface DailyOrder {
  id?: string;
  date: string;
  initialLargePizzaNumber: number;
  restLargePizzaNumber: number;
  initialMediumPizzaNumber: number;
  restMediumPizzaNumber: number;
  totalOrdersNumber: number;
  finance: DailyOrderFinance;
  transactions: DailyOrderTransaction[];
  operator: DOTOperator;
  lastOrderNumber: number;
}

export interface DailyOrderFinance {
  cashRegisterAmount: {
    initial: number;
    final: number;
  };
  totalOrdersAmount: number;
  totalMotoboyAmount: number;
  totalDailyAmount: {
    adjusted: number;
    final: number;
    adjustmentReason: string;
  };
}

export interface DailyOrderTransaction {
  id?: string;
  product: DOTProduct;
  amount: number;
  orderNumber: number;
  isMotoRequired: boolean;
  amountMotoboy: number;
  inboundChannel: DOTInboundChannel;
  paymentMethod: DOTPaymentMethod;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  operator: DOTOperator;
}

export type DOTPizzaSize = "Pizza Familía" | "Pizza Medía";

export type DOTProduct =
  | "Pizza Familía"
  | "Pizza Média"
  | "Al Taglio"
  | "Bebida";
export type DOTInboundChannel = "Mogo" | "Aiqfome";
export type DOTPaymentMethod =
  | "Dinheiro"
  | "PIX"
  | "AIQFome"
  | "Cartão Credito"
  | "Cartão Debito";
export type DOTOperator = { id: number; name: string };

const DailyOrderModel = createFirestoreModel<DailyOrder>("daily-order");

export { DailyOrderModel };
