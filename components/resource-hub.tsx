"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResourceCard } from "@/components/resource-card"
import { Search, Filter, BookOpen, Video, Headphones, FileText, Globe } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Define the shape of the Resource data from Firestore
interface Resource {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: 'video' | 'audio' | 'article' | 'guide' | 'tool';
  category: string;
  collegeId: string;
  // Re-adding optional fields for filtering from your original design
  language?: string; 
}

// Re-adding categories and languages from your original design
const categories = [
  "All", "Anxiety Management", "Depression Support", "Stress Relief", 
  "Academic Stress", "Mindfulness", "Relationships", "Sleep & Wellness", 
  "Crisis Support", "Self-Esteem",
];

const languages = ["All Languages", "English", "Spanish"]; // Simplified for example

export function ResourceHub() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);
  
  // Re-adding full filtering state from your original design
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        const studentDocRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentDocRef);
        if (studentSnap.exists()) {
          setCollegeId(studentSnap.data()?.collegeId);
        } else {
          setLoading(false);
        }
      } else {
        setResources([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!collegeId) {
      if(userUid) setLoading(false);
      return;
    };

    setLoading(true);
    const resourcesQuery = query(collection(db, "resources"), where("collegeId", "==", collegeId));
    const unsubscribe = onSnapshot(resourcesQuery, (snapshot) => {
      const fetchedResources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
      setResources(fetchedResources);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching resources:", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [collegeId, userUid]);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
    const matchesLanguage = selectedLanguage === "All Languages" || resource.language === selectedLanguage;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesCategory && matchesLanguage && matchesType;
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources by title or description..."
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
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-1 border border-border rounded-md text-sm bg-background">
              {categories.map((category) => (<option key={category} value={category}>{category}</option>))}
            </select>
            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="px-3 py-1 border border-border rounded-md text-sm bg-background">
              {languages.map((language) => (<option key={language} value={language}>{language}</option>))}
            </select>
          </div>
        </div>
      </Card>

      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all"><BookOpen className="mr-2 h-4 w-4" />All</TabsTrigger>
          <TabsTrigger value="video"><Video className="mr-2 h-4 w-4" />Videos</TabsTrigger>
          <TabsTrigger value="audio"><Headphones className="mr-2 h-4 w-4" />Audio</TabsTrigger>
          <TabsTrigger value="article"><FileText className="mr-2 h-4 w-4" />Articles</TabsTrigger>
          <TabsTrigger value="guide"><FileText className="mr-2 h-4 w-4" />Guides</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full rounded-lg" /><Skeleton className="h-64 w-full rounded-lg" /><Skeleton className="h-64 w-full rounded-lg" />
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources
                .filter(resource => resource.url)
                .map((resource) => (
                <ResourceCard key={resource.id} resource={resource as Resource & { url: string }} userUid={userUid} collegeId={collegeId} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Resources Found</h3>
              <p className="text-muted-foreground">Your college admin has not added any resources yet, or your search returned no results.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* --- THIS IS THE RESTORED QUICK ACCESS SECTION --- */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => setSelectedCategory("Crisis Support")}>
            <div className="p-2 bg-destructive/10 rounded-full"><FileText className="h-6 w-6 text-destructive" /></div>
            <span className="text-sm font-medium">Crisis Resources</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => setSelectedCategory("Anxiety Management")}>
            <div className="p-2 bg-primary/10 rounded-full"><Headphones className="h-6 w-6 text-primary" /></div>
            <span className="text-sm font-medium">Anxiety Help</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => setSelectedCategory("Academic Stress")}>
            <div className="p-2 bg-accent/10 rounded-full"><BookOpen className="h-6 w-6 text-accent" /></div>
            <span className="text-sm font-medium">Study Support</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => setSelectedLanguage("Spanish")}>
            <div className="p-2 bg-secondary/10 rounded-full"><Globe className="h-6 w-6 text-secondary" /></div>
            <span className="text-sm font-medium">Español</span>
          </Button>
        </div>
      </Card>
      {/* ---------------------------------------------------- */}
    </div>
  )
}

