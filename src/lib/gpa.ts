export const GRADE_POINTS: Record<string, number> = {
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 1.0,
  F: 0.0,
};

export function isGpaEligible(grade: string | null | undefined): grade is keyof typeof GRADE_POINTS {
  return !!grade && grade in GRADE_POINTS;
}

export function isPassingGrade(grade: string | null | undefined): boolean {
  return isGpaEligible(grade) && GRADE_POINTS[grade] > 0;
}

type GradedCourse = { grade: string | null; credits: number };

export function computeGpa(enrollments: GradedCourse[]): number | null {
  const graded = enrollments.filter((e) => isGpaEligible(e.grade));
  const totalCredits = graded.reduce((sum, e) => sum + e.credits, 0);
  if (totalCredits === 0) return null;
  const totalPoints = graded.reduce((sum, e) => sum + GRADE_POINTS[e.grade!] * e.credits, 0);
  return totalPoints / totalCredits;
}

export function computeSemesterGpas<T extends GradedCourse & { semester: string }>(
  enrollments: T[]
): Map<string, number | null> {
  const bySemester = new Map<string, T[]>();
  for (const e of enrollments) {
    const list = bySemester.get(e.semester) ?? [];
    list.push(e);
    bySemester.set(e.semester, list);
  }
  return new Map([...bySemester.entries()].map(([semester, list]) => [semester, computeGpa(list)]));
}

export type RequiredCourseStatus = "completed" | "in_progress" | "missing";

export type DegreeAudit = {
  creditsCompleted: number;
  creditsRequired: number;
  requiredCourses: {
    id: string;
    code: string;
    title: string;
    status: RequiredCourseStatus;
  }[];
};

export function computeDegreeAudit(params: {
  totalCreditsRequired: number;
  requiredCourses: { id: string; code: string; title: string }[];
  enrollments: { courseId: string; grade: string | null; credits: number }[];
}): DegreeAudit {
  const passedCourseIds = new Set(
    params.enrollments.filter((e) => isPassingGrade(e.grade)).map((e) => e.courseId)
  );
  const inProgressCourseIds = new Set(
    params.enrollments.filter((e) => !e.grade).map((e) => e.courseId)
  );

  const creditsCompleted = params.enrollments
    .filter((e) => isPassingGrade(e.grade))
    .reduce((sum, e) => sum + e.credits, 0);

  const requiredCourses = params.requiredCourses.map((c) => ({
    ...c,
    status: passedCourseIds.has(c.id)
      ? ("completed" as const)
      : inProgressCourseIds.has(c.id)
        ? ("in_progress" as const)
        : ("missing" as const),
  }));

  return { creditsCompleted, creditsRequired: params.totalCreditsRequired, requiredCourses };
}
