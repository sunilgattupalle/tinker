import { blankProject, petSimProject, quizGameProject, storyChoicesProject } from './projects'

export interface TemplateConfig {
  id: string
  name: string
  description: string
  icon: string
  color: string
  buildProject: () => string
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start fresh with the Scratch Cat',
    icon: '✨',
    color: '#4C6EF5',
    buildProject: blankProject,
  },
  {
    id: 'pet-sim',
    name: 'Pet Simulator',
    description: 'Move a cat around with arrow keys',
    icon: '🐱',
    color: '#4C97FF',
    buildProject: petSimProject,
  },
  {
    id: 'quiz-game',
    name: 'Quiz Game',
    description: 'A sprite asks questions and checks answers',
    icon: '❓',
    color: '#FFBF00',
    buildProject: quizGameProject,
  },
  {
    id: 'story-choices',
    name: 'Story with Choices',
    description: 'An interactive story with branching paths',
    icon: '📖',
    color: '#9966FF',
    buildProject: storyChoicesProject,
  },
]

export async function loadTemplate(
  templateId: string,
  loadProject: (data: ArrayBuffer | string) => Promise<void>,
): Promise<void> {
  const template = TEMPLATES.find((t) => t.id === templateId)
  if (!template) throw new Error(`Unknown template: ${templateId}`)
  const json = template.buildProject()
  await loadProject(json)
}
