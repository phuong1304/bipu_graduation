import { Users } from "lucide-react";
import { TimelineItem } from "../components/TimelineItem";

export default function GraduationTimeline() {
  return (
    <article className="relative bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100 shadow-lg overflow-hidden">
      <h3 className="text-lg font-semibold text-indigo-600 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Hành trình lễ
      </h3>

      <div className="space-y-0">
        <TimelineItem
          time="07:00 - 08:00"
          title="Khai mạc Convocation Day"
          description="Tổ chức tại sân trường Đại học FPT - Khu Công Nghệ Cao, mở đầu cho ngày lễ tốt nghiệp 2025."
        />
        <TimelineItem
          time="09:20 - 09:40"
          title="Check-in Tân cử nhân (Session 3)"
          description="Có mặt tại tầng 5 Hội trường A để điểm danh. Sau 09:40 sẽ đóng check-in."
          highlight
        />
        <TimelineItem
          time="09:40 - 10:20"
          title="Lễ trao bằng tốt nghiệp"
          description="Diễn ra tại tầng 5 Hội trường A (Lối vào tầng 5 – Lối ra tầng 4). Sau khi nhận bằng, Tân cử nhân nhận Graduated Kit & quà lưu niệm."
        />
        <TimelineItem
          time="08:00 - 09:10 · 10:30 - 14:00"
          title="Thời gian gặp gỡ & chụp ảnh cùng Phương"
          description="Khách mời có thể đến trong hai khung giờ này để chụp hình cùng Phương tại khuôn viên trường. Hãy liên hệ trước để Phương đón nhé!"
          highlight
        />
        <TimelineItem
          time="18:00 - 22:00"
          title="Tiệc thân mật cùng gia đình & bạn bè"
          description="Buổi tối ấm cúng, chia sẻ niềm vui và kỷ niệm đáng nhớ cùng gia đình, bạn bè thân thiết."
        />
      </div>
    </article>
  );
}
