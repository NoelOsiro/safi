export const mockUsers = [
  {
    id: "1",
    fullName: "Mary Wanjiku",
    email: "mary.wanjiku@example.com",
    phone: "+254 700 123 456",
    businessType: "street-vendor",
    location: "nairobi",
    experience: "intermediate",
    avatar: "https://picsum.photos/80/80?random=20",
    createdAt: "2024-01-15T10:00:00Z",
    onboardingCompleted: true,
    progress: {
      modulesCompleted: 2,
      totalModules: 5,
      assessmentScore: 75,
      certificationReady: 80,
      studyTime: 150, // minutes
    },
  },
  {
    id: "2",
    fullName: "John Kiprotich",
    email: "john.kiprotich@example.com",
    phone: "+254 700 234 567",
    businessType: "school-kitchen",
    location: "eldoret",
    experience: "experienced",
    avatar: "https://picsum.photos/80/80?random=21",
    createdAt: "2024-01-10T08:30:00Z",
    onboardingCompleted: true,
    progress: {
      modulesCompleted: 5,
      totalModules: 5,
      assessmentScore: 92,
      certificationReady: 95,
      studyTime: 280,
    },
  },
]

export const mockModules = [
  {
    id: "1",
    title: "Introduction to Food Safety",
    description: "Learn the basics of food safety and why it matters",
    icon: "🍽️",
    duration: "15 min",
    level: "Beginner",
    image: "https://picsum.photos/600/400?random=10",
    slides: [
      {
        id: "1-1",
        title: "What is Food Safety?",
        content:
          "Food safety refers to the practices and conditions that preserve the quality of food to prevent contamination and foodborne illnesses.",
        keyPoints: [
          "Protecting food from contamination",
          "Preventing foodborne diseases",
          "Maintaining food quality",
          "Following proper hygiene practices",
        ],
        image: "https://picsum.photos/600/400?random=10",
      },
      {
        id: "1-2",
        title: "Why Food Safety Matters",
        content:
          "In Kenya, proper food safety practices protect our families and communities from serious health risks.",
        keyPoints: [
          "Prevents stomach illnesses and diarrhea",
          "Protects children and elderly people",
          "Builds trust with customers",
          "Required for business licenses",
        ],
        image: "https://picsum.photos/600/400?random=11",
      },
      {
        id: "1-3",
        title: "Common Food Safety Risks",
        content: "Understanding the main dangers helps us prevent them in our kitchens and food businesses.",
        keyPoints: [
          "Bacteria from raw meat and eggs",
          "Dirty hands and surfaces",
          "Improper food storage",
          "Contaminated water",
        ],
        image: "https://picsum.photos/600/400?random=12",
      },
      {
        id: "1-4",
        title: "Your Role in Food Safety",
        content: "Every person handling food has the responsibility to keep it safe from farm to table.",
        keyPoints: [
          "Clean hands and workspace",
          "Store food at right temperatures",
          "Separate raw and cooked foods",
          "Cook food thoroughly",
        ],
        image: "https://picsum.photos/600/400?random=13",
      },
    ],
    averageRating: 4.8,
    totalReviews: 127,
  },
  {
    id: "2",
    title: "Hygiene & Cleanliness",
    description: "Personal hygiene practices and cleaning procedures",
    icon: "🧼",
    duration: "20 min",
    level: "Beginner",
    image: "https://picsum.photos/600/400?random=14",
    slides: [
      {
        id: "2-1",
        title: "Personal Hygiene Basics",
        content: "Proper personal hygiene is the foundation of food safety in any kitchen environment.",
        keyPoints: [
          "Wash hands frequently with soap",
          "Keep fingernails short and clean",
          "Wear clean clothes and aprons",
          "Cover cuts and wounds properly",
        ],
        image: "https://picsum.photos/600/400?random=14",
      },
    ],
    averageRating: 4.6,
    totalReviews: 89,
  },
  {
    id: "3",
    title: "Food Storage & Handling",
    description: "Proper storage and handling of food to prevent contamination",
    icon: "🧼",
    duration: "20 min",
    level: "Beginner",
    image: "https://picsum.photos/600/400?random=15",
    slides: [
      {
        id: "3-1",
        title: "Food Storage Basics",
        content: "Proper storage of food is essential to prevent contamination and spoilage.",
        keyPoints: [
          "Store food in clean, dry, and cool places",
          "Keep raw and cooked foods separate",
          "Use proper containers and labels",
          "Store food at the right temperature",
        ],
        image: "https://picsum.photos/600/400?random=15",
      },
    ],
    averageRating: 4.6,
    totalReviews: 89,
  },
  {
    id: "4",
    title: "Kitchen Setup & Safety",
    description: "Layout design and waste management",
    icon: "🏠",
    duration: "25 min",
    level: "Beginner",
    image: "https://picsum.photos/600/400?random=16",
    slides: [
      {
        id: "4-1",
        title: "Kitchen Layout Basics",
        content: "Proper kitchen layout is essential for food safety and hygiene.",
        keyPoints: [
          "Keep raw and cooked foods separate",
          "Use proper containers and labels",
          "Store food at the right temperature",
        ],
        image: "https://picsum.photos/600/400?random=16",
      },
    ],
    averageRating: 4.6,
    totalReviews: 89,
  },
  {
    id: "5",
    title: "Certification Requirements",
    description: "Documents needed and inspection preparation",
    icon: "📝",
    duration: "18 min",
    level: "Beginner",
    image: "https://picsum.photos/600/400?random=17",
    slides: [
      {
        id: "5-1",
        title: "Certification Basics",
        content: "Proper certification is essential for food safety and hygiene.",
        keyPoints: [
          "Keep raw and cooked foods separate",
          "Use proper containers and labels",
          "Store food at the right temperature",
        ],
        image: "https://picsum.photos/600/400?random=17",
      },
    ],
    averageRating: 4.6,
    totalReviews: 89,
  },
]

