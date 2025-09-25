import React from 'react';

function CourseSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 py-12 px-4 sm:px-8 lg:px-16 mt-16 animate-pulse">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Main Content Skeleton */}
        <div className="flex-1">
          <div className="bg-neutral-800 rounded-3xl p-8 mb-6 shadow-xl">
            <div className="h-6 w-24 bg-neutral-700 rounded mb-6"></div>
            <div className="aspect-[16/9] bg-neutral-700 rounded-2xl mb-6"></div>
            <div className="h-8 w-3/4 bg-neutral-700 rounded mb-3"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-neutral-700"></div>
              <div>
                <div className="h-4 w-32 bg-neutral-700 rounded mb-2"></div>
                <div className="h-4 w-48 bg-neutral-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-neutral-700 rounded"></div>
              <div className="h-4 w-11/12 bg-neutral-700 rounded"></div>
              <div className="h-4 w-10/12 bg-neutral-700 rounded"></div>
            </div>
          </div>
          <div className="bg-neutral-800 rounded-3xl p-8 mb-6 shadow-xl">
            <div className="h-6 w-1/3 bg-neutral-700 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-neutral-700 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-neutral-800 rounded-3xl p-8 mb-6 shadow-xl">
            <div className="h-6 w-1/4 bg-neutral-700 rounded mb-6"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-neutral-700 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-neutral-800 rounded-3xl p-8 shadow-xl">
            <div className="h-6 w-1/3 bg-neutral-700 rounded mb-4"></div>
            <div className="divide-y divide-neutral-700">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-4">
                  <div className="h-6 w-1/2 bg-neutral-700 rounded"></div>
                  <div className="h-6 w-6 bg-neutral-700 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="md:w-1/3 w-full">
          <div className="bg-neutral-800 rounded-3xl shadow-xl p-8 border border-neutral-700">
            <div className="aspect-[16/9] bg-neutral-700 rounded-2xl mb-6"></div>
            <div className="h-8 w-2/3 bg-neutral-700 rounded mb-2"></div>
            <div className="h-4 w-1/4 bg-neutral-700 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-emerald-700 rounded-xl"></div>
              <div className="h-12 bg-purple-900 rounded-xl"></div>
              <div className="h-12 bg-neutral-700 rounded-xl"></div>
            </div>
            <div className="h-4 w-1/2 mx-auto bg-neutral-700 rounded mt-6"></div>
            <div className="mt-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-neutral-700 rounded"></div>
                  <div className="h-4 w-full bg-neutral-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseSkeleton;