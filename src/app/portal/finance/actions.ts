"use server";

import { getDb } from "@/db";
import { invoices, payments } from "@/db/schema";
import { newId } from "@/lib/id";
import { requirePortal } from "@/lib/require-portal";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type FinanceActionState = { error?: string; success?: boolean };

export async function createInvoice(
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  await requirePortal("finance");

  const studentId = formData.get("studentId") as string;
  const description = (formData.get("description") as string)?.trim();
  const amount = Number(formData.get("amount"));
  const dueDate = formData.get("dueDate") as string;

  if (!studentId || !description || !dueDate || !Number.isFinite(amount) || amount <= 0) {
    return { error: "Please fill in all fields with a valid amount." };
  }

  const db = getDb();
  await db.insert(invoices).values({
    id: newId("inv"),
    studentId,
    description,
    amount: amount.toFixed(2),
    dueDate: new Date(dueDate),
  });

  revalidatePath("/portal/finance");
  return { success: true };
}

export async function recordPayment(
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  await requirePortal("finance");

  const invoiceId = formData.get("invoiceId") as string;
  const amount = Number(formData.get("amount"));
  const method = (formData.get("method") as string)?.trim();

  if (!invoiceId || !method || !Number.isFinite(amount) || amount <= 0) {
    return { error: "Please provide a valid amount and payment method." };
  }

  const db = getDb();
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!invoice) return { error: "Invoice not found." };

  await db.insert(payments).values({
    id: newId("pay"),
    invoiceId,
    amount: amount.toFixed(2),
    method,
  });

  const [{ total }] = await db
    .select({ total: sql<string>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId));

  const paidSoFar = Number(total);
  const status = paidSoFar >= Number(invoice.amount) ? "paid" : paidSoFar > 0 ? "partial" : "unpaid";

  await db.update(invoices).set({ status }).where(eq(invoices.id, invoiceId));

  revalidatePath("/portal/finance");
  return { success: true };
}
