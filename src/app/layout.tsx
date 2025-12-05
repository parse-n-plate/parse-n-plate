import React from 'react';
import type { Metadata } from 'next';
import { Domine, Albert_Sans } from 'next/font/google';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/ui/Navbar';
import { RecipeProvider } from '@/contexts/RecipeContext';
import { ParsedRecipesProvider } from '@/contexts/ParsedRecipesContext';
import './globals.css';

// Default fonts: Domine for headings (serif), Albert Sans for body (sans-serif)
const domine = Domine({
  variable: '--font-domine',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const albertSans = Albert_Sans({
  variable: '--font-albert',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Parse and Plate',
  description: 'Ad free recipes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${domine.variable} ${albertSans.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <RecipeProvider>
          <ParsedRecipesProvider>
            <Navbar />
            <Separator />
            {children}
            {/* Admin Access Button - Bottom Right */}
            <Link
              href="/admin/debug-parser"
              className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 text-sm font-medium flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Admin
            </Link>
          </ParsedRecipesProvider>
        </RecipeProvider>
      </body>
    </html>
  );
}
