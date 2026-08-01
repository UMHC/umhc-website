const UOM_STUDENT_EMAIL_DOMAIN = 'student.manchester.ac.uk';

const COMMON_DOMAIN_MISTAKES = new Set([
  'manchester.ac.uk',
  'student.amchester.ac.uk',
  'students.manchester.ac.uk',
  'student.manchester.uk',
  'student.manchester.ac.uk.uk',
]);

const normalizeDomain = (domain: string) =>
  domain.trim().toLowerCase().replace(/[^a-z.]/g, '');

const getEditDistance = (source: string, target: string) => {
  const rows = source.length + 1;
  const cols = target.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const substitutionCost = source[row - 1] === target[col - 1] ? 0 : 1;

      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + substitutionCost,
      );
    }
  }

  return matrix[source.length][target.length];
};

export const getSuggestedStudentEmail = (emailAddress: string) => {
  const trimmedEmail = emailAddress.trim().toLowerCase();
  const atIndex = trimmedEmail.lastIndexOf('@');

  if (atIndex <= 0 || atIndex === trimmedEmail.length - 1) {
    return null;
  }

  const localPart = trimmedEmail.slice(0, atIndex);
  const rawDomain = trimmedEmail.slice(atIndex + 1);
  const domain = normalizeDomain(rawDomain);

  if (!localPart || !domain || domain === UOM_STUDENT_EMAIL_DOMAIN) {
    return null;
  }

  const looksLikeManchesterDomain =
    domain.includes('manchester') ||
    domain.includes('student') ||
    getEditDistance(domain, UOM_STUDENT_EMAIL_DOMAIN) <= 5 ||
    getEditDistance(domain, 'manchester.ac.uk') <= 3;

  if (!COMMON_DOMAIN_MISTAKES.has(domain) && !looksLikeManchesterDomain) {
    return null;
  }

  return `${localPart}@${UOM_STUDENT_EMAIL_DOMAIN}`;
};