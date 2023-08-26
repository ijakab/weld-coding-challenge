export abstract class BaseSerializer<RawType, SerializedType> {
  protected abstract serialize(item: RawType): SerializedType;

  public single(item: RawType): SerializedType {
    return this.serialize(item);
  }

  public list(items: RawType[]): SerializedType[] {
    // we cannot just pass items.map(this.serialize) as it may lead to unexpected errors with changing execution context
    // if class that implements this method uses `this.something()`
    return items.map((item) => {
      return this.serialize(item);
    });
  }
}
