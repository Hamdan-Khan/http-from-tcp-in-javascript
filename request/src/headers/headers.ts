import { CRLF } from "../constants.js";

/**
 * parses field-line / header data from the given string
 *
 * @param data string to derive the headers from
 */
export function parseHeaders(
  data: string,
): { bytesParsed: number; done: boolean } | undefined {
  const endIndex = data.search(CRLF);
  if (endIndex === -1) {
    return { done: false, bytesParsed: 0 };
  }
  const headerCandidate = data.substring(0, endIndex);

  // "  host:  localhost  "
  // ["  host", "  localhost  "]

  // few conditions for validation:
  // 1) if there is only one part after splitting, it means the colon is missing.
  //    after stripping white-spaces, an empty string should be formed which means the headers are empty
  //    i.e. ["    "] -> "" is valid  ,  ["  foo; "] -> "foo;" is invalid
  // 2) first part i.e. `field-name` should not end with a white-space
  // 3) the key value pair should not be empty strings after stripping white-spaces

  const colonIndex = headerCandidate.search(":");
  // colon missing
  if (colonIndex === -1) {
    // for a valid condition, the headers must be empty after trimming white-spaces
    if (headerCandidate.trim() === "") {
      return { done: true, bytesParsed: 0 };
    }
    return { done: false, bytesParsed: 0 };
  }

  let keyCandidate = headerCandidate.slice(0, colonIndex);
  let valueCandidate = headerCandidate.slice(colonIndex + 1);

  // field-name should not end with a white-space
  if (keyCandidate.endsWith(" ")) {
    return { done: false, bytesParsed: 0 };
  }

  keyCandidate = keyCandidate.trim();
  valueCandidate = valueCandidate.trim();

  if (keyCandidate === "" || valueCandidate === "") {
    return { done: false, bytesParsed: 0 };
  }

  return { done: true, bytesParsed: headerCandidate.trim().length };
}
