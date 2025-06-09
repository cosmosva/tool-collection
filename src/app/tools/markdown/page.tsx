import { MarkdownProcessor } from '@/components/MarkdownProcessor';
import { BackButton } from '@/components/BackButton';

export default function MarkdownPage() {
  return (
    <div className="relative">
      <BackButton />
      <MarkdownProcessor />
    </div>
  );
} 