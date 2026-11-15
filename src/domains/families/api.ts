/**
 * Families: the calls the pages make (knowledge-base/families-contract.md).
 *
 * - `useChildSessions`: each child's admissions, school and result in every session
 *   (`GET /admin/families/student-sessions`, 1 to 30 children per call).
 * - `useFamilySearch`: households and possible households for a phone, a name or a GR (`GET /admin/families/search`).
 *
 * Every families query is keyed on its `/admin/families…` URL, so `useRefreshFamilies` refreshes them all after a write.
 */
import { useCallback, useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  AdmissionStatus,
  FamilySearchKind,
  FamilySearchRow,
  FinalResultStatus,
  Gender,
  StudentSessionsResponseDto,
} from '@/providers/service/app.schemas';
import {
  useFamiliesControllerSearch,
  useFamiliesControllerStudentFamily,
  useFamiliesControllerStudentSessions,
} from '@/providers/service/families/families';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

import { byBirthOrder, isFamilyQueryKey, queryKind } from './rules';

/* ----------------------------------------------------------------------------------------------------------------
 * Shapes the components use
 * -------------------------------------------------------------------------------------------------------------- */

export interface ChildSchool {
  /** Empty for a typed name that isn't on the schools list */
  id?: string | null;
  name: string;
  kind?: string | null;
  type?: string | null;
  medium?: string | null;
  feeBand?: string | null;
}

export interface ChildResult {
  /** PASS, FAIL, TERMINATED, or empty while pending */
  status?: FinalResultStatus | null;
  total?: number | null;
  maxTotal?: number | null;
  pct?: number | null;
  branchRank?: number | null;
  rankedOf?: number | null;
  locked?: boolean;
  theoryPct?: number | null;
  theoryMarks?: number | null;
  theoryMax?: number | null;
  wazuPct?: number | null;
  namazPct?: number | null;
}

export interface ChildAdmission {
  admissionId: string;
  sessionId: string;
  sessionName: string;
  branch: { id: string; code: string };
  classLevel: { id: string; code: string; name: string };
  sectionLetter?: string | null;
  status: AdmissionStatus;
  attending: boolean;
  isFeePaid: boolean;
  vanRequired: boolean;
  school?: ChildSchool | null;
  schoolClass?: string | null;
  /** Empty when results aren't visible or nothing was entered */
  result?: ChildResult | null;
  attendanceDays?: number | null;
  attendanceTotal?: number | null;
  /** Trainings passed this session against those the child's age required; empty when unknown */
  trainings?: { passed: number; due: number } | null;
}

export interface ChildSessions {
  id: string;
  requestedId: string;
  grNumber: string;
  name: string;
  fatherName: string;
  gender: Gender;
  dateOfBirth: string;
  isActive: boolean;
  phone?: string | null;
  alternatePhone?: string | null;
  area?: { id: string; code: string; name: string } | null;
  address?: string | null;
  familyId?: string;
  /** The live admission of each session, oldest first */
  admissions: ChildAdmission[];
}

export interface SessionColumn {
  id: string;
  name: string;
  startsAt?: string;
  isCurrent: boolean;
}

export interface ChildSessionsData {
  resultsVisible: boolean;
  trainingsVisible: boolean;
  /** Every session one of them has an admission in, plus the current one, oldest first */
  sessions: SessionColumn[];
  /** Eldest first */
  students: ChildSessions[];
  /** By student ID, and by the ID asked for when it was a merged record */
  byId: Map<string, ChildSessions>;
  isLoading: boolean;
}

/* ----------------------------------------------------------------------------------------------------------------
 * Refreshing
 * -------------------------------------------------------------------------------------------------------------- */

/** Fetches every families query again after a family write, so both students' cards and every list update */
export function useRefreshFamilies() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ predicate: (q) => isFamilyQueryKey(q.queryKey) }),
    [queryClient],
  );
}

/* ----------------------------------------------------------------------------------------------------------------
 * A student's family and possible siblings
 * -------------------------------------------------------------------------------------------------------------- */

export function useStudentFamily(studentId: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuthenticatedApi();
  return useFamiliesControllerStudentFamily(
    studentId ?? '',
    { includeWeak: true },
    { query: { enabled: isAuthenticated && enabled && !!studentId } },
  );
}

/* ----------------------------------------------------------------------------------------------------------------
 * Children session by session
 * -------------------------------------------------------------------------------------------------------------- */

