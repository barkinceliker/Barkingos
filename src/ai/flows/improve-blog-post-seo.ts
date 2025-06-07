// src/ai/flows/improve-blog-post-seo.ts
'use server';
/**
 * @fileOverview AI-powered tool to improve blog post SEO and writing quality.
 *
 * - improveBlogPostSeo - A function that enhances blog posts using AI.
 * - ImproveBlogPostSeoInput - The input type for the improveBlogPostSeo function.
 * - ImproveBlogPostSeoOutput - The return type for the improveBlogPostSeo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveBlogPostSeoInputSchema = z.object({
  blogPostContent: z
    .string()
    .describe('The content of the blog post to be improved.'),
  targetKeywords: z
    .string()
    .describe(
      'A comma-separated list of target keywords for SEO optimization.'
    ),
  currentCategory: z
    .string()
    .describe('Current category the blog post belongs to.'),
});
export type ImproveBlogPostSeoInput = z.infer<typeof ImproveBlogPostSeoInputSchema>;

const ImproveBlogPostSeoOutputSchema = z.object({
  improvedContent: z
    .string()
    .describe('The improved content of the blog post.'),
  suggestedCategories: z
    .string()
    .array()
    .describe('Suggested categories for the blog post.'),
  seoScore: z
    .number()
    .describe('The SEO score of the improved blog post.'),
});
export type ImproveBlogPostSeoOutput = z.infer<typeof ImproveBlogPostSeoOutputSchema>;

export async function improveBlogPostSeo(input: ImproveBlogPostSeoInput): Promise<ImproveBlogPostSeoOutput> {
  return improveBlogPostSeoFlow(input);
}

const improveBlogPostSeoPrompt = ai.definePrompt({
  name: 'improveBlogPostSeoPrompt',
  input: {schema: ImproveBlogPostSeoInputSchema},
  output: {schema: ImproveBlogPostSeoOutputSchema},
  prompt: `You are an expert blog post optimizer. Improve the writing quality and SEO score of the following blog post content.

Blog Post Content: {{{blogPostContent}}}

Target Keywords: {{{targetKeywords}}}

Current Category: {{{currentCategory}}}


Provide improved content, suggest alternative categories, and provide an SEO score out of 100.

Output in JSON format:
{
  "improvedContent": "...",
  "suggestedCategories": ["..."],
  "seoScore": 0
}
`,
});

const improveBlogPostSeoFlow = ai.defineFlow(
  {
    name: 'improveBlogPostSeoFlow',
    inputSchema: ImproveBlogPostSeoInputSchema,
    outputSchema: ImproveBlogPostSeoOutputSchema,
  },
  async input => {
    const {output} = await improveBlogPostSeoPrompt(input);
    return output!;
  }
);
