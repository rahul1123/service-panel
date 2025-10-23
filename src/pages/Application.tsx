// File: app/resellers/page.tsx or pages/resellers.tsx (depending on your project setup)

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";

interface PrimaryContactInfo {
  email: string;
  firstName: string;
  lastName: string;
}

interface OrganizationSchema {
  domain: string;
  orgDisplayName: string;
  alternateEmail: string;
  primaryContactInfo: PrimaryContactInfo;
}

export default function Resellers() {
  const [organization, setOrganization] = useState<OrganizationSchema | null>(null);

  useEffect(() => {
    // Simulate API fetch - replace with real API call if needed
    const fetchOrganization = async () => {
      const mockResponse: OrganizationSchema = {
        domain: "testbyapi5.com",
        orgDisplayName: "testbyapi5",
        alternateEmail: "jatin11@mailyourprospecttest.com",
        primaryContactInfo: {
          email: "Ram.k@testbyapi5.com",
          firstName: "Ram",
          lastName: "K"
        }
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setOrganization(mockResponse);
    };

    fetchOrganization();
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Application</h1>
            <p className="text-slate-600 text-sm">
              View Application details and status
            </p>
          </div>
        </div>
{/* 
        {organization ? (
          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm max-w-xl">
            <CardContent className="p-6 space-y-2">
              <p><strong>Domain:</strong> {organization.domain}</p>
              <p><strong>Display Name:</strong> {organization.orgDisplayName}</p>
              <p><strong>Alternate Email:</strong> {organization.alternateEmail}</p>
              <p>
                <strong>Primary Contact:</strong>{" "}
                {organization.primaryContactInfo.firstName}{" "}
                {organization.primaryContactInfo.lastName} (
                {organization.primaryContactInfo.email})
              </p>
            </CardContent>
          </Card>
        ) : (
          <p className="text-slate-600">Loading organization info...</p>
        )} */}
      </div>
    </Layout>
  );
}
