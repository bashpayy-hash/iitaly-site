"use client";
import { MediaSwitcher, useStoryLocation, type StoryItem } from "@/components/story/MediaSwitcher";
import type { StorySubject } from "@/components/story/StoryArtwork";
import type { ReactNode } from "react";

export type GuidePointRow = { label: string; value: string; content?: ReactNode; short?: string; locked?: boolean; art?: StoryItem["art"] };

/** Пункты темы на пути-прогрессе (owner, 10 Nov): остановки вместо пилюль. */
export function GuidePointSwitcher({ rows, subject, endAction, caption }: { rows: GuidePointRow[]; subject: StorySubject; endAction?: ReactNode; caption?: ReactNode }) {
  const { index, href, select } = useStoryLocation("point", rows.length);
  return <MediaSwitcher nav="path" pathCaption={caption} items={rows.map((row, position) => ({ id:String(position), title:row.label, text:row.value, subject, content:row.content, short:row.short, locked:row.locked, art:row.art }))} index={index} onSelect={select} href={href} progressLabel="Пункт" label="Пункты гайда" lastAction={endAction} />;
}
