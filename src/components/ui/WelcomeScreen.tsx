import { useState } from 'react'
import { useUIStore } from '@/store/ui'
import { useProjectStore } from '@/store/project'
import { TEMPLATES, loadTemplate } from '@/templates/templates'

export function WelcomeScreen() {
  const showWelcome = useUIStore((s) => s.showWelcome)
  const dismissWelcome = useUIStore((s) => s.dismissWelcome)
  const loadProject = useProjectStore((s) => s.loadProject)
  const [loading, setLoading] = useState<string | null>(null)

  if (!showWelcome) return null

  const handleSelect = async (templateId: string) => {
    setLoading(templateId)
    try {
      await loadTemplate(templateId, loadProject)
    } catch (err) {
      console.error('Failed to load template:', err)
    } finally {
      setLoading(null)
      dismissWelcome()
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="w-full max-w-2xl px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-app-primary to-indigo-500 text-2xl font-bold text-white shadow-lg">
            T
          </div>
          <h1 className="font-nunito text-4xl font-bold text-app-text">
            What do you want to make?
          </h1>
          <p className="mt-2 font-inter text-lg text-app-secondaryText">
            Pick a starter project or begin from scratch
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => void handleSelect(template.id)}
              disabled={loading !== null}
              className="group relative flex flex-col items-center rounded-2xl border-2 border-transparent bg-white p-6 shadow-sm transition-all hover:border-app-primary/30 hover:shadow-lg disabled:opacity-60"
            >
              {loading === template.id && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-app-primary border-t-transparent" />
                </div>
              )}
              <div
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl text-3xl shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${template.color}15` }}
              >
                {template.icon}
              </div>
              <h3 className="font-nunito text-base font-bold text-app-text">
                {template.name}
              </h3>
              <p className="mt-1 text-center font-inter text-xs text-app-secondaryText">
                {template.description}
              </p>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center font-inter text-xs text-app-secondaryText/60">
          Powered by Scratch VM — projects work in Scratch too!
        </p>
      </div>
    </div>
  )
}
