export interface IRepository<D, I> {
  create(domain: D): Promise<I>;
  findAll(
    skip: string,
    take: string,
    fields?: string,
    filters?: string,
  ): Promise<Array<D>>;
  findOne(uid: I, fields?: string): Promise<D>;
  update(uid: I, domain: D): Promise<boolean>;
  remove(uid: I): Promise<boolean>;
}
