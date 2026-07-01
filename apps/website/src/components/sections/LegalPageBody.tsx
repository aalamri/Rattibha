import type { LegalPageContent } from '@/content/legalPages';

/** Shared body for the six legal/policy pages (Privacy, Terms, Refund,
 * Cancellation, Dispute Resolution, Planner Verification) — a plain Server
 * Component, since this content is entirely static with no interactivity. */
export function LegalPageBody({ content, lastUpdated }: { content: LegalPageContent; lastUpdated: string }) {
  return (
    <div className="mx-auto max-w-[760px] px-5 py-14 sm:px-10">
      <h1 className="font-display text-[34px] font-semibold text-fg1 sm:text-[40px]">{content.title}</h1>
      <p className="mt-2 text-[13px] text-fg3">{lastUpdated}</p>
      <p className="mt-5 text-[15.5px] leading-[1.65] text-fg2">{content.intro}</p>
      <div className="mt-8 flex flex-col gap-7">
        {content.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-display text-[19px] font-semibold text-fg1">{section.heading}</h2>
            <p className="mt-2 text-[15px] leading-[1.65] text-fg2">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
