/**
 * Google Analytics 4 (GA4) Tracking Utilities
 * 
 * This file provides utilities for tracking events, page views, and user interactions
 * with Google Analytics 4.
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

/**
 * Get the Google Analytics Measurement ID from environment variables
 */
export const getGAMeasurementId = (): string | null => {
  return import.meta.env.VITE_GA_MEASUREMENT_ID || null;
};

/**
 * Check if Google Analytics is enabled and configured
 */
export const isGAEnabled = (): boolean => {
  return !!getGAMeasurementId();
};

/**
 * Initialize Google Analytics
 * This should be called once when the app loads
 */
export const initGA = (): void => {
  const measurementId = getGAMeasurementId();
  
  if (!measurementId) {
    if (import.meta.env.DEV) {
      console.warn('Google Analytics Measurement ID not found. Analytics will not be tracked.');
    }
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  // Set current time
  window.gtag('js', new Date());

  // Load GA4 script dynamically
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Configure GA4
  window.gtag('config', measurementId, {
    page_path: window.location.pathname,
    send_page_view: true,
  });
};

/**
 * Track a page view
 * @param pagePath - The path of the page (e.g., '/', '/projects', '/#contact')
 * @param pageTitle - Optional page title
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (!isGAEnabled()) return;

  const measurementId = getGAMeasurementId();
  if (!measurementId) return;

  window.gtag('config', measurementId, {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  });
};

/**
 * Track a custom event
 * @param eventName - Name of the event (e.g., 'button_click', 'form_submit')
 * @param eventParams - Additional parameters for the event
 */
export const trackEvent = (
  eventName: string,
  eventParams?: {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: any;
  }
): void => {
  if (!isGAEnabled()) return;

  window.gtag('event', eventName, {
    ...eventParams,
  });
};

/**
 * Track section views (for single-page applications)
 * @param sectionId - The ID of the section (e.g., 'home', 'projects', 'contact')
 * @param sectionName - Human-readable section name
 */
export const trackSectionView = (sectionId: string, sectionName?: string): void => {
  trackEvent('section_view', {
    event_category: 'Navigation',
    event_label: sectionName || sectionId,
    section_id: sectionId,
    section_name: sectionName || sectionId,
  });
};

/**
 * Track button clicks
 * @param buttonName - Name/identifier of the button
 * @param location - Where the button is located (e.g., 'header', 'contact_form')
 */
export const trackButtonClick = (buttonName: string, location?: string): void => {
  trackEvent('button_click', {
    event_category: 'User Interaction',
    event_label: buttonName,
    button_name: buttonName,
    button_location: location,
  });
};

/**
 * Track link clicks (external links)
 * @param linkUrl - The URL being clicked
 * @param linkText - The text of the link
 */
export const trackLinkClick = (linkUrl: string, linkText?: string): void => {
  trackEvent('link_click', {
    event_category: 'Outbound Link',
    event_label: linkText || linkUrl,
    link_url: linkUrl,
    link_text: linkText,
  });
};

/**
 * Track form submissions
 * @param formName - Name/identifier of the form
 * @param formStatus - Status of submission ('success' or 'error')
 */
export const trackFormSubmit = (formName: string, formStatus: 'success' | 'error'): void => {
  trackEvent('form_submit', {
    event_category: 'Form',
    event_label: formName,
    form_name: formName,
    form_status: formStatus,
  });
};

/**
 * Track project views
 * @param projectName - Name of the project
 * @param projectUrl - URL of the project
 */
export const trackProjectView = (projectName: string, projectUrl?: string): void => {
  trackEvent('project_view', {
    event_category: 'Projects',
    event_label: projectName,
    project_name: projectName,
    project_url: projectUrl,
  });
};

/**
 * Track blog article views
 * @param articleTitle - Title of the article
 * @param articleUrl - URL of the article
 */
export const trackBlogView = (articleTitle: string, articleUrl?: string): void => {
  trackEvent('blog_view', {
    event_category: 'Blog',
    event_label: articleTitle,
    article_title: articleTitle,
    article_url: articleUrl,
  });
};

/**
 * Track social media clicks
 * @param platform - Social media platform (e.g., 'github', 'linkedin', 'twitter')
 * @param url - URL of the social media profile
 */
export const trackSocialClick = (platform: string, url?: string): void => {
  trackEvent('social_click', {
    event_category: 'Social Media',
    event_label: platform,
    social_platform: platform,
    social_url: url,
  });
};

/**
 * Track download events (e.g., resume download)
 * @param fileName - Name of the file being downloaded
 * @param fileType - Type of file (e.g., 'pdf', 'resume')
 */
export const trackDownload = (fileName: string, fileType?: string): void => {
  trackEvent('file_download', {
    event_category: 'Download',
    event_label: fileName,
    file_name: fileName,
    file_type: fileType,
  });
};

/**
 * Track scroll depth
 * @param depth - Scroll depth percentage (0-100)
 */
export const trackScrollDepth = (depth: number): void => {
  // Only track at 25%, 50%, 75%, and 100% to avoid too many events
  if ([25, 50, 75, 100].includes(depth)) {
    trackEvent('scroll_depth', {
      event_category: 'Engagement',
      event_label: `${depth}%`,
      scroll_depth: depth,
    });
  }
};

/**
 * Track time on page (call this when user leaves a section)
 * @param sectionId - ID of the section
 * @param timeSpent - Time spent in seconds
 */
export const trackTimeOnSection = (sectionId: string, timeSpent: number): void => {
  trackEvent('time_on_section', {
    event_category: 'Engagement',
    event_label: sectionId,
    section_id: sectionId,
    time_spent: timeSpent,
  });
};
