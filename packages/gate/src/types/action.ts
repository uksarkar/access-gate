export type PolicyActionMapTuple<
  R = unknown,
  E = unknown,
  Arg = unknown,
  D = unknown
> = [R, E, Arg, D];

export interface PolicyActionMap<R, E, Arg, D> {
  [key: string]: PolicyActionMapTuple<R, E, Arg, D>;
}

export type PolicyAction<Tuple extends PolicyActionMapTuple> = (
  this: { inject: (name: string) => Tuple[3] },
  representative: Tuple[0],
  entity: Tuple[1],
  ...args: Tuple[2][]
) => boolean;

export type DefinePolicyActions<
  K extends string[],
  T extends PolicyActionMapTuple
> = {
  [KE in K[number]]: T;
};

export type DefineCRUDPolicy<T extends PolicyActionMapTuple> = {
  create: T;
  view: T;
  update: T;
  delete: T;
};
