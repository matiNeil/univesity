import { getDb } from "@/db";
import { bookLoans, books, students, users } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoanForm } from "./loan-form";
import { returnBook } from "./actions";

export default async function LibraryPage() {
  const db = getDb();
  const [allBooks, activeLoans, allStudents] = await Promise.all([
    db.select().from(books),
    db
      .select({
        id: bookLoans.id,
        dueAt: bookLoans.dueAt,
        title: books.title,
        firstName: users.firstName,
        lastName: users.lastName,
        studentNumber: students.studentNumber,
      })
      .from(bookLoans)
      .leftJoin(books, eq(bookLoans.bookId, books.id))
      .leftJoin(students, eq(bookLoans.studentId, students.userId))
      .leftJoin(users, eq(students.userId, users.id))
      .where(isNull(bookLoans.returnedAt)),
    db
      .select({ userId: students.userId, studentNumber: students.studentNumber, firstName: users.firstName, lastName: users.lastName })
      .from(students)
      .leftJoin(users, eq(students.userId, users.id)),
  ]);

  const totalCopies = allBooks.reduce((s, b) => s + b.totalCopies, 0);
  const availableCopies = allBooks.reduce((s, b) => s + b.availableCopies, 0);

  const bookOptions = allBooks
    .filter((b) => b.availableCopies > 0)
    .map((b) => ({ id: b.id, label: `${b.title} (${b.availableCopies} left)` }));
  const studentOptions = allStudents.map((s) => ({
    userId: s.userId,
    label: `${s.firstName ?? ""} ${s.lastName ?? ""} (${s.studentNumber})`.trim(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Titles</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{allBooks.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Copies Available</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{availableCopies} / {totalCopies}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Active Loans</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{activeLoans.length}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Issue a loan</CardTitle></CardHeader>
        <CardContent>
          <LoanForm books={bookOptions} students={studentOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Catalogue</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allBooks.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.title}</TableCell>
                  <TableCell>{b.author}</TableCell>
                  <TableCell>{b.availableCopies} / {b.totalCopies}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Active Loans</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeLoans.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.title}</TableCell>
                  <TableCell>{l.firstName} {l.lastName} ({l.studentNumber})</TableCell>
                  <TableCell><Badge variant="secondary">{new Date(l.dueAt).toLocaleDateString()}</Badge></TableCell>
                  <TableCell>
                    <form action={returnBook}>
                      <input type="hidden" name="loanId" value={l.id} />
                      <Button type="submit" size="sm" variant="secondary">Mark returned</Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {activeLoans.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No active loans</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
