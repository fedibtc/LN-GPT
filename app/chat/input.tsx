import { Icon } from "@fedibtc/ui";
import { forwardRef } from "react";

const ChatInput = forwardRef<
  HTMLInputElement,
  {
    onSubmit?: () => void;
    loading?: boolean;
  } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">
>(({ onSubmit, loading = false, ...props }, ref) => {
  return (
    <div className="flex gap-md focus-within:!border-blue items-center px-md">
      <input
        className="border-none py-lg text-base w-full outline-none disabled:opacity-50"
        disabled={loading}
        ref={ref}
        {...props}
      />
      <button
        onClick={typeof onSubmit !== "undefined" ? () => onSubmit() : undefined}
        type={typeof onSubmit !== "undefined" ? "button" : "submit"}
        disabled={loading}
        className="!bg-blue rounded-full w-8 h-8 p-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        <Icon
          icon={loading ? "IconLoader2" : "IconArrowUp"}
          size="sm"
          className={"text-white" + (loading ? " animate-spin" : "")}
          stroke={3}
        />
      </button>
    </div>
  );
});

ChatInput.displayName = "ChatInput";

export default ChatInput;
