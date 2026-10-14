import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

type NavigationJob = () => void;
let pendingNavigationJob: NavigationJob | null = null;

export function runWhenNavigationReady(job: NavigationJob): void {
  if (navigationRef.isReady()) {
    job();
    return;
  }
  pendingNavigationJob = job;
}

export function flushPendingNavigation(): void {
  if (!navigationRef.isReady() || !pendingNavigationJob) return;
  const job = pendingNavigationJob;
  pendingNavigationJob = null;
  job();
}
