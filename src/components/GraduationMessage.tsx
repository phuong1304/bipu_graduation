import { useState } from "react";
import gradPhoto from "../../assets/bipu.jpg";
import { Download } from "lucide-react";

export default function GraduationSection({
  friendlyName,
}: {
  friendlyName: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = gradPhoto;
    link.download = "Bipu_Graduation_Invite.jpg"; // tên file khi tải về
    link.click();
  };
  return (
    <section className="flex flex-col  items-center gap-4 lg:gap-12 max-w-6xl mx-auto px-2 py-4 sm:p-8">
      {/* Text nằm trên (mobile/tablet), bên trái (desktop) */}
      <div className="w-full text-sm sm:text-lg md:text-xl text-slate-700 leading-relaxed">
        <div
          className={`transition-all duration-500 ease-in-out text-base ${
            expanded
              ? "line-clamp-none"
              : "line-clamp-4 md:line-clamp-6 lg:line-clamp-12"
          }`}
        >
          Gửi đến <strong className="text-rose-500">{friendlyName}</strong> –
          một người đặc biệt đã từng, đang, hoặc có thể sắp bước qua cuộc hành
          trình của{" "}
          <span className="font-semibold text-indigo-600">Phương</span>. Dù
          chúng ta là bạn bè, đồng nghiệp, hay chỉ vừa quen biết, mỗi sự hiện
          diện và tình cảm của bạn đều là điều Phương vô cùng trân trọng.
          <br />
          <br />
          Phương xin mời bạn cùng chia sẻ khoảnh khắc tốt nghiệp – một dấu mốc
          khép lại thanh xuân và mở ra chặng đường mới, đầy hy vọng và yêu
          thương.
          <br />
          <br />
          Được nhìn thấy{" "}
          <span className="font-semibold text-rose-500">
            {friendlyName}
          </span>{" "}
          trong ngày ấy sẽ là món quà quý giá và ý nghĩa nhất đối với Phương.
          <br />
          <span className="block mt-4 text-indigo-600 font-medium text-center">
            🌸 Hãy trượt xuống bên dưới để gửi lời chúc, lời nhắn và xác nhận
            tham dự lễ tốt nghiệp của Phương nhé!
          </span>
        </div>

        {/* Nút toggle */}
        <div className="text-center mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
      </div>

      {/* Ảnh nằm dưới */}
      <div className="w-full flex flex-col items-center md:px-6">
        <img
          src={gradPhoto}
          alt="Vũ Thị Bích Phương"
          className="w-full h-auto object-cover rounded-lg shadow-lg border border-indigo-100"
        />

        {/* Nút tải ảnh */}
        <button
          onClick={handleDownload}
          className="mt-4 flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-500 to-rose-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-300"
        >
          <Download className="w-5 h-5" />
          Tải ảnh xuống
        </button>
      </div>
    </section>
  );
}
