export interface ScriptCanvasProps {
  className?: string
}

export function ScriptCanvas({ className = '' }: ScriptCanvasProps) {
  return (
    <section
      className={`relative overflow-auto ${className}`}
      aria-label="Script canvas"
      style={{
        backgroundColor: '#F9F7F3',
        backgroundImage:
          'radial-gradient(circle, #D4D2CE 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="flex h-full items-center justify-center">
        <p className="select-none rounded-lg bg-white/80 px-6 py-4 text-center font-inter text-sm text-app-secondaryText shadow-sm">
          Drag blocks here or ask Cosmo to help!
        </p>
      </div>
    </section>
  )
}
