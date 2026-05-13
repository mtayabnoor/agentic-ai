import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Next.js App';

export function AuthHeader() {
  return (
    <header className="border-t-4 border-t-primary">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">{appName}</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
