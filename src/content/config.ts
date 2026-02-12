import { defineCollection, z } from "astro:content";

const announcements = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});

const events = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(),
  }),
});

export const collections = { announcements, events };
