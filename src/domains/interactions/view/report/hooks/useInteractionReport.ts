import { useMemo } from 'react';

import { QuestionStats, StudentWithRating } from '@/providers/service/app.schemas';
import { useInteractionsControllerGetDashboard } from '@/providers/service/interactions/interactions';

import { getRatingColor } from '../constants';

import { useAdmissionsAreaDistribution } from './useAdmissionsAreaDistribution';

export interface UseInteractionReportProps {
  sessionId?: string;
  branchId?: string;
  classLevelId?: string;
  areaId?: string;
}

export interface RatingDistributionData {
  questionId: string;
  prompt: string;
  sortOrder: number;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
  total: number;
}

export interface QuestionMetricsData {
  questionId: string;
  prompt: string;
  sortOrder: number;
  averageRating: number;
  color: string;
}

export interface QuestionWithStudentGroups {
  questionId: string;
  prompt: string;
  sortOrder: number;
  averageRating: number;
  totalRatings: number;
  lowRatingCount: number;
  lowRatingPercentage: number;
  studentsBest: StudentWithRating[];
  studentsAverage: StudentWithRating[];
  studentsNeedingAttention: StudentWithRating[];
}

export function useInteractionReport({ sessionId, branchId, classLevelId, areaId }: UseInteractionReportProps) {
  const hasRequiredFilters = Boolean(sessionId && branchId && classLevelId);

  const {
    data: dashboardData,
    isLoading: isInteractionsLoading,
    isError,
    error,
  } = useInteractionsControllerGetDashboard(
    {
      sessionId: sessionId!,
      branchId: branchId!,
      classLevelId: classLevelId!,
      areaId,
    },
    {
      query: {
        enabled: hasRequiredFilters,
      },
    },
  );

  const {
    data: admissionsAreaDistributionData,
    isLoading: isAdmissionsLoading,
    isError: isAdmissionsError,
    error: admissionsError,
  } = useAdmissionsAreaDistribution({ sessionId, branchId, classLevelId });

  // Rating distribution chart data
  const ratingDistributionData: RatingDistributionData[] = useMemo(() => {
    if (!dashboardData?.data?.questions) return [];

    return dashboardData.data.questions.map((q: QuestionStats) => ({
      questionId: q.questionId,
      prompt: q.prompt.length > 50 ? `${q.prompt.substring(0, 50)}...` : q.prompt,
      sortOrder: q.sortOrder,
      rating1: q.rating1Count,
      rating2: q.rating2Count,
      rating3: q.rating3Count,
      rating4: q.rating4Count,
      rating5: q.rating5Count,
      total: q.totalRatings,
    }));
  }, [dashboardData]);

  // Question metrics chart data (average rating per question)
  const questionMetricsData: QuestionMetricsData[] = useMemo(() => {
    if (!dashboardData?.data?.questions) return [];

    return dashboardData.data.questions.map((q: QuestionStats) => ({
      questionId: q.questionId,
      prompt: q.prompt.length > 40 ? `${q.prompt.substring(0, 40)}...` : q.prompt,
      sortOrder: q.sortOrder,
      averageRating: q.averageRating,
      color: getRatingColor(q.averageRating),
    }));
  }, [dashboardData]);

  // Questions data for the students table with all peer teaching groups
  const questionsWithStudents: QuestionWithStudentGroups[] = useMemo(() => {
    if (!dashboardData?.data?.questions) return [];

    return dashboardData.data.questions.map((q: QuestionStats) => ({
      questionId: q.questionId,
      prompt: q.prompt,
      sortOrder: q.sortOrder,
      averageRating: q.averageRating,
      totalRatings: q.totalRatings,
      lowRatingCount: q.lowRatingCount,
      lowRatingPercentage: q.lowRatingPercentage,
      studentsBest: q.studentsBest || [],
      studentsAverage: q.studentsAverage || [],
      studentsNeedingAttention: q.studentsNeedingAttention || [],
    }));
  }, [dashboardData]);

  // Insights data
  const insights = useMemo(() => {
    if (!dashboardData?.data?.insights) {
      return {
        totalInteractions: 0,
        overallAverageRating: 0,
        totalStudentsNeedingAttention: 0,
        questionsNeedingAttention: 0,
        bestQuestion: null,
        worstQuestion: null,
      };
    }

    const { insights: apiInsights, totalInteractions } = dashboardData.data;

    return {
      totalInteractions: totalInteractions || 0,
      overallAverageRating: apiInsights.overallAverageRating || 0,
      totalStudentsNeedingAttention: apiInsights.totalStudentsNeedingAttention || 0,
      questionsNeedingAttention: apiInsights.questionsNeedingAttention || 0,
      bestQuestion: apiInsights.bestQuestion,
      worstQuestion: apiInsights.worstQuestion,
    };
  }, [dashboardData]);

  return {
    // State
    isLoading: hasRequiredFilters && (isInteractionsLoading || isAdmissionsLoading),
    isError: isError || isAdmissionsError,
    error: error || admissionsError,
    hasRequiredFilters,
    hasData: Boolean(dashboardData?.data),

    // Metadata
    session: dashboardData?.data?.session,
    classLevel: dashboardData?.data?.classLevel,
    branch: dashboardData?.data?.branch,
    questionSet: dashboardData?.data?.questionSet,

    // Chart data
    ratingDistributionData,
    questionMetricsData,
    admissionsAreaDistributionData: admissionsAreaDistributionData.byArea,
    admissionsLegacyNewTotals: admissionsAreaDistributionData.totals,

    // Table data
    questionsWithStudents,

    // Insights
    insights,

    // Raw data
    rawQuestions: dashboardData?.data?.questions || [],
  };
}
