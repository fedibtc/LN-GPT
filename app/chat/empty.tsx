"use client";

import { useAppState } from "@/components/providers/app-state-provider";
import { queryGet } from "@/lib/rest";
import { Button, Icon, Text } from "@fedibtc/ui";
import { Conversation } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createChat } from "./actions/create";
import ChatInput from "./input";
import { styled } from "react-tailwind-variants";

const env = process.env.NEXT_PUBLIC_ENV;

export default function EmptyState() {
  const [value, setValue] = useState("");
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const { balance, refetchBalance, setConversation, setTopupDialog } =
    useAppState();

  const handleCreateConversation = async (text: string) => {
    setIsCreatingConversation(true);

    const res = await createChat({ text });

    if (!res.success) {
      throw new Error(res.message);
    }

    setConversation(res.data);
    setIsCreatingConversation(false);
  };

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => queryGet<Array<Conversation>>("/chat"),
    retry: false,
  });

  useEffect(() => {
    refetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col grow items-center justify-center">
          <Icon
            icon="IconLoader2"
            size="xl"
            className="animate-load text-lightGrey"
          />
        </div>
      ) : (conversations?.length ?? 0) > 0 ? (
        <div className="flex flex-col gap-sm grow p-sm">
          <div className="flex gap-sm justify-between items-center border-b border-extraLightGrey pb-sm">
            <Text>{balance?.balance} sats</Text>
            <div className="flex gap-sm items-center">
              <Button size="sm" onClick={() => setTopupDialog(true)}>
                Topup
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-sm grow">
            <Text weight="medium" className="text-grey">
              Jump back in
            </Text>
            <div className="grow relative">
              <div className="inset-0 absolute flex flex-col gap-sm overflow-auto">
                {conversations?.map((c, i) => (
                  <div
                    key={i}
                    className="p-sm rounded-md cursor-pointer flex gap-2 border border-extralightGrey items-center"
                    onClick={() => setConversation(c)}
                  >
                    <Icon icon="IconMessage" className="shrink-0 text-grey" />
                    <Text ellipsize>{c.title}</Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grow flex flex-col gap-sm justify-center items-center">
          <Text variant="h1" weight="bolder">
            AI Assistant
            {env !== "production" && (
              <>
                {" "}
                <EnvironmentBadge environment={env}>
                  <Text weight="medium">
                    {env === "development" ? "Dev" : "Preview"}
                  </Text>
                </EnvironmentBadge>
              </>
            )}
          </Text>
          <Text>Chats for Sats ⚡️</Text>
          <Text>Balance: {balance?.balance} sats</Text>
          <Button onClick={() => setTopupDialog(true)}>Topup</Button>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateConversation(value);
        }}
      >
        {(balance?.balance ?? 0) < 1 ? (
          <div className="flex items-center p-md justify-center">
            <Text className="flex gap-xs text-center">
              Top up to start chatting
            </Text>
          </div>
        ) : (
          <ChatInput
            value={value}
            placeholder={
              conversations?.length === 0
                ? "Send a message..."
                : "Start a conversation..."
            }
            onChange={(e) => setValue(e.target.value)}
            loading={isCreatingConversation}
          />
        )}
      </form>
    </>
  );
}

const EnvironmentBadge = styled("div", {
  base: "inline-block rounded-full px-2 py-1 text-white align-middle",
  variants: {
    environment: {
      development: "bg-violet-500",
      preview: "bg-blue",
    },
  },
});
