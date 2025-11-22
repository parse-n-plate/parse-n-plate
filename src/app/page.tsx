'use client';

import SearchForm from '@/components/ui/search-form';
import RecentRecipesList from '@/components/RecentRecipesList';
import HomepageSkeleton from '@/components/ui/homepage-skeleton';
import ErrorDisplay from '@/components/ui/error-display';
import CategoryFilters from '@/components/ui/category-filters';
import TrendingRecipesSection from '@/components/ui/trending-recipes-section';
import FooterBanner from '@/components/ui/footer-banner';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useParsedRecipes } from '@/contexts/ParsedRecipesContext';

function HomeContent() {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Asian');
  const { isLoaded } = useParsedRecipes();
  const searchParams = useSearchParams();
  const [initialUrl, setInitialUrl] = useState('');

  // Handle URL parameter from navbar
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setInitialUrl(urlParam);
    }
  }, [searchParams]);

  const handleRetry = () => {
    setError(false);
    setErrorMessage('');
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  if (!isLoaded) {
    return <HomepageSkeleton />;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="transition-opacity duration-300 ease-in-out opacity-100">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-8 pt-16 pb-12">
          <div className="text-center mb-8">
            {/* Hero Headline */}
            <h1 className="font-domine text-[48px] md:text-[64px] text-black leading-[1.1] mb-4">
              Clean recipes,
              <br />
              fast cooking.
            </h1>
            {/* Hero Subtitle */}
            <p className="font-albert text-[16px] md:text-[18px] text-stone-700 leading-[1.5] mb-8">
              Spend less time on ad-filled recipes and more time cooking.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="bg-black hover:bg-gray-800 text-white font-albert text-[16px] px-8 py-3 rounded-lg transition-colors duration-200">
                Sign In
              </button>
              <button className="bg-black hover:bg-gray-800 text-white font-albert text-[16px] px-8 py-3 rounded-lg transition-colors duration-200">
                Get Started
              </button>
            </div>

            {/* Search Form */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchForm
                setErrorAction={setError}
                setErrorMessage={setErrorMessage}
                initialUrl={initialUrl}
              />

              {/* Error Display - positioned below search input */}
              {error && errorMessage && (
                <div className="mt-5">
                  <ErrorDisplay message={errorMessage} onRetry={handleRetry} />
                </div>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-12">
            <CategoryFilters
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Trending Recipes Section */}
          <div className="mb-16">
            <TrendingRecipesSection category={selectedCategory} />
          </div>

          {/* Recent Recipes Section (Keep existing functionality) */}
          <div className="space-y-4 mb-16">
            <h2 className="font-domine text-[20px] text-black leading-none">
              Recipes you&apos;ve parsed
            </h2>
            <RecentRecipesList />
          </div>
        </div>

        {/* Footer Banner */}
        <FooterBanner />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomepageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
