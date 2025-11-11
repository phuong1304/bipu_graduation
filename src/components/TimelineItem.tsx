interface TimelineItemProps {
  time: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export const TimelineItem = ({
  time,
  title,
  description,
  highlight = false,
}: TimelineItemProps) => {
  return (
    <div className="relative pl-[20px]">
      {/* Đường dọc timeline */}
      <div className="absolute left-[10px] top-0 bottom-0 w-[2px] bg-indigo-100 h-[120%]" />

      {/* Chấm tròn timeline */}
      <div className="absolute left-[5px] top-[1.15rem] w-3 h-3 bg-indigo-400 rounded-full border-2 border-white shadow-sm"></div>

      {/* Cấu trúc 2 cột: thời gian + nội dung */}
      <div
        className={`flex flex-col gap-2 items-start my-4 ${
          highlight ? "bg-indigo-50/70 rounded-xl p-3" : "p-2"
        }`}
      >
        {/* Cột thời gian */}
        <div className="flex flex-col items-start justify-center text-left text-xs sm:text-sm text-indigo-600 font-semibold font-mono leading-tight min-w-[90px]">
          {time.split("·").map((t, idx) => (
            <span key={idx}>{t.trim()}</span>
          ))}
        </div>

        {/* Cột nội dung */}
        <div className="flex flex-col gap-1 text-slate-700 leading-snug">
          <h4
            className={`font-semibold ${
              highlight ? "text-indigo-700" : "text-slate-800"
            }`}
          >
            {title}
          </h4>
          <p className="text-slate-500 text-xz sm:text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};
