export const colorVariants: Record<string, string> = {
  blue: 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
  cyan: 'bg-cyan-100 border-cyan-200 text-cyan-800 dark:bg-cyan-900/30 dark:border-cyan-800 dark:text-cyan-300',
  orange:
    'bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-300',
  purple:
    'bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300',
  green:
    'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300',
  slate:
    'bg-slate-100 border-slate-200 text-slate-800 dark:bg-slate-900/30 dark:border-slate-800 dark:text-slate-300',
  sky: 'bg-sky-100 border-sky-200 text-sky-800 dark:bg-sky-900/30 dark:border-sky-800 dark:text-sky-300',
  indigo:
    'bg-indigo-100 border-indigo-200 text-indigo-800 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300',
  yellow:
    'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300',
  violet:
    'bg-violet-100 border-violet-200 text-violet-800 dark:bg-violet-900/30 dark:border-violet-800 dark:text-violet-300',
};

export const TAGS = {
  typescript: {
    name: 'Typescript',
    color: colorVariants.indigo,
    icon: 'mdi:language-typescript',
  },
  astro: {
    name: 'Astro',
    color: colorVariants.orange,
    icon: 'devicon-plain:astro',
  },
  react: {
    name: 'React',
    color: colorVariants.blue,
    icon: 'mdi:react',
  },
  docker: {
    name: 'Docker',
    color: colorVariants.sky,
    icon: 'mdi:docker',
  },
  python: {
    name: 'Python',
    color: colorVariants.yellow,
    icon: 'mdi:language-python',
  },
  terraform: {
    name: 'Terraform',
    color: colorVariants.violet,
    icon: 'mdi:terraform',
  },
  rust: {
    name: 'Rust',
    color: colorVariants.orange,
    icon: 'mdi:language-rust',
  },
} as const;

export type TagKey = keyof typeof TAGS;
