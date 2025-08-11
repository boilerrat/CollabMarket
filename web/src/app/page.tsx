import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { prisma } from "@/server/db";
import { Badge } from "@/components/ui/badge";

async function ProjectsPreview() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
  if (!projects.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Browse active project listings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/projects/new">Be the first to post</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid gap-3">
      {projects.map((p) => (
        <Card key={p.id}>
          <CardHeader>
            <CardTitle>{p.title}</CardTitle>
            <CardDescription>{p.projectType || ""}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-sm text-muted-foreground">{p.pitch}</p>
            {p.skills?.length ? (
              <div className="flex flex-wrap gap-1 mb-2">
                {p.skills.slice(0, 6).map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            ) : null}
            <Button size="sm" asChild>
              <Link href={`/projects/${p.id}`}>View details</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
      <div>
        <Button variant="outline" asChild>
          <Link href="/projects">See all projects</Link>
        </Button>
      </div>
    </div>
  );
}

async function CollaboratorsPreview() {
  const list = await prisma.collaboratorProfile.findMany({
    include: { user: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
  if (!list.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaborators</CardTitle>
          <CardDescription>Browse collaborator profiles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/profile">Create/Update Your Profile</Link>
            </Button>
            <Button variant="outline" disabled>
              Browse (coming soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid gap-3">
      {list.map((p) => (
        <Card key={p.id}>
          <CardHeader>
            <CardTitle>{p.user?.displayName || "Unnamed"}</CardTitle>
            <CardDescription>@{p.user?.handle || ""}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">{p.bio || ""}</p>
            {p.skills?.length ? (
              <div className="flex flex-wrap gap-1">
                {p.skills.slice(0, 8).map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href="/collaborators">See all collaborators</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/profile">Update your profile</Link>
        </Button>
      </div>
    </div>
  );
}

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
            {/* Server-rendered preview of latest projects */}
            {/* @ts-expect-error Async Server Component */}
            <ProjectsPreview />
          </TabsContent>
          <TabsContent value="collaborators">
            {/* @ts-expect-error Async Server Component */}
            <CollaboratorsPreview />
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
