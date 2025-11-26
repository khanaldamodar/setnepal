"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  designation: string;
  desc?: string | null;
  photo?: string | null;
}

export default function ViewMemberPage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const numericId = Number(id);
      const res = await axios.get(`/api/members/${numericId}`);
      console.log("Member response:", res.data);
      setMember(res.data); // <-- no .member
    } catch (error) {
      console.error("Failed to fetch member:", error);
      toast.error("Failed to load member details");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <p className="text-gray-500 p-6 text-center">Loading member details...</p>
    );

  if (!member)
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Member not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <User className="text-primary" /> {member.name}
          </h1>
        </div>
      </div>

      {/* Member Info Card */}
      <Card className="shadow-sm rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-xl">Member Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p>
              <strong>Email:</strong> {member.email}
            </p>
            <p>
              <strong>Phone:</strong> {member.phone}
            </p>
            <p>
              <strong>Designation:</strong> {member.designation}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {member.desc || "No description provided"}
            </p>
          </div>

          {/* Image */}
          <div className="flex justify-center items-center">
            {member.photo ? (
              <Image
                src={member.photo}
                alt={member.name}
                width={250}
                height={250}
                className="rounded-xl object-cover border"
              />
            ) : (
              <div className="w-64 h-64 bg-gray-100 flex flex-col items-center justify-center text-gray-400 rounded-xl">
                <User className="w-10 h-10 mb-2" />
                No Image
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
