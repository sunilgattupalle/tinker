import type VirtualMachine from 'scratch-vm'

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'my-project'
}

export async function exportProject(vm: VirtualMachine, projectName: string): Promise<void> {
  const blob = await vm.saveProjectSb3()
  const filename = `${sanitizeFilename(projectName)}.sb3`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
