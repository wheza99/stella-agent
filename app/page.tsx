import ChatInput from "@/components/pabrik-startup/chat/chat-input";
import PabrikStartupChip from "@/components/pabrik-startup/marketing/chip";
import { Item, ItemDescription, ItemTitle } from "@/components/ui/item";

export default function Home() {
  return (
    <Item className="flex flex-col justify-center items-center text-center p-2 h-full max-w-5xl mx-auto">
      <PabrikStartupChip />

      <ItemTitle className="text-4xl md:text-6xl font-bold">
        Your App Highlight
      </ItemTitle>

      <ItemDescription className="text-lg md:text-xl">
        Your app description goes here with a brief overview of its features and
        benefits with maximum length of two sentences.
      </ItemDescription>

      <ChatInput />
    </Item>
  );
}
