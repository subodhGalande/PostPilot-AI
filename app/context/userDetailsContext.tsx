"use client";

import { createContext, useContext, type ReactNode } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  provider: "CREDENTIALS" | "GOOGLE";
  onboarded: boolean;
  industry: string | null;
  accountType: "BRAND" | "INFLUENCER" | null;
  createdAt: Date;
};

type userContextType = {
  user: User;
};

type userContextProviderProps = {
  user: User;
  children: ReactNode;
};

const UserContext = createContext<userContextType | undefined>(undefined);

export function UserContextProvider({
  user,
  children,
}: userContextProviderProps) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

export function useUser(): userContextType {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
