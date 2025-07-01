import Link from 'next/link'
import { Camera, Sparkles, Zap, Shield, ArrowRight, Star } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center mb-6">
              <Camera className="h-16 w-16 text-primary" />
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              Create Beautiful{" "}
              <span className="text-primary">App Screenshots</span>{" "}
              in Minutes
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional app store screenshots with stunning mockups, templates, and effects. 
              No design experience required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/editor">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/dashboard">
                  View Templates
                </Link>
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                ))}
              </div>
              <span>Loved by 10,000+ developers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Everything you need to create stunning screenshots
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful tools and beautiful templates to make your app stand out in the store
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Templates</h3>
              <p className="text-muted-foreground">
                Choose from hundreds of professionally designed templates for iOS, Android, and web apps
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Create beautiful screenshots in minutes with our intuitive drag-and-drop editor
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">High Quality</h3>
              <p className="text-muted-foreground">
                Export in high resolution with perfect formatting for all app stores
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Ready to create amazing screenshots?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of developers who trust us with their app store presence
            </p>
            
            <Button 
              asChild 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8"
            >
              <Link href="/editor">
                Start Creating Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Camera className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">App Screenshot Maker</span>
            </div>
            
            <p className="text-muted-foreground text-sm">
              © 2024 App Screenshot Maker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
