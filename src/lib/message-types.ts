export type DequeueFn = () => number;
export type QueuedCallback = () => void;
export type DriverRegister = (dequeue: DequeueFn) => QueuedCallback

export type Send = (data: unknown) => void;
export type NodeListener = (e: MessageEvent) => void;
