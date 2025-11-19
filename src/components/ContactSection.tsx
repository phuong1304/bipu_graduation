import { Globe, MessageCircle, Camera } from "lucide-react";

export default function ContactSection() {
  const socials = [
    {
      name: "Facebook",
      icon: <Globe className="w-5 h-5 text-blue-600" />, // 🌐 tượng trưng cho mạng xã hội
      url: "https://www.facebook.com/bichphuong1304",
      color: "from-blue-50 to-white hover:from-blue-100 hover:to-blue-50",
    },
    {
      name: "Instagram",
      icon: <Camera className="w-5 h-5 text-pink-500" />, // 📷 tượng trưng cho Insta
      url: "https://www.instagram.com/bipu1304?igsh=MXEwaGhtZnc1bWxwMA%3D%3D&utm_source=qr",
      color: "from-pink-50 to-white hover:from-pink-100 hover:to-pink-50",
    },
    {
      name: "Zalo",
      icon: <MessageCircle className="w-5 h-5 text-sky-500" />, // 💬 Zalo/Chat
      url: "https://zalo.me/0984135344",
      color: "from-sky-50 to-white hover:from-sky-100 hover:to-sky-50",
    },
  ];

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        🌐 Kết nối cùng Phương
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm sm:text-base">
        {socials.map((social, index) => (
          <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 rounded-xl border border-slate-100 px-4 py-3 bg-gradient-to-r ${social.color} transition-all hover:scale-[1.03] shadow-sm`}
          >
            {social.icon}
            <span className="font-medium text-slate-800">{social.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
