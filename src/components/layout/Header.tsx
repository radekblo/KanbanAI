import { LayoutDashboard } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center">
        <LayoutDashboard className="h-8 w-8 mr-3" />
        <h1 className="text-2xl font-headline font-bold">KanbanAI</h1>
      </div>
    </header>
  );
}
