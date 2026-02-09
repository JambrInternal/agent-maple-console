// Minimal type declaration for verboseLogger utility
// This fixes TS7016: implicitly has an 'any' type

declare module '../utils/verboseLogger' {
  const logger: {
    info: (msg: string, meta?: any) => void;
    warn: (msg: string, meta?: any) => void;
    error: (msg: string, meta?: any) => void;
    debug?: (msg: string, meta?: any) => void;
  };
  export default logger;
}
