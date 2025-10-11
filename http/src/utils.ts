/**
 * Reads data in chunks to simulate data arriving as part of a stream
 */
export class ChunkReader {
  data: string;
  numBytesPerRead: number;
  pos: number = 0;
  constructor(data: string, numOfBytes: number) {
    this.data = data;
    this.numBytesPerRead = numOfBytes;
  }

  /**
   * Returns a chunk of string based on the `numBytesPerRead` provided.
   * Returns `0` if the whole string is read
   * @returns chunk
   */
  public read(): string | 0 {
    if (this.pos >= this.data.length) {
      return 0;
    }
    const endIndex = Math.min(
      this.pos + this.numBytesPerRead,
      this.data.length,
    );
    const chunk = this.data.slice(this.pos, endIndex);
    this.pos = endIndex;

    return chunk;
  }
}
