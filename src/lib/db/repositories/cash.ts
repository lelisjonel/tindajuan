import { getBusinessDate, nowIso } from "@/lib/dates";
import { baseRecord, type TindaJuanDb } from "../dexie";
import type { CashDay, CashMovement } from "@/types/db";

export type SetStartingCashInput = {
  store_id: string;
  business_date?: string;
  starting_cash: number;
};

export type ManualCashMovementInput = {
  store_id: string;
  business_date?: string;
  type: CashMovement["type"];
  category: string;
  amount: number;
  notes?: string;
};

export const cashRepository = {
  async setStartingCash(db: TindaJuanDb, input: SetStartingCashInput): Promise<CashDay> {
    const businessDate = input.business_date ?? getBusinessDate();
    const existing = await db.cash_days
      .where("store_id")
      .equals(input.store_id)
      .filter((day) => day.business_date === businessDate)
      .first();

    if (existing) {
      const updated: CashDay = { ...existing, starting_cash: input.starting_cash, updated_at: nowIso(), sync_status: "pending" };
      await db.cash_days.put(updated);
      return updated;
    }

    const cashDay: CashDay = {
      ...baseRecord(),
      store_id: input.store_id,
      business_date: businessDate,
      starting_cash: input.starting_cash,
    };
    await db.cash_days.add(cashDay);
    return cashDay;
  },

  async createMovement(db: TindaJuanDb, input: Omit<CashMovement, "id" | "created_at" | "updated_at" | "sync_status">): Promise<CashMovement> {
    const movement: CashMovement = { ...baseRecord(), ...input };
    await db.cash_movements.add(movement);
    return movement;
  },

  async recordManualMovement(db: TindaJuanDb, input: ManualCashMovementInput): Promise<CashMovement> {
    if (input.amount <= 0) throw new Error("Cash movement amount must be greater than zero.");
    return this.createMovement(db, {
      store_id: input.store_id,
      business_date: input.business_date ?? getBusinessDate(),
      type: input.type,
      category: input.category,
      amount: input.amount,
      source: "manual",
      notes: input.notes,
    });
  },

  async listMovements(db: TindaJuanDb, storeId: string, businessDate = getBusinessDate()): Promise<CashMovement[]> {
    const movements = await db.cash_movements
      .where("store_id")
      .equals(storeId)
      .filter((movement) => movement.business_date === businessDate)
      .toArray();
    return movements.sort((left, right) => right.created_at.localeCompare(left.created_at));
  },
};
