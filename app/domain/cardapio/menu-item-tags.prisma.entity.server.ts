import { Prisma } from "@prisma/client";
import prismaClient from "~/lib/prisma/client.server";
import { PrismaEntityProps } from "~/lib/prisma/types.server";

interface MenuItemTagEntityFindAllProps {
  where?: Prisma.MenuItemTagWhereInput;
}

export class MenuItemTagPrismaEntity {
  client;
  constructor({ client }: PrismaEntityProps) {
    this.client = client;
  }

  async findAll(params: MenuItemTagEntityFindAllProps = {}) {
    return await this.client.menuItemTag.findMany(params);
  }

  async findById(id: string) {
    return await this.client.menuItemTag.findUnique({ where: { id } });
  }

  async findByItemId(itemId: string) {
    return await this.client.menuItemTag.findMany({
      where: { menuItemId: itemId },
    });
  }

  async create(data: Prisma.MenuItemTagCreateInput) {
    return await this.client.menuItemTag.create({ data });
  }

  async update(id: string, data: Prisma.MenuItemTagUpdateInput) {
    if (!data.updatedAt) {
      data.updatedAt = new Date().toISOString();
    }

    return await this.client.menuItemTag.update({ where: { id }, data });
  }

  async delete(id: string) {
    return await this.client.menuItemTag.delete({ where: { id } });
  }
}

const menuItemTagPrismaEntity = new MenuItemTagPrismaEntity({
  client: prismaClient,
});

export { menuItemTagPrismaEntity };
