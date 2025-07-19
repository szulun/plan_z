import type { Metadata } from 'next'
import { Inter, Poppins, Playfair_Display, JetBrains_Mono, Dancing_Script, Montserrat, Great_Vibes, LXGW_WenKai_TC } from 'next/font/google'
import './globals.css'
import { Parisienne } from 'next/font/google';
import { Homemade_Apple } from 'next/font/google';
import { Sacramento } from 'next/font/google';
import Head from 'next/head';

const dancing = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing',
  weight: ['400', '700'],
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '700'],
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  variable: '--font-greatvibes',
  weight: ['400'],
  display: 'swap',
});

const parisienne = Parisienne({
  subsets: ['latin'],
  variable: '--font-parisienne',
  weight: ['400'],
  display: 'swap',
});

const homemadeApple = Homemade_Apple({
  subsets: ['latin'],
  variable: '--font-homemadeapple',
  weight: ['400'],
  display: 'swap',
});

const sacramento = Sacramento({
  subsets: ['latin'],
  variable: '--font-sacramento',
  weight: ['400'],
  display: 'swap',
});

const wenkai = LXGW_WenKai_TC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-wenkai',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Plan B Portfolio',
  description: 'A clean and beautiful investment tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${wenkai.variable} ${sacramento.variable} ${homemadeApple.variable} ${greatVibes.variable} ${dancing.variable} ${montserrat.variable} ${inter.variable} ${poppins.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>
      <body className="font-sans antialiased bg-gradient-to-br from-slate-50 to-gray-100" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
} 