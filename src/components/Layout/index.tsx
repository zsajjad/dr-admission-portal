'use client';

import { MobileNavBar } from './MobileNavBar';
import { SideNavBar } from './SideNavBar';
import { Body, Container, ContentContainer, Content } from './Styled';

interface LayoutProps {
  children: React.ReactNode;
}

export function LayoutSkeleton({ children }: LayoutProps): React.JSX.Element {
  return (
    <>
      <Container>
        {/* The green top bar across the whole width, then the side nav and the page. */}
        <MobileNavBar />
        <Body>
          <SideNavBar />
          <ContentContainer>
            <Content>{children}</Content>
          </ContentContainer>
        </Body>
      </Container>
    </>
  );
}
