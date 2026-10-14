/**
 * BASE REPOSITORY
 * Menangani operasi CRUD standar yang dipakai semua repository turunan.
 * Seluruh query menggunakan Prisma ORM (parameterized) → aman dari SQL Injection.
 */

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export type PrismaModels = Exclude<
  keyof typeof prisma,
  | "$connect"
  | "$disconnect"
  | "$on"
  | "$transaction"
  | "$use"
  | "$extends"
  | "$executeRaw"
  | "$executeRawUnsafe"
  | "$queryRaw"
  | "$queryRawUnsafe"
>;

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseRepository<TModel extends object, TCreateInput, TUpdateInput> {
  protected abstract modelName: PrismaModels;

  protected get model() {
    return (prisma as any)[this.modelName];
  }

  async findById(id: string, include?: object): Promise<TModel | null> {
    return this.model.findUnique({ where: { id }, include }) as Promise<TModel | null>;
  }

  async findAll(where?: object, include?: object): Promise<TModel[]> {
    return this.model.findMany({ where, include }) as Promise<TModel[]>;
  }

  async findPaginated(
    where?: object,
    options?: PaginationOptions,
    include?: object,
    orderBy?: object
  ): Promise<PaginatedResult<TModel>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      this.model.findMany({ where, include, skip, take: limit, orderBy }),
      this.model.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: TCreateInput): Promise<TModel> {
    return this.model.create({ data }) as Promise<TModel>;
  }

  async update(id: string, data: TUpdateInput): Promise<TModel> {
    return this.model.update({ where: { id }, data }) as Promise<TModel>;
  }

  async softDelete(id: string, deletedBy: string): Promise<TModel> {
    return this.model.update({
      where: { id },
      data: { deleted_at: new Date(), deleted_by: deletedBy },
    }) as Promise<TModel>;
  }

  async hardDelete(id: string): Promise<TModel> {
    return this.model.delete({ where: { id } }) as Promise<TModel>;
  }

  async count(where?: object): Promise<number> {
    return this.model.count({ where });
  }
}
