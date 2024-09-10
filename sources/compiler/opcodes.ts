/* Bytecode instruction opcodes. */

/* Stack Manipulation */

export const PUSH = 0;    // PUSH c
export const PUSH_UNDEFINED = 1;    // PUSH_UNDEFINED
export const PUSH_NULL = 2;    // PUSH_NULL
export const PUSH_FAILED = 3;    // PUSH_FAILED
export const PUSH_EMPTY_ARRAY = 4;    // PUSH_EMPTY_ARRAY
export const PUSH_CURR_POS = 5;    // PUSH_CURR_POS
export const POP = 6;    // POP
export const POP_CURR_POS = 7;    // POP_CURR_POS
export const POP_N = 8;    // POP_N n
export const NIP = 9;    // NIP
export const APPEND = 10;   // APPEND
export const WRAP = 11;   // WRAP n
export const TEXT = 12;   // TEXT

/* Conditions and Loops */

export const IF = 13;   // IF t, f
export const IF_ERROR = 14;   // IF_ERROR t, f
export const IF_NOT_ERROR = 15;   // IF_NOT_ERROR t, f
export const WHILE_NOT_ERROR = 16;   // WHILE_NOT_ERROR b

/* Matching */

export const MATCH_END = 17;   // MATCH_END
export const MATCH_ANY = 18;   // MATCH_ANY a, f, ...
export const MATCH_STRING = 19;   // MATCH_STRING s, a, f, ...
export const MATCH_STRING_IC = 20;   // MATCH_STRING_IC s, a, f, ...
export const MATCH_REGEXP = 21;   // MATCH_REGEXP r, a, f, ...
export const ACCEPT_N = 22;   // ACCEPT_N n
export const ACCEPT_STRING = 23;   // ACCEPT_STRING s
export const FAIL = 24;   // FAIL e

/* Calls */

export const LOAD_SAVED_POS = 25;   // LOAD_SAVED_POS p
export const UPDATE_SAVED_POS = 26;   // UPDATE_SAVED_POS
export const CALL = 27;   // CALL f, n, pc, p1, p2, ..., pN

/* Rules */

export const RULE = 28;   // RULE r

/* Failure Reporting */

export const SILENT_FAILS_ON = 29;   // SILENT_FAILS_ON
export const SILENT_FAILS_OFF = 30;    // SILENT_FAILS_OFF

/* Cleanup functions */

// export const BEGIN_TRANSACTION = 31;   // BEGIN_TRANSACTION
// export const ROLLBACK_TRANSACTION = 32;   // ROLLBACK_TRANSACTION
// export const COMMIT_TRANSACTION = 33;   // COMMIT_TRANSACTION

/* Data sharing */

export const ENTER_SCOPE = 34;   // ENTER_SCOPE f, n, pc, p1, p2, ..., pN
export const EXIT_SCOPE = 35;   // EXIT_SCOPE
