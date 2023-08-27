export class ClientKafkaMock {
  private readonly jestMock = jest.fn((topic: string, data: string) => {
    return { topic, data };
  });

  public connect() {} // other providers call connect

  public emit(topic: string, data: string): void {
    this.jestMock(topic, data);
  }

  public getJestMock() {
    return this.jestMock.mock;
  }
}
