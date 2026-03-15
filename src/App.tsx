import { useEffect } from 'react'
import { initializeScratchVM } from '@/scratch/setup'

export function App() {
  useEffect(() => {
    const vm = initializeScratchVM()
    console.info('scratch-vm loaded, targets:', vm.runtime.targets.length)
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-app-background">
      <h1 className="font-nunito text-5xl font-bold text-app-primary">Tinker</h1>
    </main>
  )
}