/** Core takes 1 to 30 children per call */
export const MAX_CHILDREN = 30;

/** The response in the shape the tables use */
export function toChildSessions(res: StudentSessionsResponseDto | undefined): Omit<ChildSessionsData, 'isLoading'> {
  const students: ChildSessions[] = (res?.students ?? [])
    .map(
      (s): ChildSessions => ({
        id: s.id,
        requestedId: s.requestedId,
        grNumber: s.grNumber,
        name: s.name,
        fatherName: s.fatherName,
        gender: s.gender,
        dateOfBirth: s.dateOfBirth,
        isActive: s.isActive,
        phone: s.phone,
        alternatePhone: s.alternatePhone,
        area: s.area,
        address: s.address,
        familyId: s.familyId,
        admissions: s.admissions.map((a) => ({
          admissionId: a.admissionId,
          sessionId: a.sessionId,
          sessionName: a.sessionName,
          branch: a.branch,
          classLevel: a.classLevel,
          sectionLetter: a.sectionLetter,
          status: a.status,
          attending: a.attending,
          isFeePaid: a.isFeePaid,
          vanRequired: a.vanRequired,
          school: a.school,
          schoolClass: a.schoolClass,
          result: a.result
            ? {
                status: a.result.status,
                total: a.result.total,
                maxTotal: a.result.maxTotal,
                pct: a.result.pct,
                branchRank: a.result.branchRank,
                rankedOf: a.result.rankedOf,
                locked: a.result.locked,
                theoryPct: a.result.theoryPct,
                theoryMarks: a.result.theoryMarks,
                theoryMax: a.result.theoryMaxMarks,
                wazuPct: a.result.wazuPct,
                namazPct: a.result.namazPct,
              }
            : null,
          attendanceDays: a.result?.attendanceDays,
          attendanceTotal: a.result?.attendanceTotal,
          trainings: a.result?.trainings ? { passed: a.result.trainings.passed, due: a.result.trainings.due } : null,
        })),
      }),
    )
    .sort(byBirthOrder);
  const byId = new Map<string, ChildSessions>();
  for (const s of students) {
    byId.set(s.id, s);
    byId.set(s.requestedId, s);
  }
  const resultsVisible = !!res?.resultsVisible;
  return {
    resultsVisible,
    // Trainings come inside the result, so they show with results
    trainingsVisible: resultsVisible,
    sessions: res?.sessions ?? [],
    students,
    byId,
  };
}

/** Each child's admissions, schools and results across sessions, eldest first (one call) */
export function useChildSessions(studentIds: readonly string[]): ChildSessionsData {
  const { isAuthenticated } = useAuthenticatedApi();
  const ids = useMemo(() => [...new Set(studentIds)].sort().slice(0, MAX_CHILDREN), [studentIds]);
  const { data, isLoading } = useFamiliesControllerStudentSessions(
    { studentIds: ids.join(',') },
    { query: { enabled: isAuthenticated && ids.length > 0, staleTime: 30_000 } },
  );
  return useMemo(
    () => ({ ...toChildSessions(data), isLoading: ids.length > 0 && isLoading }),
    [data, isLoading, ids.length],
  );
}

/** A child's latest admission (the most recent session they were admitted in) */
export const latestOf = (child: ChildSessions | undefined): ChildAdmission | undefined =>
  child?.admissions[child.admissions.length - 1];

/* ----------------------------------------------------------------------------------------------------------------
 * Family search
 * -------------------------------------------------------------------------------------------------------------- */

export type SearchRow = FamilySearchRow;

export function useFamilySearch(q: string, page: number, pageSize: number) {
  const { isAuthenticated } = useAuthenticatedApi();
  // Core answers 400 QUERY_TOO_SHORT for these; don't ask
  const enabled = isAuthenticated && queryKind(q) !== 'TOO_SHORT';
  const { data, isLoading, isError, error } = useFamiliesControllerSearch(
    { q: q.trim(), skip: page * pageSize, take: pageSize },
    { query: { enabled, staleTime: 30_000 } },
  );
  return {
    kind: data?.queryKind as FamilySearchKind | undefined,
    normalized: data?.normalized,
    rows: enabled ? (data?.data ?? []) : [],
    count: data?.count ?? 0,
    truncated: !!data?.truncated,
    isLoading: enabled && isLoading,
    isError,
    error,
  };
}
