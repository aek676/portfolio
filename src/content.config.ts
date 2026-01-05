import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import type { Tag } from "@/types";

const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.mdx", base: "./src/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      image: image(),
      tags: z.array(z.custom<Tag>()),
      github: z.string().url(),
      demo: z.string().url().optional(),
    }),
});

export const collections = {
  projects,
};
