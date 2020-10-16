export interface Dictionary<T> {
  [key: string]: T;
}

export enum Status {
  PENDING='PENDING',
  COMPLETED='COMPLETED',
  FAILED='FAILED'
}
