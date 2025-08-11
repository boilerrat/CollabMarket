import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh p-4">
      <div className="mx-auto max-w-4xl">
        <Tabs defaultValue="projects">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            <TabsTrigger value="post">Post</TabsTrigger>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
          </TabsList>
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Browse active project listings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Coming soon</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="collaborators">
            <Card>
              <CardHeader>
                <CardTitle>Collaborators</CardTitle>
                <CardDescription>Browse collaborator profiles.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Button asChild>
                    <Link href="/profile">Create/Update Your Profile</Link>
                  </Button>
                  <Button variant="outline">Browse (coming soon)</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="post">
            <Card>
              <CardHeader>
                <CardTitle>Post a Project</CardTitle>
                <CardDescription>Create a new project listing.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/projects/new">Start</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inbox">
            <Card>
              <CardHeader>
                <CardTitle>Inbox</CardTitle>
                <CardDescription>Requests and notifications.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Coming soon</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
