import randomReactKey from "~/utils/random-react-key";
import { BaseEntity } from "../base.entity";
import {
  DOTPizzaSize,
  DailyOrder,
  DailyOrderModel,
  DailyOrderTransaction,
} from "./daily-order.model.server";
import { nowWithTime } from "~/lib/dayjs";
import { serverError } from "~/utils/http-response.server";
import tryit from "~/utils/try-it";

class DailyOrderEntity extends BaseEntity<DailyOrder> {
  async delete(id: DailyOrder["id"]) {
    if (!id) {
      throw new Error("Id não informado, nào è possivel eliminar o registro");
    }

    return await this._delete(id);
  }

  async createDailyOrder(dailyOrder: DailyOrder) {
    const dateToAdd = dailyOrder.date;

    const record = await this.findDailyOrderByDate(dateToAdd);

    if (record) {
      throw new Error(
        `Não pode abrir o dia para a data ${dateToAdd}, os pedidos já existem. Selecíona o dia na barra a esquerda.`
      );
    }

    return await this.create(dailyOrder);
  }

  async findAllOrders(options?: { order?: "asc" | "desc"; orderBy?: "date" }) {
    const dailyOrders = await DailyOrderModel.findAll();
    const order = options?.order || "asc";
    const orderBy = options?.orderBy || "date";

    dailyOrders.sort((a, b) => {
      const valueA = a[orderBy];
      const valueB = b[orderBy];

      if (valueA === undefined || valueB === undefined) {
        return 0; // Handle undefined values, placing them at an arbitrary position
      }

      if (order === "asc") {
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      } else {
        if (valueA < valueB) return 1;
        if (valueA > valueB) return -1;
        return 0;
      }
    });

    return dailyOrders;
  }

  async findAllLimit(
    limit: number,
    options?: {
      order?: "asc" | "desc";
      orderBy?: "date";
    }
  ) {
    const dailyOrders = await this.findAllOrders(options);

    return dailyOrders.slice(0, limit);
  }

