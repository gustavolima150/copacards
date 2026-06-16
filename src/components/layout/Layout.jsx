import { Navbar } from './Navbar'

export function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="md:pl-64 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
