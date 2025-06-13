"use client";

import type { Task, Priority } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, MinusCircle, ArrowDownCircle, CircleSlash, User, CalendarDays, Brain, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { suggestTaskPriority, type SuggestTaskPriorityInput } from '@/ai/flows/suggest-task-priority';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface KanbanTaskProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onUpdateTaskPriority: (taskId: string, priority: Priority) => void;
}

const PriorityIcon = ({ priority }: { priority: Priority }) => {
  switch (priority) {
    case 'High':
      return <Flame className="h-5 w-5 text-destructive" aria-label="High priority" />;
    case 'Medium':
      return <MinusCircle className="h-5 w-5 text-accent" aria-label="Medium priority" />;
    case 'Low':
      return <ArrowDownCircle className="h-5 w-5 text-primary" aria-label="Low priority" />;
    default:
      return <CircleSlash className="h-5 w-5 text-muted-foreground" aria-label="No priority" />;
  }
};

export default function KanbanTask({ task, onDragStart, onUpdateTaskPriority }: KanbanTaskProps) {
  const [isLoadingAISuggestion, setIsLoadingAISuggestion] = useState(false);
  const [aiSuggestion, setAISuggestion] = useState<string | null>(null);
  const [showSuggestionAlert, setShowSuggestionAlert] = useState(false);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    onDragStart(e, task.id);
  };

  const handleSuggestPriority = async () => {
    if (!task.deadline) {
      toast({
        title: "Missing Deadline",
        description: "Please set a deadline for the task to get an AI priority suggestion.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingAISuggestion(true);
    setAISuggestion(null);
    try {
      const input: SuggestTaskPriorityInput = {
        taskDescription: task.title + (task.description ? `\n${task.description}` : ''),
        deadline: task.deadline,
        currentDate: new Date().toISOString().split('T')[0],
      };
      const result = await suggestTaskPriority(input);
      setAISuggestion(result.prioritySuggestion);
      setShowSuggestionAlert(true);
    } catch (error) {
      console.error("Error suggesting priority:", error);
      toast({
        title: "AI Error",
        description: "Could not get priority suggestion from AI.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAISuggestion(false);
    }
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      const suggestedPriority = aiSuggestion.split(' ')[0] as Priority; // e.g. "High", "Medium", "Low"
      if (['High', 'Medium', 'Low', 'None'].includes(suggestedPriority)) {
        onUpdateTaskPriority(task.id, suggestedPriority);
        toast({
          title: "Priority Updated",
          description: `Task priority set to ${suggestedPriority} based on AI suggestion.`,
        });
      } else {
         toast({
          title: "Invalid Suggestion",
          description: "AI suggestion was not a valid priority.",
          variant: "destructive",
        });
      }
    }
    setAISuggestion(null);
    setShowSuggestionAlert(false);
  };

  return (
    <>
      <Card
        draggable
        onDragStart={handleDragStart}
        className="mb-4 bg-card text-card-foreground shadow-lg rounded-lg cursor-grab active:cursor-grabbing"
        aria-label={`Task: ${task.title}, Priority: ${task.priority}, Status: ${task.status}`}
        tabIndex={0}
      >
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base font-semibold font-headline break-words">{task.title}</CardTitle>
            <PriorityIcon priority={task.priority} />
          </div>
          {task.description && (
            <CardDescription className="text-xs mt-1 break-words">{task.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0 text-xs">
          {task.assignee && (
            <div className="flex items-center text-muted-foreground mb-1">
              <User className="h-3.5 w-3.5 mr-1.5" />
              <span>{task.assignee}</span>
            </div>
          )}
          {task.deadline && (
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              <span>{task.deadline}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
           <Badge variant={
             task.priority === 'High' ? 'destructive' :
             task.priority === 'Medium' ? 'secondary' : // Using secondary for medium as accent is orange
             task.priority === 'Low' ? 'default' : // Using default (primary) for low as it's blue
             'outline'
           } className="text-xs capitalize">
            {task.priority}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSuggestPriority}
            disabled={isLoadingAISuggestion}
            className="text-xs text-primary hover:bg-primary/10"
            aria-label="Suggest priority using AI"
          >
            <Brain className="h-4 w-4 mr-1" />
            {isLoadingAISuggestion ? 'Thinking...' : 'AI Priority'}
          </Button>
        </CardFooter>
      </Card>

      {showSuggestionAlert && aiSuggestion && (
         <AlertDialog open={showSuggestionAlert} onOpenChange={setShowSuggestionAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline flex items-center"><Brain className="h-5 w-5 mr-2 text-primary"/>AI Priority Suggestion</AlertDialogTitle>
              <AlertDialogDescription>
                {aiSuggestion}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setAISuggestion(null); setShowSuggestionAlert(false); }}>
                <ThumbsDown className="h-4 w-4 mr-1"/> Ignore
              </AlertDialogCancel>
              <AlertDialogAction onClick={applyAISuggestion} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                 <ThumbsUp className="h-4 w-4 mr-1"/> Apply Suggestion
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
