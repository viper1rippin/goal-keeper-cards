
import * as z from 'zod';

export const timelineItemFormSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  row: z.number(),
  start: z.number(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  progress: z.number().min(0).max(100),
  duration: z.number().optional(),
});

export type TimelineItemFormValues = z.infer<typeof timelineItemFormSchema>;
