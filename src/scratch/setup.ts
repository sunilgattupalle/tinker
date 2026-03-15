import VirtualMachine from 'scratch-vm'
import { setVM } from './blockAdapter'

let vmInstance: VirtualMachine | null = null

export function initializeScratchVM(): VirtualMachine {
  if (!vmInstance) {
    vmInstance = new VirtualMachine()
    setVM(vmInstance)
  }

  return vmInstance
}

export function getVM(): VirtualMachine | null {
  return vmInstance
}
