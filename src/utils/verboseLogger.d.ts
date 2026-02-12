type LoggerArgs = unknown[]

declare const logger: {
  debug: (...args: LoggerArgs) => void
  info: (...args: LoggerArgs) => void
  warn: (...args: LoggerArgs) => void
  error: (...args: LoggerArgs) => void
}

export default logger
