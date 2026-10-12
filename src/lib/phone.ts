/** Check a phone's format without assuming the student's country. */
export function isValidPhone(phone: string): boolean {
  const value = phone.trim();
  if (!/^\+?[0-9() -]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}
