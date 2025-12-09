import { Box, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

export interface IDataNotFoundProps {
  notFoundMessage: string;
}
const CenteredBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '150px',
});
export function DataNotFound({ notFoundMessage }: IDataNotFoundProps) {
  return (
    <Card>
      <CardContent>
        <CenteredBox>
          <Typography variant="h6">{notFoundMessage}</Typography>
        </CenteredBox>
      </CardContent>
    </Card>
  );
}
