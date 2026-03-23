export class StorageInterface {
  async uploadBuffer(_buffer, _options = {}) {
    throw new Error('uploadBuffer must be implemented by adapter');
  }
}
