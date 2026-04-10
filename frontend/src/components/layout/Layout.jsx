import Header from './Header'
import Footer from './Footer'

export default function Layout({ children, fluid = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className={fluid
        ? 'flex-1 flex flex-col overflow-hidden'
        : 'flex-1 max-w-5xl mx-auto w-full px-4 py-10'
      }>
        {children}
      </main>
      <Footer />
    </div>
  )
}
