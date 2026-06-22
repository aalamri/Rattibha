export function StepHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5.5">
      <h2 className="font-display text-[26px] font-semibold leading-tight text-fg1">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-fg2">{subtitle}</p>
    </div>
  );
}
