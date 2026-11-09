"use client";
import { MediaSwitcher, useStoryLocation } from "@/components/story/MediaSwitcher";
import type { StorySubject } from "@/components/story/StoryArtwork";
import type { ReactNode } from "react";

export function GuidePointSwitcher({ rows, subject, endAction }: { rows: { label: string; value: string; content?: ReactNode }[]; subject: StorySubject; endAction?: ReactNode }) {
  const { index, href, select } = useStoryLocation("point", rows.length);
  return <MediaSwitcher items={rows.map((row, position) => ({ id:String(position), title:row.label, text:row.value, subject, content:row.content }))} index={index} onSelect={select} href={href} progressLabel="Пункт" label="Пункты гайда" lastAction={endAction} />;
}
