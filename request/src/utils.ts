export class ChunkReader {
  data: string;
  numBytesPerRead: number;
  pos: number = 0;
  constructor(data: string, numOfBytes: number) {
    this.data = data;
    this.numBytesPerRead = numOfBytes;
  }

  /**
   * returns a chunk of data based on the `numBytesPerRead` provided
   * @returns chunk
   */
  public read() {
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
