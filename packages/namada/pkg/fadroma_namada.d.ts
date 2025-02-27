/* tslint:disable */
/* eslint-disable */
export class Decode {
  private constructor();
  free(): void;
  static u32(source: Uint8Array): bigint;
  static u64(source: Uint8Array): bigint;
  static vec_string(source: Uint8Array): Array<any>;
  static code_hash(source: Uint8Array): string;
  static storage_keys(): object;
  static epoch_duration(source: Uint8Array): object;
  static gas_cost_table(source: Uint8Array): object;
  static tx(source: Uint8Array): object;
  static address(source: Uint8Array): string;
  static addresses(source: Uint8Array): Array<any>;
  static address_to_amount(source: Uint8Array): object;
  static block(block_json: string, _block_results_json?: string | null): object;
  static pos_parameters(source: Uint8Array): object;
  static pos_validator_metadata(source: Uint8Array): object;
  static pos_commission_pair(source: Uint8Array): object;
  static pos_validator_state(source: Uint8Array): any;
  static pos_validator_set(source: Uint8Array): any;
  static pgf_parameters(source: Uint8Array): object;
  static gov_parameters(source: Uint8Array): object;
  static gov_proposal(source: Uint8Array): object;
  static gov_proposal_code_key(id: bigint): string;
  static balance_key(token: string, owner: string): string;
  static gov_votes(source: Uint8Array): Array<any>;
  static gov_result(source: Uint8Array): object;
  static bonds_and_unbonds(source: Uint8Array): object;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_decode_free: (a: number, b: number) => void;
  readonly decode_u32: (a: any) => [number, number, number];
  readonly decode_u64: (a: any) => [number, number, number];
  readonly decode_vec_string: (a: any) => [number, number, number];
  readonly decode_code_hash: (a: any) => [number, number, number];
  readonly decode_storage_keys: () => [number, number, number];
  readonly decode_epoch_duration: (a: any) => [number, number, number];
  readonly decode_gas_cost_table: (a: any) => [number, number, number];
  readonly decode_tx: (a: any) => [number, number, number];
  readonly decode_address: (a: any) => [number, number, number];
  readonly decode_addresses: (a: any) => [number, number, number];
  readonly decode_address_to_amount: (a: any) => [number, number, number];
  readonly decode_block: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly decode_pos_parameters: (a: any) => [number, number, number];
  readonly decode_pos_validator_metadata: (a: any) => [number, number, number];
  readonly decode_pos_commission_pair: (a: any) => [number, number, number];
  readonly decode_pos_validator_state: (a: any) => [number, number, number];
  readonly decode_pos_validator_set: (a: any) => [number, number, number];
  readonly decode_pgf_parameters: (a: any) => [number, number, number];
  readonly decode_gov_parameters: (a: any) => [number, number, number];
  readonly decode_gov_proposal: (a: any) => [number, number, number];
  readonly decode_gov_proposal_code_key: (a: bigint) => [number, number];
  readonly decode_balance_key: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly decode_gov_votes: (a: any) => [number, number, number];
  readonly decode_gov_result: (a: any) => [number, number, number];
  readonly decode_bonds_and_unbonds: (a: any) => [number, number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
