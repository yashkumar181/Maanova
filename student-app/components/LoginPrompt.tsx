import Link from 'next/link';
import { Button } from './ui/button';

interface LoginPromptProps {
  title?: string;
  message?: string;
}

export const LoginPrompt = ({ 
  title = "Please Log In", 
  message = "You need to be logged in to access this feature." 
}: LoginPromptProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      <div className="max-w-md w-full border bg-card text-card-foreground p-8 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button asChild size="lg" className="w-full">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    </div>
  );
};