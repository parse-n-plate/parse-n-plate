import React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Domine, Albert_Sans } from 'next/font/google';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/ui/Navbar';
import { RecipeProvider } from '@/contexts/RecipeContext';
import { ParsedRecipesProvider } from '@/contexts/ParsedRecipesContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const domine = Domine({
  variable: '--font-domine',
  subsets: ['latin'],
});

const albertSans = Albert_Sans({
  variable: '--font-albert',
  subsets: ['latin'],
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
        className={`${geistSans.variable} ${geistMono.variable} ${domine.variable} ${albertSans.variable} antialiased`}
      >
        <RecipeProvider>
          <ParsedRecipesProvider>
            <Navbar />
            <Separator />
            {children}
          </ParsedRecipesProvider>
        </RecipeProvider>
      </body>
    </html>
  );
}
