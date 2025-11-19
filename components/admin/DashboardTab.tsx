import { CalendarCheck2, PieChart, TrendingUp, Users, BarChart2, AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RSVPResponse, ParticipantRecord } from "@/lib/supabase/types";

interface DashboardTabProps {
  totalResponses: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPending: number;
  totalAttending: number;
  attendanceRate: number;
  ceremonyInviteCount: number;
  dinnerInviteCount: number;
  totalParticipants: number;
  dinnerInviteesCount: number;
  ceremonyYes: ParticipantRecord[];
  ceremonyNo: ParticipantRecord[];
  ceremonyPending: ParticipantRecord[];
  dinnerYesParticipants: ParticipantRecord[];
  dinnerNoParticipants: ParticipantRecord[];
  dinnerPendingParticipants: ParticipantRecord[];
  dinnerNotInvitedParticipants: ParticipantRecord[];
  recentUpdates: RSVPResponse[];
  formatDate: (value: string) => string;
}

export default function DashboardTab({
  totalResponses,
  totalConfirmed,
  totalDeclined,
  totalPending,
  totalAttending,
  attendanceRate,
  ceremonyInviteCount,
  dinnerInviteCount,
  totalParticipants,
  dinnerInviteesCount,
  ceremonyYes,
  ceremonyNo,
  ceremonyPending,
  dinnerYesParticipants,
  dinnerNoParticipants,
  dinnerPendingParticipants,
  dinnerNotInvitedParticipants,
  recentUpdates,
  formatDate
}: DashboardTabProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <DashboardCard icon={<Users className="w-6 h-6" />} title="Tong phan hoi" value={totalResponses} color="from-sky-500/15 to-sky-500/5" />
        <DashboardCard
          icon={<CalendarCheck2 className="w-6 h-6" />}
          title="Tham gia"
          value={totalConfirmed}
          subText={`${totalAttending} khach du kien`}
          color="from-green-500/15 to-green-500/5"
        />
        <DashboardCard icon={<BarChart2 className="w-6 h-6" />} title="Khong tham gia" value={totalDeclined} color="from-rose-500/15 to-rose-500/5" />
        <DashboardCard icon={<AlertCircle className="w-6 h-6" />} title="Chua phan hoi" value={totalPending} color="from-amber-500/15 to-amber-500/5" />
        <DashboardCard icon={<TrendingUp className="w-6 h-6" />} title="Ti le tham du" value={`${attendanceRate}%`} color="from-purple-500/15 to-purple-500/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardCard icon={<Users className="w-6 h-6" />} title="Nguoi du le tot nghiep" value={ceremonyInviteCount} color="from-indigo-500/15 to-indigo-500/5" />
        <DashboardCard icon={<BarChart2 className="w-6 h-6" />} title="Nguoi du tiec toi" value={dinnerInviteCount} color="from-amber-500/15 to-amber-500/5" />
        <DashboardCard icon={<Users className="w-6 h-6" />} title="Tong nguoi dung" value={totalParticipants} color="from-slate-500/15 to-slate-500/5" />
        <DashboardCard icon={<Users className="w-6 h-6" />} title="Nguoi du ca le & tiec" value={dinnerInviteesCount} color="from-emerald-500/15 to-emerald-500/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-inner">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-800">Phan bo trang thai</h3>
          </div>
          {totalResponses === 0 ? (
            <p className="text-sm text-gray-500">Chua co du lieu.</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Tham gia', value: totalConfirmed, color: 'bg-green-500' },
                { label: 'Khong tham gia', value: totalDeclined, color: 'bg-rose-500' }
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: totalResponses === 0 ? '0%' : `${(value / totalResponses) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-inner">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-800">Cap nhat gan day</h3>
          </div>
          {recentUpdates.length === 0 ? (
            <p className="text-sm text-gray-500">Chua co du lieu.</p>
          ) : (
            <ul className="space-y-3">
              {recentUpdates.map((rsvp) => (
                <li key={rsvp.id} className="flex items-center justify-between text-sm text-gray-700">
                  <div>
                    <p className="font-semibold text-gray-800">{rsvp.name}</p>
                    <p className="text-xs text-gray-500">{rsvp.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${rsvp.will_attend ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                        }`}
                    >
                      {rsvp.will_attend ? 'Co mat' : 'Vang'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{rsvp.created_at ? formatDate(rsvp.created_at) : '-'}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <StatusGroup
        title="Trang thai le tot nghiep"
        statuses={[
          { label: 'Tham gia', items: ceremonyYes, color: 'bg-green-100 text-green-700' },
          { label: 'Khong tham gia', items: ceremonyNo, color: 'bg-rose-100 text-rose-700' },
          { label: 'Chua phan hoi', items: ceremonyPending, color: 'bg-gray-100 text-gray-600' }
        ]}
      />

      <StatusGroup
        title="Trang thai tiec toi"
        statuses={[
          { label: 'Tham gia tiec', items: dinnerYesParticipants, color: 'bg-amber-100 text-amber-700' },
          { label: 'Khong tham gia tiec', items: dinnerNoParticipants, color: 'bg-slate-200 text-slate-700' },
          { label: 'Chua phan hoi', items: dinnerPendingParticipants, color: 'bg-gray-100 text-gray-600' },
          { label: 'Khong moi', items: dinnerNotInvitedParticipants, color: 'bg-slate-100 text-slate-500' }
        ]}
      />
    </div>
  );
}

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  color: string;
  subText?: string;
}

function DashboardCard({ icon, title, value, color, subText }: DashboardCardProps) {
  return (
    <div className={`p-5 rounded-2xl border border-white shadow-sm bg-gradient-to-br ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subText && <p className="text-xs text-gray-500 mt-1">{subText}</p>}
        </div>
        <div className="p-3 bg-white/80 rounded-2xl text-blue-600">{icon}</div>
      </div>
    </div>
  );
}

interface StatusGroupProps {
  title: string;
  statuses: Array<{
    label: string;
    items: ParticipantRecord[];
    color: string;
  }>;
}

function StatusGroup({ title, statuses }: StatusGroupProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-inner">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-500">Cap nhat tu danh sach nguoi tham gia</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statuses.map((status) => (
          <StatusList key={status.label} {...status} />
        ))}
      </div>
    </div>
  );
}

interface StatusListProps {
  label: string;
  items: ParticipantRecord[];
  color: string;
}

function StatusList({ label, items, color }: StatusListProps) {
  const displayItems = items.slice(0, 6);
  const remaining = items.length - displayItems.length;

  return (
    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${color}`}>
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Chua co du lieu</p>
      ) : (
        <ul className="space-y-2 text-sm text-gray-700">
          {displayItems.map((participant) => (
            <li key={participant.id || participant.username} className="flex flex-col border-b border-white/60 pb-1.5 last:border-b-0">
              <span className="font-semibold text-gray-800">{participant.display_name || participant.username}</span>
              <span className="text-xs text-gray-500">{participant.username}</span>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <p className="text-xs text-gray-500 mt-3">+{remaining} nguoi khac</p>
      )}
    </div>
  );
}
