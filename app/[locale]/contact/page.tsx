import { PageTitle } from '@/components/PageTitle'
import { ContactForm } from './components/ContactForm'
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Vismaya Kalike. We\'d love to hear from you.',
}

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageTitle title="Contact Us" />

      <div className="space-y-16">
        <section className="space-y-4">
          <p className="text-lg leading-relaxed">
            Whether you&apos;re interested in volunteering, partnering with us, setting up learning
            centres, or just want to learn more about Vismaya Kalike — we&apos;d love to hear from you.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details */}
          <section className="space-y-6">
            <h2 className="text-2xl text-foreground">Get in Touch</h2>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a
                    href="mailto:srilakshmi@vismayakalike.org"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    srilakshmi@vismayakalike.org
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <a
                    href="tel:+919611186384"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +91 96111 86384
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-medium">WhatsApp Channel</p>
                  <a
                    href="https://whatsapp.com/channel/0029VbAybnNAu3aGQu3CNI3Q"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Follow us on WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Office Address</p>
                  <p className="text-sm text-muted-foreground">
                    Heera Foundation<br />
                    842, Second Cross, HAL Second Stage<br />
                    Bangalore 560008
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="space-y-6">
            <h2 className="text-2xl text-foreground">Send us a Message</h2>
            <ContactForm />
          </section>
        </div>
      </div>
    </div>
  )
}
