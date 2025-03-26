
import { SubGoalTimelineItem } from "./types";

export const getSampleRoadmapData = (): SubGoalTimelineItem[] => {
  return [
    // Row 0 - Milestones
    {
      id: 'milestone-1',
      title: 'Community Site Beta',
      description: 'Launch beta version of the community site',
      progress: 100,
      row: 0,
      start: 0,
      duration: 1,
      category: 'milestone'
    },
    {
      id: 'milestone-2',
      title: 'Android Mobile App Launch',
      description: 'Android app available on Play Store',
      progress: 70,
      row: 0,
      start: 3,
      duration: 1,
      category: 'milestone'
    },
    {
      id: 'milestone-3',
      title: 'iOS Mobile App Launch',
      description: 'iOS app available on App Store',
      progress: 40,
      row: 0,
      start: 6,
      duration: 1,
      category: 'milestone'
    },
    {
      id: 'milestone-4',
      title: 'US Web Store Launch',
      description: 'Expansion to US market',
      progress: 10,
      row: 0,
      start: 8,
      duration: 1,
      category: 'milestone'
    },
    {
      id: 'milestone-5',
      title: 'Holiday Blackout',
      description: 'Code freeze during holiday season',
      progress: 0,
      row: 0,
      start: 11,
      duration: 1,
      category: 'milestone'
    },
    
    // Row 1 - Features
    {
      id: 'feature-1',
      title: 'Two-Factor Authentication',
      description: 'Implement 2FA for enhanced security',
      progress: 100,
      row: 1,
      start: 0,
      duration: 2,
      category: 'feature'
    },
    {
      id: 'feature-2',
      title: 'Single-Sign On',
      description: 'SSO implementation for all platforms',
      progress: 50,
      row: 1,
      start: 4,
      duration: 3,
      category: 'feature'
    },
    {
      id: 'feature-3',
      title: 'User Avatar',
      description: 'Custom user avatar system',
      progress: 20,
      row: 1,
      start: 7,
      duration: 2,
      category: 'feature'
    },
    {
      id: 'feature-4',
      title: 'Forgot Password Improvement',
      description: 'Enhanced password recovery flow',
      progress: 70,
      row: 2,
      start: 3,
      duration: 3,
      category: 'feature'
    },
    {
      id: 'feature-5',
      title: 'Multi-Account Management',
      description: 'Allow users to manage multiple accounts',
      progress: 10,
      row: 2,
      start: 9,
      duration: 3,
      category: 'feature'
    },
    {
      id: 'feature-6',
      title: 'Language Localization',
      description: 'Add support for multiple languages',
      progress: 80,
      row: 3,
      start: 0,
      duration: 4,
      category: 'feature'
    },
    {
      id: 'feature-7',
      title: 'Reward (Progress Bar)',
      description: 'User rewards program with progress tracking',
      progress: 40,
      row: 3,
      start: 5,
      duration: 3,
      category: 'feature'
    },
    
    // Row 2 - Mobile
    {
      id: 'mobile-1',
      title: 'iOS App',
      description: 'Core iOS app development',
      progress: 60,
      row: 4,
      start: 0,
      duration: 2,
      category: 'mobile'
    },
    {
      id: 'mobile-2',
      title: 'Android App',
      description: 'Core Android app development',
      progress: 80,
      row: 5,
      start: 1,
      duration: 3,
      category: 'mobile'
    },
    {
      id: 'mobile-3',
      title: 'Facebook Integration',
      description: 'Social login and sharing for mobile',
      progress: 30,
      row: 5,
      start: 5,
      duration: 3,
      category: 'mobile'
    },
    {
      id: 'mobile-4',
      title: 'Apple Pay',
      description: 'Apple Pay integration for iOS',
      progress: 50,
      row: 6,
      start: 3,
      duration: 3,
      category: 'mobile'
    },
    {
      id: 'mobile-5',
      title: 'Push Notifications',
      description: 'Cross-platform push notification system',
      progress: 20,
      row: 6,
      start: 9,
      duration: 3,
      category: 'mobile'
    },
    
    // Web Development (row 3)
    {
      id: 'web-1',
      title: 'Responsive eCommerce site',
      description: 'Mobile-friendly eCommerce platform',
      progress: 90,
      row: 7,
      start: 0,
      duration: 3,
      category: 'web'
    },
    {
      id: 'web-2',
      title: 'Abandon Cart Widget',
      description: 'Cart abandonment recovery tool',
      progress: 60,
      row: 7,
      start: 4,
      duration: 3,
      category: 'web'
    },
    {
      id: 'web-3',
      title: 'PCI Compliance',
      description: 'Payment Card Industry compliance implementation',
      progress: 40,
      row: 8,
      start: 2,
      duration: 2,
      category: 'web'
    },
    {
      id: 'web-4',
      title: 'Guest Checkout Improvement',
      description: 'Streamlined guest checkout process',
      progress: 30,
      row: 8,
      start: 6,
      duration: 3,
      category: 'web'
    },
    {
      id: 'web-5',
      title: 'Holiday Blackout',
      description: 'Prepare site for holiday traffic',
      progress: 10,
      row: 8,
      start: 10,
      duration: 2,
      category: 'web'
    },
    {
      id: 'web-6',
      title: 'Reskin Shopping Cart',
      description: 'New UI for shopping cart',
      progress: 50,
      row: 9,
      start: 3,
      duration: 3,
      category: 'web'
    },
    {
      id: 'web-7',
      title: 'Two-Day Shipping',
      description: 'Implement two-day shipping option',
      progress: 20,
      row: 9,
      start: 6,
      duration: 6,
      category: 'web'
    },
    
    // Infrastructure (row 4)
    {
      id: 'infrastructure-1',
      title: 'Help Bot',
      description: 'AI-powered customer service bot',
      progress: 70,
      row: 10,
      start: 0,
      duration: 2,
      category: 'infrastructure'
    },
    {
      id: 'infrastructure-2',
      title: 'Update Navigation',
      description: 'New navigation structure',
      progress: 60,
      row: 10,
      start: 3,
      duration: 3,
      category: 'infrastructure'
    },
    {
      id: 'infrastructure-3',
      title: 'Search Improvements',
      description: 'Enhanced search functionality',
      progress: 30,
      row: 10,
      start: 7,
      duration: 3,
      category: 'infrastructure'
    },
    {
      id: 'infrastructure-4',
      title: 'Accessibility Improvements',
      description: 'WCAG compliance updates',
      progress: 50,
      row: 11,
      start: 3,
      duration: 7,
      category: 'infrastructure'
    },
    
    // Backend (row 5)
    {
      id: 'backend-1',
      title: 'Database Improvements',
      description: 'Database optimization and scaling',
      progress: 80,
      row: 12,
      start: 0,
      duration: 3,
      category: 'backend'
    },
    {
      id: 'backend-2',
      title: 'Library Upgrades',
      description: 'Update all third-party libraries',
      progress: 60,
      row: 12,
      start: 4,
      duration: 4,
      category: 'backend'
    },
    {
      id: 'backend-3',
      title: 'Update API Documentation',
      description: 'Refresh API documentation',
      progress: 40,
      row: 13,
      start: 2,
      duration: 3,
      category: 'backend'
    },
    {
      id: 'backend-4',
      title: 'Optimize Server Serialization',
      description: 'Improve server-side serialization',
      progress: 30,
      row: 13,
      start: 6,
      duration: 3,
      category: 'backend'
    },
    {
      id: 'backend-5',
      title: 'Data Dump',
      description: 'Create data export functionality',
      progress: 20,
      row: 14,
      start: 5,
      duration: 2,
      category: 'backend'
    }
  ];
};
