/**
 * New line
 */
export const CRLF = "\r\n" as const;

/**
 * ASCII code ranges for upper and lower case letters and (0-9) digits
 */
export const ASCII_RANGE = {
  capitalStart: 65,
  capitalEnd: 90,
  lowerStart: 97,
  lowerEnd: 122,
  digitStart: 48,
  digitEnd: 57,
} as const;

/**
 * HTTP version
 */
export const HTTP_VERSION = "1.1" as const;
