"use server";

import { getDb } from "@/db";
import { bookLoans, books } from "@/db/schema";
import { newId } from "@/lib/id";
import { requirePortal } from "@/lib/require-portal";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type LibraryActionState = { error?: string; success?: boolean };

export async function loanBook(
  _prevState: LibraryActionState,
  formData: FormData
): Promise<LibraryActionState> {
  await requirePortal("library");

  const bookId = formData.get("bookId") as string;
  const studentId = formData.get("studentId") as string;
  const dueAt = formData.get("dueAt") as string;

  if (!bookId || !studentId || !dueAt) {
    return { error: "Please select a book, borrower, and due date." };
  }

  const db = getDb();
  const [book] = await db.select().from(books).where(eq(books.id, bookId)).limit(1);
  if (!book) return { error: "Book not found." };
  if (book.availableCopies < 1) return { error: "No copies available for this title." };

  await db.insert(bookLoans).values({
    id: newId("loan"),
    studentId,
    bookId,
    dueAt: new Date(dueAt),
  });

  await db
    .update(books)
    .set({ availableCopies: sql`${books.availableCopies} - 1` })
    .where(eq(books.id, bookId));

  revalidatePath("/portal/library");
  return { success: true };
}

export async function returnBook(formData: FormData) {
  await requirePortal("library");

  const loanId = formData.get("loanId") as string;
  const db = getDb();

  const [loan] = await db.select().from(bookLoans).where(eq(bookLoans.id, loanId)).limit(1);
  if (!loan || loan.returnedAt) return;

  await db.update(bookLoans).set({ returnedAt: new Date() }).where(eq(bookLoans.id, loanId));

  await db
    .update(books)
    .set({ availableCopies: sql`${books.availableCopies} + 1` })
    .where(eq(books.id, loan.bookId));

  revalidatePath("/portal/library");
}
