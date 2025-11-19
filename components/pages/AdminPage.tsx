'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Users, AlertCircle, RefreshCcw } from "lucide-react";
import type { RSVPResponse, ParticipantRecord } from "@/lib/supabase/types";
import { getRSVPResponses } from "@/app/actions/rsvp";
import { getParticipants } from "@/app/actions/participants";
import { logout } from "@/app/actions/auth";
import DashboardTab from "@/components/admin/DashboardTab";
import ParticipantsTab from "@/components/admin/ParticipantsTab";

interface AdminPageProps { }

export default function AdminPage({ }: AdminPageProps) {
  const router = useRouter();
  const [rsvpList, setRsvpList] = useState<RSVPResponse[]>([]);
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [isLoadingRSVP, setIsLoadingRSVP] = useState(true);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [error, setError] = useState("");
  const [participantsError, setParticipantsError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "participants">(
    "dashboard"
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    void loadRSVPData();
    void loadParticipants();
  }, []);

  const loadRSVPData = async () => {
    try {
      setIsLoadingRSVP(true);
      setError("");
      const data = await getRSVPResponses();
      setRsvpList(data || []);
    } catch (err) {
      setError("Khong the tai du lieu. Vui long thu lai!");
      console.error(err);
    } finally {
      setIsLoadingRSVP(false);
    }
  };

  const handleReload = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([loadRSVPData(), loadParticipants()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadParticipants = async () => {
    try {
      setIsLoadingParticipants(true);
      setParticipantsError("");
      const data = await getParticipants();
      setParticipants(data || []);
    } catch (err) {
      setParticipantsError("Khong the tai danh sach nguoi tham gia");
      console.error(err);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const ceremonyYes = useMemo(
    () =>
      participants.filter(
        (participant) => participant.rsvp?.will_attend === true
      ),
    [participants]
  );
  const ceremonyNo = useMemo(
    () =>
      participants.filter(
        (participant) => participant.rsvp?.will_attend === false
      ),
    [participants]
  );
  const ceremonyPending = useMemo(
    () =>
      participants.filter(
        (participant) =>
          !participant.rsvp ||
          typeof participant.rsvp.will_attend === "undefined" ||
          participant.rsvp.will_attend === null
      ),
    [participants]
  );

  const dinnerYesParticipants = useMemo(
    () =>
      participants.filter(
        (participant) =>
          participant.invited_to_dinner &&
          participant.rsvp?.will_attend_dinner === true
      ),
    [participants]
  );
  const dinnerNoParticipants = useMemo(
    () =>
      participants.filter(
        (participant) =>
          participant.invited_to_dinner &&
          participant.rsvp?.will_attend_dinner === false
      ),
    [participants]
  );
  const dinnerPendingParticipants = useMemo(
    () =>
      participants.filter(
        (participant) =>
          participant.invited_to_dinner &&
          (!participant.rsvp ||
            typeof participant.rsvp.will_attend_dinner === "undefined" ||
            participant.rsvp.will_attend_dinner === null)
      ),
    [participants]
  );
  const dinnerNotInvitedParticipants = useMemo(
    () => participants.filter((participant) => !participant.invited_to_dinner),
    [participants]
  );

  const totalConfirmed = ceremonyYes.length;
  const totalDeclined = ceremonyNo.length;
  const totalPending = ceremonyPending.length;
  const totalResponses = totalConfirmed + totalDeclined;
  const totalAttending = ceremonyYes.reduce((sum) => sum, 0);
  const dinnerYes = dinnerYesParticipants.length;
  const attendanceRate =
    totalResponses > 0
      ? Math.round((totalConfirmed / totalResponses) * 100)
      : 0;
  const recentUpdates = useMemo(
    () =>
      [...rsvpList]
        .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
        .slice(0, 5),
    [rsvpList]
  );
  const totalParticipants = participants.length;
  const ceremonyInviteCount = ceremonyYes.length;
  const dinnerInviteCount = dinnerYes;
  const dinnerInviteesCount = participants.filter(
    (p) => p.invited_to_dinner
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 overflow-hidden relative p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={async () => {
            await logout();
            router.refresh();
          }}
          className="mb-8 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Dang xuat
        </button>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border-4 border-white/50">
          <div className="p-8 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-800">
                  Quan tri tham du le tot nghiep
                </h1>
              </div>
              <button
                onClick={handleReload}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-blue-600 font-semibold shadow hover:bg-blue-50 disabled:opacity-60"
              >
                <RefreshCcw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Tai lai
              </button>
            </div>
            <p className="text-gray-600">
              Theo doi trang thai khach moi va danh sach chi tiet
            </p>

            <div className="mt-6 inline-flex rounded-full bg-white/70 p-1 shadow-inner">
              {[
                { key: "dashboard", label: "Dashboard tong quan" },
                { key: "participants", label: "Quan ly nguoi tham gia" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() =>
                    setActiveTab(tab.key as "dashboard" | "participants")
                  }
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeTab === tab.key
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {activeTab === "dashboard" ? (
              <DashboardTab
                totalResponses={totalResponses}
                totalConfirmed={totalConfirmed}
                totalDeclined={totalDeclined}
                totalPending={totalPending}
                totalAttending={totalAttending}
                attendanceRate={attendanceRate}
                ceremonyInviteCount={ceremonyInviteCount}
                dinnerInviteCount={dinnerInviteCount}
                totalParticipants={totalParticipants}
                dinnerInviteesCount={dinnerInviteesCount}
                ceremonyYes={ceremonyYes}
                ceremonyNo={ceremonyNo}
                ceremonyPending={ceremonyPending}
                dinnerYesParticipants={dinnerYesParticipants}
                dinnerNoParticipants={dinnerNoParticipants}
                dinnerPendingParticipants={dinnerPendingParticipants}
                dinnerNotInvitedParticipants={dinnerNotInvitedParticipants}
                recentUpdates={recentUpdates}
                formatDate={formatDate}
              />
            ) : (
              <>
                {participantsError && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-100 text-sm text-amber-700 rounded-xl">
                    {participantsError}
                  </div>
                )}
                <ParticipantsTab
                  participants={participants}
                  isLoading={isLoadingParticipants || isLoadingRSVP}
                  onRefresh={loadParticipants}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
