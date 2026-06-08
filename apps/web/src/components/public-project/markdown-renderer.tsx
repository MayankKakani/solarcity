import CommentEditor from "@/components/activity/comment-editor";

type MarkdownRendererProps = {
  content: string;
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <CommentEditor
      value={content}
      readOnly
      showBubbleMenu={false}
      proseClassName="solarplan-tiptap-prose"
      contentClassName="solarplan-tiptap-content"
      className="[&_.solarplan-tiptap-content_.ProseMirror]:max-h-none [&_.solarplan-tiptap-content_.ProseMirror]:overflow-visible [&_.solarplan-tiptap-content_.ProseMirror]:px-0 [&_.solarplan-tiptap-content_.ProseMirror]:py-0"
    />
  );
}
