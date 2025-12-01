import React from 'react';

function CourseSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20 animate-pulse">
      
      {/* Hero Section Skeleton */}
      <div className="bg-slate-900 pt-12 pb-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-64 bg-slate-800 rounded mb-8"></div>
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3">
              <div className="h-12 w-3/4 bg-slate-800 rounded mb-6"></div>
              <div className="h-4 w-full bg-slate-800 rounded mb-3"></div>
              <div className="h-4 w-5/6 bg-slate-800 rounded mb-8"></div>
              
              <div className="flex gap-6">
                <div className="h-8 w-32 bg-slate-800 rounded-full"></div>
                <div className="h-8 w-40 bg-slate-800 rounded-full"></div>
                <div className="h-8 w-40 bg-slate-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column Skeleton */}
          <div className="lg:w-2/3 space-y-8">
            {/* What you'll learn */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0"></div>
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton (Sidebar) */}
          <div className="lg:w-1/3 relative">
            <div className="sticky top-24 lg:-mt-64 z-30">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800"></div>
                <div className="p-8 space-y-6">
                  <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  <div className="space-y-3 pt-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CourseSkeleton;