export const mockReviews = [
  {
    id: "1",
    moduleId: "1",
    userId: "1",
    userName: "Mary Wanjiku",
    userAvatar: "https://picsum.photos/40/40?random=20",
    rating: 5,
    comment: "Very helpful module! The examples are easy to understand.",
    date: "2024-01-20T14:30:00Z",
    helpful: 12,
    notHelpful: 1,
  },
  {
    id: "2",
    moduleId: "1",
    userId: "2",
    userName: "John Kiprotich",
    userAvatar: "https://picsum.photos/40/40?random=21",
    rating: 4,
    comment: "Good content, but would like more videos.",
    date: "2024-01-15T09:15:00Z",
    helpful: 8,
    notHelpful: 2,
  },
  {
    id: "3",
    moduleId: "1",
    userId: "3",
    userName: "Grace Achieng",
    userAvatar: "https://picsum.photos/40/40?random=22",
    rating: 5,
    comment: "Perfect for beginners like me. Thank you WinjoPro!",
    date: "2024-01-10T16:45:00Z",
    helpful: 15,
    notHelpful: 0,
  },
]

export const mockAssessments = [
  {
    id: "1",
    userId: "1",
    moduleId: "1",
    score: 85,
    totalQuestions: 10,
    correctAnswers: 8,
    completedAt: "2024-01-20T15:00:00Z",
    timeSpent: 12, // minutes
  },
]

export const mockAdminStats = {
  totalUsers: 2847,
  activeUsers: 1923,
  certifications: 456,
  completionRate: 78,
  monthlyGrowth: {
    users: 12,
    learners: 8,
    certifications: 23,
    completionRate: 5,
  },
}

export const mockRegionalData = [
  { name: "Nairobi County", users: 1247, certified: 234, completion: 82 },
  { name: "Kisumu County", users: 456, certified: 89, completion: 76 },
  { name: "Eldoret County", users: 389, certified: 67, completion: 71 },
  { name: "Mombasa County", users: 298, certified: 45, completion: 68 },
  { name: "Machakos County", users: 234, certified: 21, completion: 65 },
]
