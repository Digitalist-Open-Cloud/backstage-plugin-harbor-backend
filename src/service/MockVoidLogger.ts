import { LoggerService } from '@backstage/backend-plugin-api'

export const mockVoidLogger: LoggerService = {
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
  child: () => mockVoidLogger,
}
