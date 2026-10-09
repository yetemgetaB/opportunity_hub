/**
 * Sanitizes an assessment question for student-facing endpoints by stripping
 * grading-only data (referenceAnswer, evaluationGuidance).
 */
export function sanitizeQuestionForStudent<
  T extends { referenceAnswer?: any; evaluationGuidance?: any },
>(question: T): Omit<T, 'referenceAnswer' | 'evaluationGuidance'> {
  if (!question) {
    return question;
  }
  const { referenceAnswer, evaluationGuidance, ...sanitized } = question;
  return sanitized as Omit<T, 'referenceAnswer' | 'evaluationGuidance'>;
}

/**
 * Sanitizes an assessment attempt with answers for student-facing endpoints
 * by ensuring questions within answers do not leak referenceAnswer or evaluationGuidance.
 */
export function sanitizeAttemptForStudent<T>(attempt: T): T {
  if (!attempt || typeof attempt !== 'object') {
    return attempt;
  }
  const copy: any = { ...attempt };

  if (Array.isArray(copy.answers)) {
    copy.answers = copy.answers.map((ans: any) => {
      if (ans && ans.question) {
        return {
          ...ans,
          question: sanitizeQuestionForStudent(ans.question),
        };
      }
      return ans;
    });
  }

  if (copy.assessment && Array.isArray(copy.assessment.questions)) {
    copy.assessment = {
      ...copy.assessment,
      questions: copy.assessment.questions.map((q: any) =>
        sanitizeQuestionForStudent(q),
      ),
    };
  }

  return copy as T;
}
