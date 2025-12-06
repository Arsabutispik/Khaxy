import { Item, ItemActions, ItemTitle } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/layout/SaveButton";
import React from "react";

export default function UnsavedChanges({
  handleReset,
  unsavedChanges,
  message,
}: {
  handleReset: () => void;
  unsavedChanges: boolean;
  message: { title: string; reset: string };
}) {
  return (
    <Item
      className="bottom-0 fixed w-[90%] md:w-[50%] left-1/2 transform -translate-x-1/2 z-50 mb-4 flex flex-row items-center justify-between px-4 py-2 backdrop-blur bg-black/80 border border-white/10"
      variant="outline"
    >
      <ItemTitle className="hidden md:block text-white">
        {message.title}
      </ItemTitle>
      <ItemActions>
        <Button
          variant="ghost"
          onClick={handleReset}
          type="button"
          className="text-zinc-400 hover:text-white hover:bg-white/10"
        >
          {message.reset}
        </Button>
        <SaveButton disabled={false} unsavedChanges={unsavedChanges} />
      </ItemActions>
    </Item>
  );
}
