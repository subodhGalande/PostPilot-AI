import prisma from "@/lib/prisma";

interface User {
  id: string;
  email: string;
}

export default async function Home() {
  const users = await prisma.user.findMany();
  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-12">
        <h1 className="text-5xl font-semibold tracking-tighter leading-tight text-foreground">
          Superblog
        </h1>

        {users.length > 0 && (
          <div className="bg-card text-card-foreground rounded-2xl shadow-md border border-border/60 p-8 mx-auto text-left max-w-md">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">
              Users
            </h2>
            <ul className="space-y-4">
              {users.map((user: User) => (
                <li
                  key={user.id}
                  className="text-base text-foreground font-medium flex items-center gap-3"
                >
                  <div className="h-2 w-2 rounded-full bg-primary/40"></div>
                  {user.email}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
