import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AirportShuttleOutlinedIcon from '@mui/icons-material/AirportShuttleOutlined';
import AirportShuttleRoundedIcon from '@mui/icons-material/AirportShuttleRounded';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import RuleRoundedIcon from '@mui/icons-material/RuleRounded';
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
  resultRules: {
    filled: RuleRoundedIcon,
    outlined: RuleOutlinedIcon,
  },
};
