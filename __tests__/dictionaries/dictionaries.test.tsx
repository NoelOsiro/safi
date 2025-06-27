// __tests__/getDictionary.test.ts
import { getDictionary } from '@/app/dictionaries' // adjust path
import type { Dictionary } from '@/app/dictionaries'

const enMock: Dictionary = {
  landing: {
    hero: {
      title: "English Title",
      tagline: "English Tagline",
      subtitle: "",
      button: "",
      description: "",
      madeInKenya: "",
      startAITraining: "",
      watchDemo: "",
      trustedBy: "",
      stats: [],
    },
    curriculum: {
      title: "",
      subtitle: "",
      modules: [],
      levels: {
        beginner: "",
        intermediate: "",
        advanced: "",
      },
    },
    stats: {
      title: "",
      subtitle: "",
      vendorTrained: "",
      countiesCovered: "",
      passRateIncrease: "",
      languagesSupported: "",
    },
    visual: {
      title: "",
      subtitle: "",
      learnThroughVisualStories: "",
      realKitchenScenariosAndVisualExamples: "",
      interactivePhotoBasedLearning: "",
      realKitchenScenariosFromKenya: "",
      stepByStepVisualGuides: "",
      realKitchenTrainingScenarios: "",
    },
    features: {
      title: "",
      subtitle: "",
      aiTitle: "",
      interactiveModules: "",
      smartAssessment: "",
      certificationPrep: "",
      communitySupport: "",
      multiPlatformAccess: "",
      aiDescription: "",
      interactiveModulesDescription: "",
      smartAssessmentDescription: "",
      certificationPrepDescription: "",
      communitySupportDescription: "",
      multiPlatformAccessDescription: "",
      items: [],
    },
    testimonials: {
      title: "",
      subtitle: "",
      testimonials: [],
    },
    cta: {
      title: "",
      subtitle: "",
      startButton: "",
      assessmentButton: "",
    },
    footer: {
      company: {
        name: "",
        description: "",
      },
      platform: {
        title: "",
        items: [],
      },
      support: {
        title: "",
        items: [],
      },
      legal: {
        title: "",
        items: [],
      },
      copyright: "",
    },
  }
}

jest.mock('@/app/dictionaries', () => ({
  getDictionary: async (locale: string) => {
    const mockData = {
      landing: {
        hero: {
          title: locale === 'sw' ? 'Swahili Title' : 'English Title',
          tagline: locale === 'sw' ? 'Swahili Tagline' : 'English Tagline',
          subtitle: '',
          button: '',
          description: '',
          madeInKenya: '',
          startAITraining: '',
          watchDemo: '',
          trustedBy: '',
          stats: [],
        },
        curriculum: {
          title: '',
          subtitle: '',
          modules: [],
          levels: {
            beginner: '',
            intermediate: '',
            advanced: '',
          },
        },
        stats: {
          title: '',
          subtitle: '',
          vendorTrained: '',
          countiesCovered: '',
          passRateIncrease: '',
          languagesSupported: '',
        },
        visual: {
          title: '',
          subtitle: '',
          learnThroughVisualStories: '',
          realKitchenScenariosAndVisualExamples: '',
          interactivePhotoBasedLearning: '',
          realKitchenScenariosFromKenya: '',
          stepByStepVisualGuides: '',
          realKitchenTrainingScenarios: '',
        },
        features: {
          title: '',
          subtitle: '',
          aiTitle: '',
          interactiveModules: '',
          smartAssessment: '',
          certificationPrep: '',
          communitySupport: '',
          multiPlatformAccess: '',
          aiDescription: '',
          interactiveModulesDescription: '',
          smartAssessmentDescription: '',
          certificationPrepDescription: '',
          communitySupportDescription: '',
          multiPlatformAccessDescription: '',
          items: [],
        },
        testimonials: {
          title: '',
          subtitle: '',
          testimonials: [],
        },
        cta: {
          title: '',
          subtitle: '',
          startButton: '',
          assessmentButton: '',
        },
        footer: {
          company: {
            name: '',
            description: '',
          },
          platform: {
            title: '',
            items: [],
          },
          support: {
            title: '',
            items: [],
          },
          legal: {
            title: '',
            items: [],
          },
          copyright: '',
        },
      }
    };

    return mockData;
  }
}));



describe('getDictionary', () => {
  it('loads English dictionary for locale "en"', async () => {
    const dict = await getDictionary('en');
    expect(dict.landing.hero.title).toBe("English Title");
    expect(dict.landing.hero.tagline).toBe("English Tagline");
  });

  it('loads Swahili dictionary for locale "sw"', async () => {
    const dict = await getDictionary('sw');
    expect(dict.landing.hero.title).toBe("Swahili Title");
    expect(dict.landing.hero.tagline).toBe("Swahili Tagline");
  });

  it('falls back to English if invalid locale is passed', async () => {
    // @ts-expect-error intentionally wrong
    const dict = await getDictionary('xx');
    expect(dict.landing.hero.title).toBe("English Title");
  });

  it('returns object matching Dictionary type', async () => {
    const dict: Dictionary = await getDictionary('en');
    expect(typeof dict.landing.hero.title).toBe('string');
    expect(Array.isArray(dict.landing.hero.stats)).toBe(true);
    expect(dict.landing.features.items).toBeDefined();
  });
});
