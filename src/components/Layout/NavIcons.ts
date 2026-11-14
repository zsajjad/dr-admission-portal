import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import AirportShuttleOutlinedIcon from '@mui/icons-material/AirportShuttleOutlined';
import AirportShuttleRoundedIcon from '@mui/icons-material/AirportShuttleRounded';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import GradingOutlinedIcon from '@mui/icons-material/GradingOutlined';
import GradingRoundedIcon from '@mui/icons-material/GradingRounded';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import HistoryEduRoundedIcon from '@mui/icons-material/HistoryEduRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import JoinInnerOutlinedIcon from '@mui/icons-material/JoinInnerOutlined';
import JoinInnerRoundedIcon from '@mui/icons-material/JoinInnerRounded';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import RuleRoundedIcon from '@mui/icons-material/RuleRounded';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import SupervisedUserCircleRoundedIcon from '@mui/icons-material/SupervisedUserCircleRounded';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';

type MuiIcon = OverridableComponent<SvgIconTypeMap<object, 'svg'>>;

export const navIcons: Record<string, { filled: MuiIcon; outlined: MuiIcon }> = {
  home: {
    filled: HomeRoundedIcon,
    outlined: HomeOutlinedIcon,
  },
  adminUsers: {
    filled: SupervisedUserCircleRoundedIcon,
    outlined: SupervisedUserCircleOutlinedIcon,
  },
  adminPermissions: {
    filled: AdminPanelSettingsRoundedIcon,
    outlined: AdminPanelSettingsOutlinedIcon,
  },
  branches: {
    filled: AccountTreeRoundedIcon,
    outlined: AccountTreeOutlinedIcon,
  },
  van: {
    filled: AirportShuttleRoundedIcon,
    outlined: AirportShuttleOutlinedIcon,
  },
  admissions: {
    filled: AssignmentIndRoundedIcon,
    outlined: AssignmentIndOutlinedIcon,
  },
  students: {
    filled: PersonSearchRoundedIcon,
    outlined: PersonSearchOutlinedIcon,
  },
  studentMerge: {
    filled: JoinInnerRoundedIcon,
    outlined: JoinInnerOutlinedIcon,
  },
  staffUsers: {
    filled: BadgeRoundedIcon,
    outlined: BadgeOutlinedIcon,
  },
  sections: {
    filled: ClassRoundedIcon,
    outlined: ClassOutlinedIcon,
  },
  syncReview: {
    filled: RuleRoundedIcon,
    outlined: RuleOutlinedIcon,
  },
  results: {
    filled: GradingRoundedIcon,
    outlined: GradingOutlinedIcon,
  },
  auditLog: {
    filled: HistoryEduRoundedIcon,
    outlined: HistoryEduOutlinedIcon,
  },
  questionSets: {
    filled: QuizRoundedIcon,
    outlined: QuizOutlinedIcon,
  },
  printing: {
    filled: PrintRoundedIcon,
    outlined: PrintOutlinedIcon,
  },
  interactionReport: {
    filled: BarChartRoundedIcon,
    outlined: BarChartOutlinedIcon,
  },
  trainings: {
    filled: SchoolRoundedIcon,
    outlined: SchoolOutlinedIcon,
  },
  resultRules: {
    filled: RuleRoundedIcon,
    outlined: RuleOutlinedIcon,
  },
};
