import { useEffect, useRef } from 'react';
import {
  trackSectionView,
  trackButtonClick,
  trackLinkClick,
  trackScrollDepth,
  trackTimeOnSection,
  isGAEnabled,
} from '../lib/analytics';

/**
 * Hook to track when a section comes into view
 * @param sectionId - The ID of the section
 * @param sectionName - Optional human-readable name
 * @param enabled - Whether tracking is enabled (default: true)
 */
export const useSectionTracking = (
  sectionId: string,
  sectionName?: string,
  enabled: boolean = true
): void => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!enabled || !isGAEnabled() || hasTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            trackSectionView(sectionId, sectionName);
            hasTracked.current = true;
          }
        });
      },
      {
        threshold: 0.5, // Track when 50% of section is visible
      }
    );

    const element = document.getElementById(sectionId);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [sectionId, sectionName, enabled]);
};

/**
 * Hook to track scroll depth on a page
 * @param enabled - Whether tracking is enabled (default: true)
 */
export const useScrollDepthTracking = (enabled: boolean = true): void => {
  const trackedDepths = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled || !isGAEnabled()) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Track at 25%, 50%, 75%, and 100%
      [25, 50, 75, 100].forEach((depth) => {
        if (scrollPercentage >= depth && !trackedDepths.current.has(depth)) {
          trackScrollDepth(depth);
          trackedDepths.current.add(depth);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled]);
};

/**
 * Hook to track time spent in a section
 * @param sectionId - The ID of the section
 * @param enabled - Whether tracking is enabled (default: true)
 */
export const useTimeOnSectionTracking = (
  sectionId: string,
  enabled: boolean = true
): void => {
  const startTime = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !isGAEnabled()) return;

    const element = document.getElementById(sectionId);
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Section entered viewport
            startTime.current = Date.now();
            
            // Track time every 10 seconds while in view
            intervalRef.current = setInterval(() => {
              if (startTime.current) {
                const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
                trackTimeOnSection(sectionId, timeSpent);
              }
            }, 10000);
          } else {
            // Section left viewport
            if (startTime.current && intervalRef.current) {
              clearInterval(intervalRef.current);
              const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
              if (timeSpent > 5) {
                // Only track if user spent more than 5 seconds
                trackTimeOnSection(sectionId, timeSpent);
              }
              startTime.current = null;
            }
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(element);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      observer.disconnect();
    };
  }, [sectionId, enabled]);
};

/**
 * Hook to create a tracked button click handler
 * @param buttonName - Name of the button
 * @param location - Location of the button
 * @returns Click handler function
 */
export const useTrackedButton = (
  buttonName: string,
  location?: string
): (() => void) => {
  return () => {
    trackButtonClick(buttonName, location);
  };
};

/**
 * Hook to create a tracked link click handler
 * @param url - URL of the link
 * @param linkText - Text of the link
 * @returns Click handler function
 */
export const useTrackedLink = (
  url: string,
  linkText?: string
): (() => void) => {
  return () => {
    trackLinkClick(url, linkText);
  };
};

// Export all tracking functions for direct use
export {
  trackButtonClick,
  trackLinkClick,
  trackFormSubmit,
  trackProjectView,
  trackBlogView,
  trackSocialClick,
} from '../lib/analytics';
