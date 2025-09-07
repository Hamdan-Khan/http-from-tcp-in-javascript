import { ASCII_RANGE, CRLF } from "../constants.js";

export class Headers {
  public headers: undefined | Record<string, string>;

  /**
   * For adding key value pair / or just value to an existing key-value pair in headers map
   */
  private setHeadersKeyValue(key: string, value: string) {
    // it is possible to have multiple values for the same key e.g.
    // content-type: text/html
    // content-type: application/json
    // this should be parsed as:
    // content-type: text/html, application/json
    if (this.headers) {
      const existingValue = this.headers[key];
      if (!existingValue) {
        this.headers[key] = value;
      } else {
        this.headers[key] = existingValue + ", " + value;
      }
    }
  }

  /**
   * parses field-line / header data from the given string, one header at a time
   *
   * @param data string to derive the headers from
   */
  public parseHeaders(
    data: string,
  ): { bytesParsed: number; done: boolean } | null {
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
      // if the headers are empty after trimming white-spaces, it means there are no headers
      // and we've reached the end of field-line. Hence done = true
      if (headerCandidate.trim() === "") {
        return { done: true, bytesParsed: 0 };
      }
      return { done: false, bytesParsed: 0 };
    }

    let keyCandidate = headerCandidate.slice(0, colonIndex);
    let valueCandidate = headerCandidate.slice(colonIndex + 1);

    const isKeyValid = this.validateFieldLineKey(keyCandidate);
    if (!isKeyValid.result) {
      console.error(
        `ValidatedFieldLine: Invalid character encountered: "${isKeyValid.invalidChar}" in field-line: "${keyCandidate}"`,
      );
      return null;
    }

    // field-line (key) is case insensitive (e.g. Content-length = content-length)
    keyCandidate = keyCandidate.toLowerCase();

    // field-name should not end with a white-space
    if (keyCandidate.endsWith(" ")) {
      return { done: false, bytesParsed: 0 };
    }

    keyCandidate = keyCandidate.trim();
    valueCandidate = valueCandidate.trim();

    // fails condition # 3
    if (keyCandidate === "" || valueCandidate === "") {
      return { done: false, bytesParsed: 0 };
    }

    if (!this.headers) {
      this.headers = {};
    }

    this.setHeadersKeyValue(keyCandidate, valueCandidate);

    // bytesParsed should also include the CRLF in its count.
    // endIndex is location of the first byte of CRLF "\r",
    // the other bytes i.e. "\n" should be added separately
    // notice, we add 2 to endIndex instead of 1 here. The extra 1 is for
    // converting index-system (which starts from 0) to length-system (idk if that makes sense).
    return { done: false, bytesParsed: endIndex + 2 };
  }

  private validSpecialChars = new Set([
    "!",
    "#",
    "$",
    "%",
    "&",
    "'",
    "*",
    "+",
    "-",
    ".",
    "^",
    "_",
    "`",
    "|",
    "~",
  ]);

  /**
   * validates given field-line based on the conditions mentioned in RFC 5.6.2:
   *
   * - upper-case letters (A-Z)
   * - lower-case letters (a-z)
   * - digits (0-9)
   * - special characters (mentioned in `validSpecialChars`)
   * @param key to be validated
   */
  private validateFieldLineKey(key: string): {
    result: boolean;
    invalidChar?: string;
  } {
    for (let i = 0; i < key.length; i++) {
      const curr = key[i]!;
      const code = curr.charCodeAt(0); // ascii code

      const isLowerCaseAlphabet =
        code >= ASCII_RANGE.lowerStart && code <= ASCII_RANGE.lowerEnd;
      const isUpperCaseAlphabet =
        code >= ASCII_RANGE.capitalStart && code <= ASCII_RANGE.capitalEnd;
      const isDigit =
        code >= ASCII_RANGE.digitStart && code <= ASCII_RANGE.digitEnd;
      const isValidSpecialCharacter = this.validSpecialChars.has(curr);

      if (
        !(
          isLowerCaseAlphabet ||
          isUpperCaseAlphabet ||
          isDigit ||
          isValidSpecialCharacter
        )
      ) {
        return { result: false, invalidChar: curr };
      }
    }
    return { result: true };
  }
}
