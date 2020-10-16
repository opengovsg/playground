import { Status } from "./common";

export type FibonacciResult =
  { status: Status.PENDING; } |
  { status: Status.FAILED; error: any; } |
  { status: Status.COMPLETED; value: number; };
