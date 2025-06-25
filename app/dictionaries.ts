'use server'
import 'server-only'

export type Dictionary = {
  landing: {
    hero: {
      title: string;
      tagline: string;
      subtitle: string;
      button: string;
      description: string;
      madeInKenya: string;
      startAITraining: string;
      watchDemo: string;
      trustedBy: string;
      stats: Array<{
        value: string;
        label: string;
      }>;
    },
    curriculum: {
      title: string;
      subtitle: string;
      modules: Array<{
        title: string;
        description: string;
        duration: string;
        level: string;
      }>;
      levels: {
        beginner: string;
        intermediate: string;
        advanced: string;
      };
    }
    stats: {
      title: string;
      subtitle: string;
      vendorTrained: string;
      countiesCovered: string;
      passRateIncrease: string;
      languagesSupported: string;
    }
    visual: {
      title: string;
      subtitle: string;
      learnThroughVisualStories: string;
      realKitchenScenariosAndVisualExamples: string;
      interactivePhotoBasedLearning: string;
      realKitchenScenariosFromKenya: string;
      stepByStepVisualGuides: string;
      realKitchenTrainingScenarios: string;
    }
    features: {
      title: string;
      subtitle: string;
      aiTitle: string;
      interactiveModules: string;
      smartAssessment: string;
      certificationPrep: string;
      communitySupport: string;
      multiPlatformAccess: string;
      aiDescription: string;
      interactiveModulesDescription: string;
      smartAssessmentDescription: string;
      certificationPrepDescription: string;
      communitySupportDescription: string;
      multiPlatformAccessDescription: string;
      items: Array<{
        title: string;
        description: string;
      }>;
    };
    testimonials: {
      title: string;
      subtitle: string;
      testimonials: Array<{
        name: string;
        role: string;
        quote: string;
        rating: number;
        imageId: number;
      }>;
    };
    cta: {
      title: string;
      subtitle: string;
      startButton: string;
      assessmentButton: string;
    };
    footer: {
      company: {
        name: string;
        description: string;
      };
      platform: {
        title: string;
        items: Array<{
          label: string;
          href: string;
        }>;
      };
      support: {
        title: string;
        items: Array<{
          label: string;
          href: string;
        }>;
      };
      legal: {
        title: string;
        items: Array<{
          label: string;
          href: string;
        }>;
      };
      copyright: string;
    };
  }
}

const dictionaries = {
  en: (): Promise<Dictionary> => import('./dictionaries/en.json').then((mod) => mod.default as Dictionary),
  sw: (): Promise<Dictionary> => import('./dictionaries/sw.json').then((mod) => mod.default as Dictionary),
}

export const getDictionary = async (locale: 'en' | 'sw'): Promise<Dictionary> => {
  const load = dictionaries[locale] || dictionaries.en
  return load()
}
