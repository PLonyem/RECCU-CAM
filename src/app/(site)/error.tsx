"use client";

import { useEffect } from "react";
import { Button, Container, ErrorState, Section } from "@/components/ui";

export default function SiteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Public route failed to render:", error);
  }, [error]);

  return (
    <Section>
      <Container size="reading">
        <ErrorState
          title="This page could not be loaded"
          description="The rest of the RECCU-CAM platform is still available. Try this page again, or return through the main navigation."
          action={<Button type="button" onClick={unstable_retry}>Try again</Button>}
        />
      </Container>
    </Section>
  );
}
