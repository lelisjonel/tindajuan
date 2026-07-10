import { getBusinessDate, nowIso } from "@/lib/dates";
import { baseRecord, type TindaJuanDb } from "../dexie";
import type { CashDay, CashMovement } from "@/types/db";

export type SetStartingCashInput = {
  store_id: string;
  business_date?: string;
  starting_cash: number;
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
};
