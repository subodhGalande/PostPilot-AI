"use client";

import { useUserProfile } from "@/lib/hooks/use-user-profile";
import { ProfileForm } from "@/components/profile/profile-form";
import { AvatarUpload } from "@/components/profile/avatar-upload";

function ProfilePageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
      <section>
        <div className="mb-6">
          <div className="h-5 w-28 animate-pulse rounded-xl bg-muted" />
          <div className="mt-1 h-4 w-48 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="rounded-xl border bg-card p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="size-20 animate-pulse rounded-full bg-muted md:size-24" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 w-48 animate-pulse rounded-xl bg-muted" />
              <div className="h-4 w-36 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <div className="h-5 w-36 animate-pulse rounded-xl bg-muted" />
          <div className="mt-1 h-4 w-52 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="rounded-xl border bg-card p-4 md:p-6">
          <div className="space-y-5">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton, never reorders
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded-xl bg-muted" />
                <div className="h-9 w-full animate-pulse rounded-xl bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  const { data: user, isLoading } = useUserProfile();

  if (isLoading || !user) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
      <section>
        <div className="mb-6">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Profile Photo
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground/80">
            Update your profile photo and personal details.
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 md:p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-card/40">
          <div className="flex items-center gap-4">
            <AvatarUpload avatarUrl={user.avatarUrl} name={user.name} />
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">{user.name}</h3>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
              {user.accountName && (
                <p className="truncate text-sm text-muted-foreground">
                  @{user.accountName}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Profile Information
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground/80">
            Edit your public profile information.
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 md:p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-card/40">
          <ProfileForm
            id={user.id}
            name={user.name}
            email={user.email}
            accountName={user.accountName}
            industry={user.industry}
            accountType={user.accountType}
            description={user.description}
          />
        </div>
      </section>
    </div>
  );
}
