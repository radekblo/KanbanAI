"use client";

import type { Task, ColumnId } from '@/types';
import KanbanTask from './KanbanTask';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  columnId: ColumnId;
  title: string;
  tasks: Task[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetColumnId: ColumnId) => void;
  onUpdateTaskPriority: (taskId: string, priority: Task['priority']) => void;
}

export default function KanbanColumn({
  columnId,
  title,
  tasks,
  onDragStart,
  onDrop,
  onUpdateTaskPriority,
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    // Can add visual feedback here, e.g., changing background color
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop(e, columnId);
    // Reset visual feedback if any
  };

  const getColumnColor = (id: ColumnId) => {
    if (id === 'todo') return 'bg-blue-100 border-blue-300';
    if (id === 'inprogress') return 'bg-yellow-100 border-yellow-300';
    if (id === 'done') return 'bg-green-100 border-green-300';
    return 'bg-gray-100 border-gray-300';
  }

  return (
    <div
      className={cn(
        "w-80 md:w-96 flex-shrink-0 rounded-lg shadow-md p-1 h-full flex flex-col",
        getColumnColor(columnId) // Using custom simple colors for columns for clarity
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      aria-label={`Column: ${title}, containing ${tasks.length} tasks`}
    >
      <h2 className="text-lg font-semibold font-headline p-3 text-center text-gray-700">
        {title} ({tasks.length})
      </h2>
      <ScrollArea className="flex-1 p-3 rounded-md bg-background/50">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <KanbanTask
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onUpdateTaskPriority={onUpdateTaskPriority}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
