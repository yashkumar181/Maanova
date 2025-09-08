"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResourceCard } from "@/components/resource-card"
import { Search, Filter, BookOpen, Video, Headphones, FileText, Globe } from "lucide-react"

interface Resource {
  id: string
  title: string
  description: string
  type: "video" | "audio" | "article" | "guide" | "tool"
  category: string
  duration?: string
  language: string
  difficulty: "beginner" | "intermediate" | "advanced"
  tags: string[]
  thumbnail?: string
  url?: string
  audioUrl?: string
  downloadUrl?: string
}

const resources: Resource[] = [
  {
    id: "1",
    title: "Breathing Techniques for Anxiety",
    description: "Learn evidence-based breathing exercises to manage anxiety and panic attacks in real-time.",
    type: "video",
    category: "Anxiety Management",
    duration: "8 min",
    language: "English",
    difficulty: "beginner",
    tags: ["anxiety", "breathing", "panic attacks", "mindfulness"],
    thumbnail: "/breathing-techniques-video.jpg",
    url: "https://example.com/breathing-video",
  },
  {
    id: "2",
    title: "Progressive Muscle Relaxation",
    description: "A guided audio session to help you release physical tension and promote deep relaxation.",
    type: "audio",
    category: "Stress Relief",
    duration: "15 min",
    language: "English",
    difficulty: "beginner",
    tags: ["relaxation", "stress", "sleep", "muscle tension"],
    audioUrl: "/progressive-muscle-relaxation.mp3",
  },
  {
    id: "3",
    title: "Understanding Depression in College",
    description: "Comprehensive guide covering symptoms, causes, and treatment options for depression among students.",
    type: "article",
    category: "Depression Support",
    duration: "12 min read",
    language: "English",
    difficulty: "intermediate",
    tags: ["depression", "college life", "symptoms", "treatment"],
  },
  {
    id: "4",
    title: "Study Stress Management Toolkit",
    description: "Downloadable PDF with practical strategies for managing academic stress and exam anxiety.",
    type: "guide",
    category: "Academic Stress",
    language: "English",
    difficulty: "beginner",
    tags: ["study stress", "exams", "time management", "productivity"],
    downloadUrl: "/study-stress-toolkit.pdf",
  },
  {
    id: "5",
    title: "Mindfulness Meditation for Beginners",
    description: "Introduction to mindfulness practices with guided meditation sessions for daily stress relief.",
    type: "audio",
    category: "Mindfulness",
    duration: "20 min",
    language: "English",
    difficulty: "beginner",
    tags: ["mindfulness", "meditation", "stress relief", "focus"],
    audioUrl: "/mindfulness-meditation.mp3",
  },
  {
    id: "6",
    title: "Building Healthy Relationships",
    description: "Video series on developing and maintaining healthy relationships during college years.",
    type: "video",
    category: "Relationships",
    duration: "25 min",
    language: "English",
    difficulty: "intermediate",
    tags: ["relationships", "communication", "boundaries", "social skills"],
    thumbnail: "/healthy-relationships-video.jpg",
    url: "https://example.com/relationships-video",
  },
  {
    id: "7",
    title: "Sleep Hygiene for Students",
    description: "Evidence-based strategies for improving sleep quality and establishing healthy sleep patterns.",
    type: "article",
    category: "Sleep & Wellness",
    duration: "8 min read",
    language: "English",
    difficulty: "beginner",
    tags: ["sleep", "wellness", "health", "productivity"],
  },
  {
    id: "8",
    title: "Crisis Coping Strategies",
    description: "Essential techniques for managing mental health crises and knowing when to seek immediate help.",
    type: "guide",
    category: "Crisis Support",
    language: "English",
    difficulty: "advanced",
    tags: ["crisis", "emergency", "coping", "safety"],
    downloadUrl: "/crisis-coping-guide.pdf",
  },
  {
    id: "9",
    title: "Técnicas de Respiración para la Ansiedad",
    description: "Aprende ejercicios de respiración basados en evidencia para manejar la ansiedad y ataques de pánico.",
    type: "video",
    category: "Anxiety Management",
    duration: "8 min",
    language: "Spanish",
    difficulty: "beginner",
    tags: ["ansiedad", "respiración", "ataques de pánico", "mindfulness"],
    thumbnail: "/breathing-techniques-spanish.jpg",
    url: "https://example.com/breathing-video-spanish",
  },
  {
    id: "10",
    title: "Body Image and Self-Esteem",
    description: "Addressing body image concerns and building healthy self-esteem during college years.",
    type: "video",
    category: "Self-Esteem",
    duration: "18 min",
    language: "English",
    difficulty: "intermediate",
    tags: ["body image", "self-esteem", "confidence", "mental health"],
    thumbnail: "/body-image-video.jpg",
    url: "https://example.com/body-image-video",
  },
]

const categories = [
  "All",
  "Anxiety Management",
  "Depression Support",
  "Stress Relief",
  "Academic Stress",
  "Mindfulness",
  "Relationships",
  "Sleep & Wellness",
  "Crisis Support",
  "Self-Esteem",
]

const languages = ["All Languages", "English", "Spanish", "French", "Mandarin", "Hindi"]

export function ResourceHub() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages")
  const [selectedType, setSelectedType] = useState("all")

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory
    const matchesLanguage = selectedLanguage === "All Languages" || resource.language === selectedLanguage
    const matchesType = selectedType === "all" || resource.type === selectedType

    return matchesSearch && matchesCategory && matchesLanguage && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-border rounded-md text-sm bg-background"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 border border-border rounded-md text-sm bg-background"
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Resource Type Tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>All</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center space-x-2">
            <Video className="h-4 w-4" />
            <span>Videos</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center space-x-2">
            <Headphones className="h-4 w-4" />
            <span>Audio</span>
          </TabsTrigger>
          <TabsTrigger value="article" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Articles</span>
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Guides</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Access Categories */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent hover:bg-primary/5"
            onClick={() => {
              setSelectedCategory("Crisis Support")
              setSelectedType("all")
            }}
          >
            <div className="p-2 bg-destructive/10 rounded-full">
              <FileText className="h-6 w-6 text-destructive" />
            </div>
            <span className="text-sm font-medium">Crisis Resources</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent hover:bg-primary/5"
            onClick={() => {
              setSelectedCategory("Anxiety Management")
              setSelectedType("all")
            }}
          >
            <div className="p-2 bg-primary/10 rounded-full">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium">Anxiety Help</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent hover:bg-primary/5"
            onClick={() => {
              setSelectedCategory("Academic Stress")
              setSelectedType("all")
            }}
          >
            <div className="p-2 bg-accent/10 rounded-full">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <span className="text-sm font-medium">Study Support</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent hover:bg-primary/5"
            onClick={() => {
              setSelectedLanguage("Spanish")
              setSelectedType("all")
            }}
          >
            <div className="p-2 bg-secondary/10 rounded-full">
              <Globe className="h-6 w-6 text-secondary" />
            </div>
            <span className="text-sm font-medium">Español</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
