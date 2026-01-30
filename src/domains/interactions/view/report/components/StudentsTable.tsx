'use client';

import { useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { StudentWithRating } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import {
  accordionStyle,
  accordionSummaryStyle,
  colors,
  getRatingColor,
  ratingBadgeStyle,
  studentGroupBadgeStyle,
  tableContainerStyle,
  tableHeaderStyle,
  tableRowStyle,
} from '../styles';

interface QuestionWithStudentGroups {
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

interface StudentsTableProps {
  questions: QuestionWithStudentGroups[];
}

function RatingBadge({ rating }: { rating: number }) {
  return <Box sx={ratingBadgeStyle(rating)}>{rating}</Box>;
}

function AverageRatingChip({ rating }: { rating: number }) {
  return (
    <Chip
      label={rating.toFixed(1)}
      size="small"
      sx={{
        bgcolor: getRatingColor(rating),
        color: 'white',
        fontWeight: 600,
        fontSize: 12,
        height: 24,
        '& .MuiChip-label': { px: 1.5 },
      }}
    />
  );
}

interface StudentListProps {
  students: StudentWithRating[];
  groupType: 'best' | 'average' | 'attention';
}

function StudentList({ students }: StudentListProps) {
  if (students.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.noStudentsInGroup} />
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={tableHeaderStyle}>
            <TableCell>
              <FormattedMessage {...messages.grNumber} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...messages.studentName} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...messages.area} />
            </TableCell>
            <TableCell align="center">
              <FormattedMessage {...messages.rating} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student, idx) => (
            <TableRow key={`${student.grNumber}-${idx}`} sx={tableRowStyle(idx)}>
              <TableCell sx={{ py: 1.5 }}>
                <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
                  {student.grNumber}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Typography variant="body2" className="font-urdu">
                  {student.name}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary" className="font-urdu">
                  {(student.area as { name?: string })?.name || '-'}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
                <RatingBadge rating={student.rating} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function QuestionAccordion({ question }: { question: QuestionWithStudentGroups }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const totalStudents =
    question.studentsBest.length + question.studentsAverage.length + question.studentsNeedingAttention.length;

  const tabGroups = [
    { label: 'Need Help', count: question.studentsNeedingAttention.length, type: 'attention' as const },
    { label: 'Can Teach', count: question.studentsBest.length, type: 'best' as const },
    { label: 'Average', count: question.studentsAverage.length, type: 'average' as const },
  ];

  const getStudentsByTab = () => {
    switch (activeTab) {
      case 0:
        return { students: question.studentsNeedingAttention, type: 'attention' as const };
      case 1:
        return { students: question.studentsBest, type: 'best' as const };
      case 2:
        return { students: question.studentsAverage, type: 'average' as const };
      default:
        return { students: question.studentsNeedingAttention, type: 'attention' as const };
    }
  };

  const { students, type } = getStudentsByTab();

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      disableGutters
      elevation={0}
      sx={accordionStyle}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: colors.purple[500] }} />}
        sx={accordionSummaryStyle(expanded)}
      >
        <Typography variant="body2" fontWeight={500} sx={{ flex: 1, color: 'text.primary' }} className="font-urdu">
          Q{question.sortOrder}: {question.prompt}
        </Typography>
        <AverageRatingChip rating={question.averageRating} />
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>
          {totalStudents} students
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        {/* Pill-style tabs */}
        <Box sx={{ px: 2, py: 1.5, bgcolor: colors.purple[50] }}>
          <Box
            sx={{
              display: 'inline-flex',
              gap: 0.5,
              p: 0.5,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
            {tabGroups.map((tab, idx) => (
              <Box
                key={tab.type}
                onClick={() => setActiveTab(idx)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  bgcolor: activeTab === idx ? colors.purple[600] : 'transparent',
                  color: activeTab === idx ? 'white' : colors.neutral.gray700,
                  '&:hover': {
                    bgcolor: activeTab === idx ? colors.purple[600] : colors.purple[50],
                  },
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={activeTab === idx ? 600 : 500}
                  sx={{ fontSize: 12, lineHeight: 1 }}
                >
                  {tab.label}
                </Typography>
                <Box
                  sx={{
                    minWidth: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    bgcolor: activeTab === idx ? 'rgba(255,255,255,0.2)' : colors.neutral.gray100,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  {tab.count}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <StudentList students={students} groupType={type} />
      </AccordionDetails>
    </Accordion>
  );
}

export function StudentsTable({ questions }: StudentsTableProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <Card sx={tableContainerStyle}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2.5, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SchoolIcon sx={{ color: colors.purple[600], fontSize: 22 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600} color={colors.purple[800]}>
              <FormattedMessage {...messages.studentsTable} />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <FormattedMessage {...messages.peerTeachingDescription} />
            </Typography>
          </Box>
        </Box>

        {questions.map((question) => (
          <QuestionAccordion key={question.questionId} question={question} />
        ))}
      </CardContent>
    </Card>
  );
}
