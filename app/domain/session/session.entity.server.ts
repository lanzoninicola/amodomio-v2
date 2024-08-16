import { Prisma } from "@prisma/client";
import prismaClient from "~/lib/prisma/client.server";
import { PrismaEntityProps } from "~/lib/prisma/types.server";

class SessionEntity {
  client;
  constructor({ client }: PrismaEntityProps) {
    this.client = client;
  }

  async create(data: Prisma.SessionCreateInput) {
    return await this.client.session.create({ data });
  }

  async findById(sessionId: string) {
    return await this.client.session.findFirst({ where: { id: sessionId } });
  }
}

const sessionEntity = new SessionEntity({
  client: prismaClient,
});
