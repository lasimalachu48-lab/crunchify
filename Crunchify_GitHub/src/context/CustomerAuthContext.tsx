"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CustomerUser } from "@/types";

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  loginCustomer: (email: string, name?: string, phone?: string) => void;
  logoutCustomer: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("crunchify_customer_session");
      if (saved) {
        setCustomer(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load customer session", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const loginCustomer = (email: string, name?: string, phone?: string) => {
    const user: CustomerUser = {
      id: `cust-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name?.trim() || email.split("@")[0],
      phone: phone?.trim(),
    };
    setCustomer(user);
    try {
      localStorage.setItem("crunchify_customer_session", JSON.stringify(user));
    } catch {
      // ignore
    }
    setIsAuthModalOpen(false);
  };

  const logoutCustomer = () => {
    setCustomer(null);
    try {
      localStorage.removeItem("crunchify_customer_session");
    } catch {
      // ignore
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loginCustomer,
        logoutCustomer,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}

