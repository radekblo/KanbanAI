"use client";

import { useState, useEffect } from 'react';
import type { Task, Column, ColumnId, Priority } from '@/types';
import KanbanColumn from './KanbanColumn';
import { useToast } from '@/hooks/use-toast';

// Initial Data
const initialTasks: Task[] = [
  { id: 'task-1', title: 'Setup project environment', assignee: 'Alice', deadline: '2024-08-10', status: 'todo', priority: 'High', order: 0 },
  { id: 'task-2', title: 'Design UI mockups', description: "Create mockups for all main screens.", assignee: 'Bob', deadline: '2024-08-15', status: 'todo', priority: 'Medium', order: 1 },
  { id: 'task-3', title: 'Develop login feature', assignee: 'Alice', deadline: '2024-08-20', status: 'inprogress', priority: 'High', order: 0 },
  { id: 'task-4', title: 'Write API documentation', assignee: 'Charlie', deadline: '2024-08-25', status: 'done', priority: 'Low', order: 0 },
  { id: 'task-5', title: 'User testing session', description: "Conduct usability testing with 5 users.", deadline: '2024-09-01', status: 'todo', priority: 'Medium', order: 2 },
];

const initialColumnOrder: ColumnId[] = ['todo', 'inprogress', 'done'];

const initialColumnsData: Record<ColumnId, { title: string }> = {
  todo: { title: 'To Do' },
  inprogress: { title: 'In Progress' },
  done: { title: 'Done' },
};


export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [columns, setColumns] = useState<Record<ColumnId, Column>>(() => {
    const cols: Partial<Record<ColumnId, Column>> = {};
    initialColumnOrder.forEach(id => {
      cols[id] = {
        id,
        title: initialColumnsData[id].title,
        tasks: [],
      };
    });
    tasks.forEach(task => {
      if (cols[task.status]) {
        cols[task.status]!.tasks.push(task);
      }
    });
    // Sort tasks within columns by their order property
    initialColumnOrder.forEach(id => {
      cols[id]!.tasks.sort((a, b) => a.order - b.order);
    });
    return cols as Record<ColumnId, Column>;
  });
  
  const { toast } = useToast();

  // Effect to update columns when tasks change (e.g., new task added)
  useEffect(() => {
    setColumns(prevColumns => {
      const newColsState: Record<ColumnId, Column> = {
        todo: { ...prevColumns.todo, tasks: [] },
        inprogress: { ...prevColumns.inprogress, tasks: [] },
        done: { ...prevColumns.done, tasks: [] },
      };

      tasks.forEach(task => {
        if (newColsState[task.status]) {
          newColsState[task.status].tasks.push(task);
        }
      });

      initialColumnOrder.forEach(id => {
        newColsState[id].tasks.sort((a, b) => a.order - b.order);
      });
      return newColsState;
    });
  }, [tasks]);


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: ColumnId) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    setTasks(prevTasks => {
      const taskToMove = prevTasks.find(t => t.id === taskId);
      if (!taskToMove) return prevTasks;

      // Remove task from old column's order and update status
      const updatedTasks = prevTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: targetColumnId };
        }
        // Adjust order of remaining tasks in original column if needed (simplification: not doing complex reordering here)
        return t;
      });
      
      // Add task to new column and set its order
      // For simplicity, new tasks are added to the end of the target column.
      // A more robust solution would calculate the correct order based on drop position.
      const tasksInTargetColumn = updatedTasks.filter(t => t.status === targetColumnId && t.id !== taskId);
      const newOrder = tasksInTargetColumn.length;

      return updatedTasks.map(t => 
        t.id === taskId ? { ...t, status: targetColumnId, order: newOrder } : t
      );
    });
     toast({
        title: "Task Moved",
        description: `Task "${tasks.find(t => t.id === taskId)?.title}" moved to ${initialColumnsData[targetColumnId].title}.`,
      });
  };
  
  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'order' | 'status'> & { status: ColumnId }) => {
    setTasks(prevTasks => {
      const newId = `task-${Date.now()}`; // Simple ID generation
      const tasksInTargetColumn = prevTasks.filter(t => t.status === newTaskData.status);
      const newOrder = tasksInTargetColumn.length;
      const finalNewTask: Task = {
        ...newTaskData,
        id: newId,
        order: newOrder,
      };
      return [...prevTasks, finalNewTask];
    });
     toast({
        title: "Task Created",
        description: `Task "${newTaskData.title}" has been added to ${initialColumnsData[newTaskData.status].title}.`,
      });
  };

  const handleUpdateTaskPriority = (taskId: string, priority: Priority) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, priority } : task
      )
    );
  };

  // This function is passed down to CreateTaskDialog, but the dialog is in page.tsx
  // For now, this component handles its own tasks. To connect with dialog in page.tsx,
  // we'd need to lift state up or use a context. For this iteration, keeping it self-contained.
  // If CreateTaskDialog were a direct child, this would be easier.
  // Let's assume page.tsx will pass a handler to this board if tasks are managed higher up.
  // For the current request, KanbanBoard will contain its state including tasks.
  // The CreateTaskDialog needs to be integrated with this component's state.
  // This structure will be revised in page.tsx to pass handleCreateTask to the dialog.

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
      {initialColumnOrder.map(columnId => {
        const column = columns[columnId];
        if (!column) return null; // Should not happen with current setup
        return (
          <KanbanColumn
            key={column.id}
            columnId={column.id}
            title={column.title}
            tasks={column.tasks}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onUpdateTaskPriority={handleUpdateTaskPriority}
          />
        );
      })}
    </div>
  );
}

// To be used by page.tsx to pass handleCreateTask
export type CreateTaskHandler = (newTaskData: Omit<Task, 'id' | 'order' | 'status'> & { status: ColumnId }) => void;
