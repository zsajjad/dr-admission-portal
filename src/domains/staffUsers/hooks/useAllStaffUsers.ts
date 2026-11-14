import { useQuery } from '@tanstack/react-query';

import { StaffRole, StaffUserEntity } from '@/providers/service/app.schemas';
import { staffUserControllerFindAll } from '@/providers/service/staff-user/staff-user';

const PAGE = 100; // the API's largest page

/**
 * Every staff user matching the filters, fetched page by page.
 * For the card sheet and the teacher pickers, where a single page could miss people.
 */
export function useAllStaffUsers(
  params: { role?: StaffRole; includeInActive?: boolean } = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ['staff-users-all', params],
    enabled: options.enabled ?? true,
    queryFn: async ({ signal }) => {
      const all: StaffUserEntity[] = [];
      for (let skip = 0; ; skip += PAGE) {
        const page = await staffUserControllerFindAll({ ...params, skip, take: PAGE }, signal);
        all.push(...page.data);
        if (page.data.length < PAGE || all.length >= page.count) break;
      }
      return all;
    },
  });
}
