import { TEMPLATES, type TemplateInfo } from "@/templates";
import { hasSavedProject } from "@/utils";

interface WelcomeProps {
  onSelectTemplate: (id: string) => void;
  onBlankProject: () => void;
  onContinue: () => void;
}

export function Welcome({ onSelectTemplate, onBlankProject, onContinue }: WelcomeProps) {
  const savedExists = hasSavedProject();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app-bg px-4 py-12">
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-cosmo font-display text-3xl font-bold text-white">
        C
      </div>
      <h1 className="mb-1 font-display text-4xl font-bold text-accent">
        Tinker
      </h1>
      <p className="mb-8 font-display text-lg text-text-secondary">
        What do you want to make?
      </p>

      <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {TEMPLATES.map((tmpl) => (
          <TemplateCard
            key={tmpl.id}
            template={tmpl}
            onSelect={() => onSelectTemplate(tmpl.id)}
          />
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onBlankProject}
          className="rounded-button border border-panel-border bg-panel-bg px-5 py-2.5 font-ui text-sm font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
        >
          Blank project
        </button>
        {savedExists && (
          <button
            onClick={onContinue}
            className="rounded-button bg-accent px-5 py-2.5 font-ui text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Continue saved project
          </button>
        )}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: TemplateInfo;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="group flex flex-col items-center rounded-xl border border-panel-border bg-panel-bg p-6 text-center transition-all hover:border-accent hover:shadow-lg"
    >
      <span className="mb-3 text-4xl">{template.icon}</span>
      <h3 className="mb-1 font-display text-base font-bold text-text-primary group-hover:text-accent">
        {template.name}
      </h3>
      <p className="mb-4 font-ui text-xs text-text-secondary">
        {template.description}
      </p>
      <span className="rounded-button bg-accent/10 px-3 py-1 font-ui text-xs font-medium text-accent group-hover:bg-accent group-hover:text-white">
        Start
      </span>
    </button>
  );
}
