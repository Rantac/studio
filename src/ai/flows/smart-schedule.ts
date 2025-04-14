'use server';
/**
 * @fileOverview A smart scheduling AI agent that suggests when tasks should be scheduled based on task description and the current day of the week.
 *
 * - suggestSchedule - A function that handles the schedule suggestion process.
 * - SuggestScheduleInput - The input type for the suggestSchedule function.
 * - SuggestScheduleOutput - The return type for the suggestSchedule function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getDayOfWeek, DayOfWeek} from '@/services/date';

const SuggestScheduleInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task.'),
});
export type SuggestScheduleInput = z.infer<typeof SuggestScheduleInputSchema>;

const SuggestScheduleOutputSchema = z.object({
  suggestedSchedule: z.string().describe('The suggested schedule for the task.'),
});
export type SuggestScheduleOutput = z.infer<typeof SuggestScheduleOutputSchema>;

export async function suggestSchedule(input: SuggestScheduleInput): Promise<SuggestScheduleOutput> {
  return suggestScheduleFlow(input);
}

const dayOfWeekTool = ai.defineTool({
  name: 'getDayOfWeek',
  description: 'Get the current day of the week.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    day: z.string().describe('The current day of the week.'),
  }),
},
async () => {
  const dayOfWeek: DayOfWeek = await getDayOfWeek();
  return {day: dayOfWeek.day};
});

const prompt = ai.definePrompt({
  name: 'suggestSchedulePrompt',
  input: {
    schema: z.object({
      taskDescription: z.string().describe('The description of the task.'),
      currentDay: z.string().describe('The current day of the week.'),
    }),
  },
  output: {
    schema: z.object({
      suggestedSchedule: z.string().describe('The suggested schedule for the task.'),
    }),
  },
  prompt: `You are a scheduling assistant. Given the task description and the current day of the week, suggest when the task should be scheduled. Consider the current day when suggesting when to schedule the task.

Task Description: {{{taskDescription}}}
Current Day: {{{currentDay}}}

Suggested Schedule: `,
});

const suggestScheduleFlow = ai.defineFlow<
  typeof SuggestScheduleInputSchema,
  typeof SuggestScheduleOutputSchema
>({
  name: 'suggestScheduleFlow',
  inputSchema: SuggestScheduleInputSchema,
  outputSchema: SuggestScheduleOutputSchema,
}, async input => {
  const currentDayResult = await dayOfWeekTool({});
  const {output} = await prompt({
    taskDescription: input.taskDescription,
    currentDay: currentDayResult.day,
  });
  return output!;
});
