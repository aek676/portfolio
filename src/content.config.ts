import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import type { Tag } from "@/types";

const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.mdx", base: "./src/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    tags: z.array(z.custom<Tag>()),
  }),
});

export const collections = {
  projects,
};
