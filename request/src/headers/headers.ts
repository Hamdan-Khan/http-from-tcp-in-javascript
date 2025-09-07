import { CRLF } from "../constants.js";

export class Headers {
  public headers: undefined | Record<string, string>;

  /**
   * parses field-line / header data from the given string, one header at a time
   *
   * @param data string to derive the headers from
   */
  public parseHeaders(
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
      // if the headers are empty after trimming white-spaces, it means there are no headers
      // and we've reached the end of field-line. Hence done = true
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

    if (!this.headers) {
      this.headers = {};
    }

    this.headers[keyCandidate] = valueCandidate;

    // bytesParsed should also include the CRLF in its count.
    // endIndex is location of the first byte of CRLF "\r",
    // the other bytes i.e. "\n" should be added separately
    // notice, we add 2 to endIndex instead of 1 here. The extra 1 is for
    // converting index-system (which starts from 0) to length-system (idk if that makes sense).
    return { done: false, bytesParsed: endIndex + 2 };
  }
}
