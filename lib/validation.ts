import { Types } from "mongoose";

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

/**
 * Validates date range for activities
 */
export function validateDateRange(
  openFrom: Date,
  openTo: Date,
): { valid: boolean; error?: string } {
  if (isNaN(openFrom.getTime())) {
    return { valid: false, error: "Invalid open_from date format" };
  }

  if (isNaN(openTo.getTime())) {
    return { valid: false, error: "Invalid open_to date format" };
  }

  if (openFrom >= openTo) {
    return { valid: false, error: "open_from must be before open_to" };
  }

  return { valid: true };
}

/**
 * Validates and parses pagination parameters
 */
export function validatePagination(params: {
  limit?: string | null;
  skip?: string | null;
}): { limit: number; skip: number } {
  const limit = Math.min(Math.max(parseInt(params.limit || "100"), 1), 100);
  const skip = Math.max(parseInt(params.skip || "0"), 0);

  return { limit, skip };
}

/**
 * Validates voting rule type
 */
export function isValidRule(rule: string): rule is "choose_all" | "choose_one" {
  return rule === "choose_all" || rule === "choose_one";
}

/**
 * Validates vote remark for choose_all
 */
export function isValidRemark(remark: string): boolean {
  const validRemarks = ["我要投給他", "我不投給他", "我沒有意見"];
  return validRemarks.includes(remark);
}
