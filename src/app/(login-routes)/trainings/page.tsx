import { redirect } from 'next/navigation';

import { routes } from '@/router/routes';

export default function TrainingsHome() {
  redirect(routes.trainings.courses);
}
