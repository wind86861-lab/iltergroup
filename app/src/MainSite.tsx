import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import WhyUs from './components/sections/WhyUs'
import Catalog from './components/sections/Catalog'
import WholesaleBanner from './components/sections/WholesaleBanner'
import HowWeWork from './components/sections/HowWeWork'
import ContactForm from './components/sections/ContactForm'
import Partners from './components/sections/Partners'

export default function MainSite() {
  return (
    <div className="min-h-screen bg-surface font-body">
      <Navbar />
      <main>
        <Hero />
        <WhyUs />
        <Catalog />
        <WholesaleBanner />
        <HowWeWork />
        <ContactForm />
        <Partners />
      </main>
      <Footer />
    </div>
  )
}
