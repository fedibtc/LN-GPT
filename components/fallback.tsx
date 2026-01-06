"use client";

import { Icon, Text } from "@fedibtc/ui";
import Container from "./container";
import { useAuth } from "./providers/auth-provider";
import { formatError } from "@/lib/errors";
import { useEffect, useState } from "react";

export default function Fallback({ children }: { children: React.ReactNode }) {
  const [hasWeblnAndNostr, setHasWeblnAndNostr] = useState<boolean | null>(
    null,
  );
  const { isLoading: isAuthLoading, error: authError } = useAuth();

  const error = hasWeblnAndNostr === null || authError;

  useEffect(() => {
    if ("webln" in window && "nostr" in window) {
      setHasWeblnAndNostr(true);
    }
  }, []);

  if (error) {
    return (
      <Container className="p-2">
        <Icon icon="IconCircleX" size="lg" className="text-lightGrey" />
        <Text variant="h2" weight="bold">
          An Error Occurred
        </Text>
        <Text className="text-center">{formatError(error)}</Text>
      </Container>
    );
  }

  if (hasWeblnAndNostr === null || isAuthLoading) {
    return (
      <Container>
        <Icon
          icon="IconLoader2"
          size="lg"
          className="animate-spin text-lightGrey"
        />
        <Text>
          {hasWeblnAndNostr === null ? "Loading" : "Authenticating"}...
        </Text>
      </Container>
    );
  }

  return <Container>{children}</Container>;
}
