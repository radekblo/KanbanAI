export type Priority = 'Low' | 'Medium' | 'High' | 'None';
export type ColumnId = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  deadline?: string; // YYYY-MM-DD
  priority: Priority;
  status: ColumnId;
  order: number; // For ordering within a column
}

export interface Column {
  id: ColumnId;
  title: string;
  tasks: Task[];
}

export interface ChatMessage {
  id: string;
  user: string; // For MVP, user-entered name
  text: string;
  timestamp: number; // Unix timestamp
}
