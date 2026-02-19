"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/type/interface/user";
import { Organization } from "@/type/interface/organization";
import { Project } from "@/type/interface/project";
import axios from "axios";

interface UserContextType {
  user: User | null;
  activeOrg: Organization | null;
  projects: Project[];
  isOrgRequired: boolean;
  setUser: (user: User | null) => void;
  setActiveOrg: (org: Organization | null) => void;
  setProjects: (projects: Project[]) => void;
  setIsOrgRequired: (required: boolean) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateProjectTitle: (projectId: string, newTitle: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
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

  const fetchProjects = async () => {
    try {
      if (!activeOrg) {
        setProjects([]);
        return;
      }
      const response = await axios.get("/api/project/list", {
        params: { org_id: activeOrg.id },
      });
      if (response.data.status === "success") {
        setProjects(response.data.projects);
      }
    } catch {
      setProjects([]);
    }
  };

  const updateProjectTitle = (projectId: string, newTitle: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, title: newTitle } : p
      )
    );
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [activeOrg]);

  return (
    <UserContext.Provider
      value={{
        user,
        activeOrg,
        projects,
        isOrgRequired,
        setUser,
        setActiveOrg,
        setProjects,
        setIsOrgRequired,
        loading,
        refreshUser: fetchUser,
        updateProjectTitle,
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
