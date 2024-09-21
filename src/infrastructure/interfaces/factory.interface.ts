export interface IFactory<D, E> {
  toDomain(entity: E): D;
  toEntity(domain: D): E;
}
