import { AuthHeader } from '@/components/auth-header';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AuthHeader />
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}
