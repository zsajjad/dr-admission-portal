import { config } from '@/config';

import service, { IAPArgs } from './index';

const API_URL = config.ACTIVITY_LOGGER_PUBLIC_API_URL;

async function activityLoggerService<T>(args: IAPArgs): Promise<T> {
  return service({ ...args, baseDomain: API_URL });
}

export default activityLoggerService;
