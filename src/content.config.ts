import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/projects' }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = {
  projects,
};
