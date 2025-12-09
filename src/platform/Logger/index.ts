import { config } from '@/config';

import { createLogger, LogLevel as LogLevelAbstract } from './_logger_abstract';

export const logger = createLogger({ level: config.logLevel as keyof typeof LogLevelAbstract });

export const LogLevel = LogLevelAbstract;
