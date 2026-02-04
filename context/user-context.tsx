"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/type/interface/user";
import { Organization } from "@/type/interface/organization";

interface UserContextType {
  user: User | null;
  activeOrg: Organization | null;
  isOrgRequired: boolean;
  setUser: (user: User | null) => void;
  setActiveOrg: (org: Organization | null) => void;
  setIsOrgRequired: (required: boolean) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [isOrgRequired, setIsOrgRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/user");
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        if (data?.organizations && data.organizations.length > 0) {
          setActiveOrg((prev) => {
            if (
              prev &&
              data.organizations.find((o: Organization) => o.id === prev.id)
            ) {
              return prev;
            }
            return data.organizations[0];
          });
          setIsOrgRequired(false);
        } else {
          setActiveOrg(null);
          setIsOrgRequired(!!data);
        }
      } else {
        setUser(null);
        setActiveOrg(null);
        setIsOrgRequired(false);
      }
    } catch (error) {
      setUser(null);
      setActiveOrg(null);
      setIsOrgRequired(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        activeOrg,
        isOrgRequired,
        setUser,
        setActiveOrg,
        setIsOrgRequired,
        loading,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
