'use client';

import { MobileNavBar } from './MobileNavBar';
import { SideNavBar } from './SideNavBar';
import { Container, ContentContainer, Content } from './Styled';

interface LayoutProps {
  children: React.ReactNode;
}

export function LayoutSkeleton({ children }: LayoutProps): React.JSX.Element {
  return (
    <>
      <Container>
        <SideNavBar />
        <ContentContainer>
          <MobileNavBar />
          <Content>{children}</Content>
        </ContentContainer>
      </Container>
    </>
  );
}
