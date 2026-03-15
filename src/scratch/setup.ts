import VirtualMachine from 'scratch-vm'

let vmInstance: VirtualMachine | null = null

export function initializeScratchVM(): VirtualMachine {
  if (!vmInstance) {
    vmInstance = new VirtualMachine()
  }

  return vmInstance
}
