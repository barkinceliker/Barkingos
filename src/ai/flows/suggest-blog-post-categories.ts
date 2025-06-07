'use server';
/**
 * @fileOverview Suggests relevant topic categories for a blog post.
 *
 * - suggestBlogPostCategories - A function that suggests topic categories for a blog post.
 * - SuggestBlogPostCategoriesInput - The input type for the suggestBlogPostCategories function.
 * - SuggestBlogPostCategoriesOutput - The return type for the suggestBlogPostCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBlogPostCategoriesInputSchema = z.object({
  blogPostContent: z.string().describe('The content of the blog post.'),
});
export type SuggestBlogPostCategoriesInput = z.infer<
  typeof SuggestBlogPostCategoriesInputSchema
>;

const SuggestBlogPostCategoriesOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe('An array of relevant topic categories for the blog post.'),
});
export type SuggestBlogPostCategoriesOutput = z.infer<
  typeof SuggestBlogPostCategoriesOutputSchema
>;

export async function suggestBlogPostCategories(
  input: SuggestBlogPostCategoriesInput
): Promise<SuggestBlogPostCategoriesOutput> {
  return suggestBlogPostCategoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBlogPostCategoriesPrompt',
  input: {schema: SuggestBlogPostCategoriesInputSchema},
  output: {schema: SuggestBlogPostCategoriesOutputSchema},
  prompt: `You are an expert blog post categorizer.

  Given the following blog post content, suggest 3-5 relevant topic categories.

  Blog Post Content: {{{blogPostContent}}}

  Categories:`,
});

const suggestBlogPostCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestBlogPostCategoriesFlow',
    inputSchema: SuggestBlogPostCategoriesInputSchema,
    outputSchema: SuggestBlogPostCategoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