  async findAllTransactions(id: DailyOrder["id"]) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);

    const records = dailyOrder?.transactions.filter(
      (t) => t.deletedAt === null
    );

    return records || [];
  }

  async createTransaction(
    id: DailyOrder["id"],
    transaction: Omit<DailyOrderTransaction, "createdAt" | "updatedAt">
  ) {
    if (!id) {
      throw new Error("Falha na criação: falta o ID do registro");
    }

    const dailyOrder: DailyOrder | null = await this.findById(id);

    if (!dailyOrder) {
      throw new Error("Falha na criação: registro não encontrado");
    }

    const transactions = dailyOrder?.transactions || [];
    const transactionId = randomReactKey();

    let lastOrderNumber = dailyOrder?.lastOrderNumber || 0;
    let orderNumber = 1;

    if (lastOrderNumber > 0) {
      orderNumber = lastOrderNumber + 1;
    }

    transactions.push({
      ...transaction,
      orderNumber,
      id: transactionId,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    });

    if (transaction.product === "Pizza Familía") {
      dailyOrder.restLargePizzaNumber = dailyOrder.restLargePizzaNumber - 1;

      if (dailyOrder.restLargePizzaNumber < 0) {
        throw new Error(
          "Não há mais pizza Familía disponível. Não é possivel salvar."
        );
      }
    }

    if (transaction.product === "Pizza Média") {
      dailyOrder.restMediumPizzaNumber = dailyOrder.restMediumPizzaNumber - 1;

      if (dailyOrder.restMediumPizzaNumber < 0) {
        throw new Error(
          "Não há mais pizza Média disponível.Não é possivel salvar."
        );
      }
    }

    const [err, itemUpdated] = await tryit(
      this.update(id, {
        lastOrderNumber: orderNumber,
        restLargePizzaNumber: dailyOrder.restLargePizzaNumber,
        restMediumPizzaNumber: dailyOrder.restMediumPizzaNumber,
        totalOrdersNumber: dailyOrder.totalOrdersNumber + 1,
        finance: {
          ...dailyOrder.finance,
          totalOrdersAmount:
            dailyOrder.finance.totalOrdersAmount + transaction.amount,
          totalMotoboyAmount:
            dailyOrder.finance.totalMotoboyAmount + transaction.amountMotoboy,
        },
        transactions,
      })
    );

    if (err) {
      throw new Error(err.message);
    }

    return itemUpdated;
  }

  async updateTransaction(
    id: DailyOrder["id"],
    transactionId: DailyOrderTransaction["id"],
    transaction: Omit<DailyOrderTransaction, "createdAt" | "updatedAt">
  ) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const transactions = dailyOrder?.transactions || [];
    const index = transactions.findIndex((t) => t.id === transactionId);
    if (index === -1) return;
    transactions[index] = {
      ...transaction,
      createdAt: transactions[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    // const record = await this.findTransactionsByOrderNumber(
    //   dailyOrder?.id,
    //   transaction.orderNumber
    // );

    // if (record) {
    //   throw new Error(
    //     `Já existe um pedido com a comanda numero ${
    //       transaction.orderNumber
    //     }. Proximo numero disponivel é ${
    //       (dailyOrder?.lastOrderNumber || 0) + 1
    //     }`
    //   );
    // }

    await this.update(id, {
      lastOrderNumber: transaction.orderNumber,
      transactions,
    });
    return transactions[index];
  }

  async deleteTransaction(
    id: DailyOrder["id"],
    transactionId: DailyOrderTransaction["id"]
  ) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);

    if (!dailyOrder) {
      return;
    }

    const transactions = dailyOrder?.transactions || [];
    const index = transactions.findIndex((t) => t.id === transactionId);
    if (index === -1) return;
    const deletedTransaction = {
      ...transactions[index],
      deletedAt: nowWithTime(),
    };

    transactions[index] = deletedTransaction;

    if (deletedTransaction.product === "Pizza Familía") {
      dailyOrder.restLargePizzaNumber = dailyOrder.restLargePizzaNumber + 1;
    }

    if (deletedTransaction.product === "Pizza Média") {
      dailyOrder.restMediumPizzaNumber = dailyOrder.restMediumPizzaNumber + 1;
    }

    let lastOrderNumber = dailyOrder?.lastOrderNumber || 0;

    const activeTransactions = transactions.filter((t) => t.deletedAt === null);

    const lastActiveTransaction =
      activeTransactions[activeTransactions.length - 1];

    if (lastActiveTransaction) {
      lastOrderNumber = lastActiveTransaction.orderNumber;
    }

    const [err, itemUpdated] = await tryit(
      this.update(id, {
        lastOrderNumber: lastActiveTransaction?.orderNumber || 0,
        restLargePizzaNumber: dailyOrder.restLargePizzaNumber,
        restMediumPizzaNumber: dailyOrder.restMediumPizzaNumber,
        totalOrdersNumber: dailyOrder.totalOrdersNumber - 1,
        finance: {
          ...dailyOrder.finance,
          totalOrdersAmount:
            dailyOrder.finance.totalOrdersAmount - deletedTransaction.amount,
          totalMotoboyAmount:
            dailyOrder.finance.totalMotoboyAmount -
            deletedTransaction.amountMotoboy,
        },
        transactions,
      })
    );

    if (err) {
      throw new Error(err.message);
    }
  }

  async findTransactionsByOrderNumber(id: DailyOrder["id"], number: number) {
    if (!id) return;

    const record = await this.findById(id);

    return record?.transactions.filter(
      (t) => t.deletedAt === null && t.orderNumber === number
    );
  }

  async findLastActiveTransaction(id: DailyOrder["id"]) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const transactions = dailyOrder?.transactions || [];

    const activeTransactions = transactions.filter((t) => t.deletedAt === null);

    console.log("findLastActiveTransaction", { activeTransactions });

    if (activeTransactions.length === 0) {
      return null;
    }

    return activeTransactions[activeTransactions.length - 1];
  }

  async decreaseLargePizzaNumber(id: DailyOrder["id"]) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const restLargePizzaNumber = dailyOrder?.restLargePizzaNumber || 0;

    await this.update(id, { restLargePizzaNumber: restLargePizzaNumber - 1 });
  }

  async increaseLargePizzaNumber(id: DailyOrder["id"]) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const restLargePizzaNumber = dailyOrder?.restLargePizzaNumber || 0;

    await this.update(id, { restLargePizzaNumber: restLargePizzaNumber + 1 });
  }

  async decreaseMediumPizzaNumber(id: DailyOrder["id"]) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const restMediumPizzaNumber = dailyOrder?.restMediumPizzaNumber || 0;

    await this.update(id, { restMediumPizzaNumber: restMediumPizzaNumber - 1 });
  }

  async increaseMediumPizzaNumber(id: DailyOrder["id"]) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const restMediumPizzaNumber = dailyOrder?.restMediumPizzaNumber || 0;

    await this.update(id, { restMediumPizzaNumber: restMediumPizzaNumber + 1 });
  }

  async findDailyOrderByDate(date: DailyOrder["date"]) {
    const dailyOrders = await DailyOrderModel.findWhere("date", "==", date);

    return dailyOrders[0];
  }

  async increaseTotalMotoboyAmount(id: DailyOrder["id"], amount: number) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const totalMotoboyAmount = dailyOrder?.finance.totalMotoboyAmount || 0;

    await this.update(id, { totalMotoboyAmount: totalMotoboyAmount + amount });
  }

  async decreaseTotalMotoboyAmount(id: DailyOrder["id"], amount: number) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const totalMotoboyAmount = dailyOrder?.finance.totalMotoboyAmount || 0;

    await this.update(id, { totalMotoboyAmount: totalMotoboyAmount - amount });
  }

  async increaseTotalOrdersAmount(id: DailyOrder["id"], amount: number) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const totalOrdersAmount = dailyOrder?.finance.totalOrdersAmount || 0;

    await this.update(id, { totalAmount: totalOrdersAmount + amount });
  }

  async decreaseTotalOrdersAmount(id: DailyOrder["id"], amount: number) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const totalOrdersAmount = dailyOrder?.finance.totalOrdersAmount || 0;

    await this.update(id, { totalAmount: totalOrdersAmount - amount });
  }

  async increaseTotalOrdersNumber(id: DailyOrder["id"]) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const totalOrdersNumber = dailyOrder?.totalOrdersNumber || 0;

    await this.update(id, { totalOrdersNumber: totalOrdersNumber + 1 } || 0);
  }

  async decreaseTotalOrdersNumber(id: DailyOrder["id"]) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);
    const totalOrdersNumber = dailyOrder?.totalOrdersNumber || 0;

    await this.update(id, { totalOrdersNumber: totalOrdersNumber - 1 } || 0);
  }

  async updatePizzaSizeRestNumber(
    id: DailyOrder["id"],
    pizzaSize: DOTPizzaSize,
    amount: number
  ) {
    if (!id) return;

    const dailyOrder: DailyOrder | null = await this.findById(id);

    if (!dailyOrder) return;

    if (pizzaSize === "Pizza Familía") {
      await this.update(id, {
        restLargePizzaNumber: amount,
      });
    }

    if (pizzaSize === "Pizza Medía") {
      await this.update(id, {
        restMediumPizzaNumber: amount,
      });
    }

    return dailyOrder;
  }
}

const dailyOrderEntity = new DailyOrderEntity(DailyOrderModel);

export { dailyOrderEntity };
