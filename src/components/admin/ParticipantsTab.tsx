import * as XLSX from "xlsx";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Loader, UserPlus, Edit3, Trash2 } from "lucide-react";
import {
  type ParticipantRecord,
  type ParticipantUpsertInput,
  upsertParticipant,
  deleteParticipants,
  getWishes,
  deleteWish,
} from "../../lib/supabase";

interface ParticipantsTabProps {
  participants: ParticipantRecord[];
  isLoading: boolean;
  onRefresh: () => Promise<void> | void;
}

export type RSVPFilter = "all" | "pending" | "yes" | "no";
type DinnerFilter = RSVPFilter | "not_invited";

const defaultForm: ParticipantUpsertInput & { id: string } = {
  id: "",
  username: "",
  display_name: "",
  salutation: "",
  invited_to_dinner: false,
};

export default function ParticipantsTab({
  participants,
  isLoading,
  onRefresh,
}: ParticipantsTabProps) {
  const [participantForm, setParticipantForm] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [filterText, setFilterText] = useState("");
  const [activeGroup, setActiveGroup] = useState<"invited" | "not_invited">(
    "invited"
  );
  const [ceremonyFilter, setCeremonyFilter] = useState<RSVPFilter>("all");
  const [dinnerFilter, setDinnerFilter] = useState<DinnerFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState("");
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [wishes, setWishes] = useState<
    {
      id: string;
      user_id?: string;
      name: string;
      message: string;
      created_at?: string;
    }[]
  >([]);

  const [isLoadingWishes, setIsLoadingWishes] = useState(false);

  const normalizedFilter = filterText.trim().toLowerCase();

  useEffect(() => {
    loadWishes();
  }, []);

  const loadWishes = async () => {
    try {
      setIsLoadingWishes(true);
      const data = await getWishes();
      // debugger;
      setWishes(data || []);
    } catch (err) {
      console.error("Error loading wishes:", err);
    } finally {
      setIsLoadingWishes(false);
    }
  };

  const filteredParticipants = useMemo<ParticipantRecord[]>(() => {
    return participants.filter((participant) => {
      const rsvp = participant.rsvp;
      const ceremonyState = getCeremonyState(rsvp);
      const dinnerState = getDinnerState(participant);

      const matchesGroup =
        activeGroup === "invited"
          ? participant.invited_to_dinner
          : !participant.invited_to_dinner;

      const matchesCeremony =
        ceremonyFilter === "all" || ceremonyFilter === ceremonyState;
      const matchesDinner =
        activeGroup === "invited"
          ? dinnerFilter === "all" || dinnerFilter === dinnerState
          : true;

      const matchesText =
        !normalizedFilter ||
        [
          participant.display_name,
          participant.salutation,
          participant.username,
          participant.email,
          rsvp?.name,
          rsvp?.email,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedFilter));

      return matchesGroup && matchesCeremony && matchesDinner && matchesText;
    });
  }, [
    participants,
    activeGroup,
    ceremonyFilter,
    dinnerFilter,
    normalizedFilter,
  ]);

  const visibleIds = filteredParticipants
    .map((p) => p.id)
    .filter((id): id is string => Boolean(id));
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const hasSelection = selectedIds.length > 0;

  const resetForm = () => {
    setParticipantForm(defaultForm);
    setMessage(null);
  };

  const handleParticipantSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const trimmedName = participantForm.display_name.trim();
    const trimmedSalutation = participantForm.salutation?.trim() || "";
    const generatedUsername =
      participantForm.username.trim() ||
      generateUsernameFromName(trimmedName || "");

    if (!generatedUsername || !trimmedName) {
      setMessage({
        type: "error",
        text: "Vui long dien username (hoac ten) va ten hien thi",
      });
      return;
    }

    try {
      setIsSaving(true);
      await upsertParticipant({
        id: participantForm.id || undefined,
        username: generatedUsername,
        display_name: trimmedName,
        salutation: trimmedSalutation,
        invited_to_dinner: participantForm.invited_to_dinner,
      });
      setMessage({ type: "success", text: "Da luu thong tin nguoi tham gia" });
      resetForm();
      await onRefresh();
    } catch (err) {
      const text =
        err instanceof Error ? err.message : "Khong the luu nguoi tham gia";
      setMessage({ type: "error", text });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditParticipant = (participant: ParticipantRecord) => {
    setParticipantForm({
      id: participant.id || "",
      username: participant.username || "",
      display_name: participant.display_name || "",
      salutation: participant.salutation || "",
      invited_to_dinner: participant.invited_to_dinner ?? false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteParticipant = async (participant: ParticipantRecord) => {
    if (!participant.id) return;
    const confirmed = window.confirm(
      `Ban chac chan muon xoa ${
        participant.display_name || participant.username
      }?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(participant.id);
      setMessage(null);
      await deleteParticipants([participant.id]);
      if (participantForm.id === participant.id) {
        resetForm();
      }
      setSelectedIds((prev) => prev.filter((id) => id !== participant.id));
      setMessage({ type: "success", text: "Da xoa nguoi tham gia" });
      await onRefresh();
    } catch (err) {
      const text =
        err instanceof Error ? err.message : "Khong the xoa nguoi tham gia";
      setMessage({ type: "error", text });
    } finally {
      setDeletingId("");
    }
  };

  const toggleSelection = (id?: string) => {
    if (!id) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const toggleSelectVisible = () => {
    if (visibleIds.length === 0) return;
    setSelectedIds((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds]))
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(
      `Ban chac chan muon xoa ${selectedIds.length} nguoi da chon?`
    );
    if (!confirmed) return;

    try {
      setIsBulkDeleting(true);
      setMessage(null);
      await deleteParticipants(selectedIds);
      clearSelection();
      setMessage({ type: "success", text: "Da xoa nguoi tham gia da chon" });
      await onRefresh();
    } catch (err) {
      const text =
        err instanceof Error ? err.message : "Khong the xoa nguoi da chon";
      setMessage({ type: "error", text });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setMessage(null);
      setIsSaving(true);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as {
        username: string;
        display_name: string;
        salutation?: string;
        invited_to_dinner?: string | number | boolean;
      }[];

      // ⚙️ Chuẩn hóa dữ liệu
      const cleaned = jsonData
        .filter((r) => r.username && r.display_name)
        .map((r) => ({
          username: String(r.username).trim(),
          display_name: String(r.display_name).trim(),
          salutation: r.salutation ? String(r.salutation).trim() : "",
          invited_to_dinner:
            String(r.invited_to_dinner).toLowerCase() === "true" ||
            String(r.invited_to_dinner) === "1",
        }));

      // ⚙️ Lọc trùng trong file Excel (chỉ lấy dòng đầu tiên)
      const uniqueFileMap = new Map();
      cleaned.forEach((row) => {
        if (!uniqueFileMap.has(row.username)) {
          uniqueFileMap.set(row.username, row);
        }
      });
      const uniqueFileData = Array.from(uniqueFileMap.values());

      // ⚙️ Lấy danh sách username có sẵn trong DB
      const existingUserMap = new Map(participants.map((p) => [p.username, p]));

      let addedCount = 0;
      let updatedCount = 0;

      // ⚙️ Lặp qua từng dòng và xử lý thêm / cập nhật
      for (const u of uniqueFileData) {
        const existing = existingUserMap.get(u.username);

        await upsertParticipant({
          id: existing?.id, // có id thì GORM update, không thì insert
          username: u.username,
          display_name: u.display_name,
          salutation: u.salutation,
          invited_to_dinner: u.invited_to_dinner,
        });

        if (existing) updatedCount++;
        else addedCount++;
      }

      // ⚙️ Thông báo kết quả
      setMessage({
        type: "success",
        text: `✅ Đã xử lý ${uniqueFileData.length} dòng từ Excel: 
        ${addedCount} mới, ${updatedCount} cập nhật.`,
      });

      await onRefresh();
    } catch (err) {
      console.error("Error uploading Excel:", err);
      setMessage({
        type: "error",
        text: "⚠️ Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng cột.",
      });
    } finally {
      setIsSaving(false);
      e.target.value = ""; // reset input
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-800">
              Tạo / Chỉnh sửa người tham gia
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* 🔹 Nút tải file mẫu */}
            <a
              href="D:/nhà/Us/bipu_graduation/assets/file_template/participants_template.xlsx"
              download
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-semibold text-sm hover:bg-blue-100 transition"
            >
              📄 Tải file mẫu
            </a>

            {/* 🔹 Nút upload Excel */}
            <label className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl cursor-pointer hover:bg-green-100 transition">
              <span className="text-sm font-semibold text-green-700">
                📥 Upload Excel
              </span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <form
          onSubmit={handleParticipantSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Ten hien thi *
            </label>
            <input
              type="text"
              value={participantForm.display_name}
              onChange={(e) =>
                setParticipantForm((prev) => ({
                  ...prev,
                  display_name: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="Vi du: Hoang Minh Nhut"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Danh xung
            </label>
            <input
              type="text"
              value={participantForm.salutation}
              onChange={(e) =>
                setParticipantForm((prev) => ({
                  ...prev,
                  salutation: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="Vi du: Anh, Chi, Ban..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Username
            </label>
            <input
              type="text"
              value={participantForm.username}
              onChange={(e) =>
                setParticipantForm((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="Vi du: hainv (se tu sinh neu de trong)"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 md:col-span-2">
            <input
              type="checkbox"
              checked={participantForm.invited_to_dinner}
              onChange={(e) =>
                setParticipantForm((prev) => ({
                  ...prev,
                  invited_to_dinner: e.target.checked,
                }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Moi du tiec an toi
          </label>
          <div className="flex items-center gap-3 md:justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Lam moi
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {participantForm.id ? "Cap nhat" : "Them nguoi"}
            </button>
          </div>
        </form>
        {message && (
          <div
            className={`mt-4 p-3 rounded-xl text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-600 border border-red-100"
                : "bg-green-50 text-green-700 border border-green-100"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-800">
              Danh sách người tham gia
            </h3>
          </div>

          {/* 🔁 Nút tải lại danh sách */}
          <button
            type="button"
            onClick={() => {
              onRefresh();
              loadWishes();
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition disabled:opacity-50 text-sm font-medium"
          >
            <Loader
              className={`w-4 h-4 ${
                isLoading ? "animate-spin text-indigo-500" : "text-slate-500"
              }`}
            />
            <span>Tải lại</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-4">
          <div className="flex flex-col gap-3 mb-4">
            <div className="inline-flex rounded-full bg-slate-100 p-1 shadow-inner w-fit">
              {[
                { key: "invited", label: "Duoc moi du tiec" },
                { key: "not_invited", label: "Khong moi du tiec" },
              ].map((group) => (
                <button
                  key={group.key}
                  onClick={() => {
                    setActiveGroup(group.key as "invited" | "not_invited");
                    setDinnerFilter("all");
                    setCeremonyFilter("all");
                    clearSelection();
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    activeGroup === group.key
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Tim kiem
                </label>
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => {
                    setFilterText(e.target.value);
                    clearSelection();
                  }}
                  placeholder="Ten, username hoac email..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
              <FilterSelect
                label="Trang thai le"
                value={ceremonyFilter}
                onChange={setCeremonyFilter}
              >
                <option value="all">Tat ca</option>
                <option value="pending">Chua phan hoi</option>
                <option value="yes">Tham gia</option>
                <option value="no">Khong tham gia</option>
              </FilterSelect>

              {activeGroup === "invited" && (
                <FilterSelect
                  label="Trang thai tiec"
                  value={dinnerFilter}
                  onChange={setDinnerFilter}
                >
                  <option value="all">Tat ca</option>
                  <option value="pending">Chua phan hoi</option>
                  <option value="yes">Tham gia tiec</option>
                  <option value="no">Khong tham gia tiec</option>
                </FilterSelect>
              )}
            </div>
          </div>

          {hasSelection && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-600 font-semibold">
                {selectedIds.length} nguoi duoc chon
              </span>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Xoa da chon
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="text-sm text-gray-600 font-semibold hover:text-gray-900"
              >
                Huy chon
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <LoaderState />
        ) : participants.length === 0 ? (
          <p className="text-sm text-gray-500">
            Chua co nguoi tham gia nao trong danh sach.
          </p>
        ) : filteredParticipants.length === 0 ? (
          <p className="text-sm text-gray-500">Khong tim thay nguoi phu hop.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-gray-700">
                  <th className="px-4 py-2 text-center w-12">
                    <input
                      type="checkbox"
                      onChange={toggleSelectVisible}
                      checked={visibleIds.length > 0 && allVisibleSelected}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-2 text-left">Ho ten</th>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Lời chúc</th>

                  <th className="px-4 py-2 text-center">Trang thai le</th>
                  {activeGroup === "invited" && (
                    <th className="px-4 py-2 text-center">Trang thai tiec</th>
                  )}
                  {!hasSelection && (
                    <th className="px-4 py-2 text-right">Thao tac</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant) => {
                  const ceremonyStatus = getCeremonyBadge(participant.rsvp);
                  const dinnerStatus = getDinnerBadge(participant);
                  const participantId = participant.id;
                  const isSelected = participantId
                    ? selectedIds.includes(participantId)
                    : false;
                  return (
                    <tr
                      key={participant.id || participant.email}
                      className="border-b last:border-none"
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          disabled={!participantId}
                          checked={isSelected}
                          onChange={() => toggleSelection(participantId)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {participant.display_name || participant.username}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {participant.username}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {(() => {
                          const userWishes = wishes.filter(
                            (wish) =>
                              wish?.user_id?.trim().toLowerCase() ===
                              (participant.id || "").trim().toLowerCase()
                          );

                          if (userWishes.length === 0)
                            return (
                              <span className="text-gray-400 italic text-sm">
                                Chưa có lời chúc
                              </span>
                            );

                          return (
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              {userWishes.map((wish) => (
                                <li
                                  key={wish.id}
                                  className="flex items-center justify-between leading-snug group"
                                >
                                  <span>{wish.message}</span>
                                  <button
                                    onClick={async () => {
                                      const confirmDelete = window.confirm(
                                        "Bạn có chắc muốn xoá lời chúc này?"
                                      );
                                      if (!confirmDelete) return;
                                      try {
                                        if (!wish.id) {
                                          console.error(
                                            "⚠️ Wish ID bị thiếu, không thể xoá."
                                          );
                                          return;
                                        }
                                        // debugger;
                                        await deleteWish(wish.id);

                                        // const res = await deleteWish(wish.id!);
                                        // debugger;
                                        await loadWishes();
                                      } catch (err) {
                                        alert(
                                          "Không thể xoá lời chúc. Vui lòng thử lại!"
                                        );
                                        console.error(err);
                                      }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 ml-2 text-rose-500 hover:text-rose-700 transition text-xs font-semibold"
                                    title="Xóa lời chúc"
                                  >
                                    Xóa
                                  </button>
                                </li>
                              ))}
                            </ul>
                          );
                        })()}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${ceremonyStatus.className}`}
                        >
                          {ceremonyStatus.label}
                        </span>
                      </td>
                      {activeGroup === "invited" && (
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${dinnerStatus.className}`}
                          >
                            {dinnerStatus.label}
                          </span>
                        </td>
                      )}
                      {!hasSelection && (
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditParticipant(participant)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                          >
                            <Edit3 className="w-4 h-4" />
                            Chinh sua
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteParticipant(participant)}
                            disabled={deletingId === participant.id}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xoa
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const LoaderState = () => (
  <div className="text-center py-12">
    <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
    <p className="text-gray-600">Dang tai du lieu...</p>
  </div>
);

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1 block">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {children}
      </select>
    </div>
  );
}

function getCeremonyState(rsvp?: ParticipantRecord["rsvp"]): RSVPFilter {
  if (
    !rsvp ||
    typeof rsvp.will_attend === "undefined" ||
    rsvp.will_attend === null
  ) {
    return "pending";
  }
  return rsvp.will_attend ? "yes" : "no";
}

function getDinnerState(
  participant: ParticipantRecord
): RSVPFilter | "not_invited" {
  if (!participant.invited_to_dinner) return "not_invited";
  const rsvp = participant.rsvp;
  if (
    !rsvp ||
    typeof rsvp.will_attend_dinner === "undefined" ||
    rsvp.will_attend_dinner === null
  ) {
    return "pending";
  }
  return rsvp.will_attend_dinner ? "yes" : "no";
}

function getCeremonyBadge(rsvp?: ParticipantRecord["rsvp"]) {
  const state = getCeremonyState(rsvp);
  if (state === "yes")
    return { label: "Tham gia", className: "bg-green-100 text-green-700" };
  if (state === "no")
    return { label: "Khong tham gia", className: "bg-rose-100 text-rose-700" };
  return { label: "Chua phan hoi", className: "bg-gray-100 text-gray-600" };
}

function getDinnerBadge(participant: ParticipantRecord) {
  const state = getDinnerState(participant);
  if (state === "yes")
    return { label: "Tham gia tiec", className: "bg-amber-100 text-amber-700" };
  if (state === "no")
    return { label: "Khong tham gia", className: "bg-rose-100 text-rose-700" };
  if (state === "not_invited")
    return { label: "Khong moi", className: "bg-slate-100 text-slate-500" };
  return { label: "Chua phan hoi", className: "bg-gray-100 text-gray-600" };
}

function generateUsernameFromName(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();

  if (!normalized) return "";

  const parts = normalized.split(/\s+/).filter(Boolean);
  const last = parts.pop() || "";
  const initials = parts.map((part) => part.charAt(0)).join("");
  const candidate = (last + initials).replace(/[^a-z0-9]/g, "");

  return candidate || normalized.replace(/\s+/g, "");
}
