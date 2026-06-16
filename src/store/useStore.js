import { create } from 'zustand'

export const useStore = create((set) => ({
  user: null,
  profile: null,
  darkMode: localStorage.getItem('darkMode') === 'true',
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode
      localStorage.setItem('darkMode', next)
      if (next) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      return { darkMode: next }
    }),
  initDarkMode: () => {
    const dm = localStorage.getItem('darkMode') === 'true'
    if (dm) document.documentElement.classList.add('dark')
  },
}))
