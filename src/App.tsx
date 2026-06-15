import React, { useState } from "react";
import { MessageSquare, ShieldCheck, Heart, Facebook } from "lucide-react";
import Header from "./components/Header";
import CandidateForm from "./components/CandidateForm";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleToggleAdmin = () => {
    setIsAdminMode(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("prime_hr_admin_passcode");
    setIsAdminMode(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 antialiased font-sans text-slate-800 selection:bg-[#c5a880]/35 selection:text-[#0b192c]" id="app-root">
      
      {/* Prime Header */}
      <Header 
        isAdminMode={isAdminMode} 
        onToggleAdmin={handleToggleAdmin} 
        onLogout={handleLogout} 
      />

      {/* Main Container */}
      <main className="flex-grow">
        {isAdminMode ? (
          <AdminDashboard />
        ) : (
          <CandidateForm />
        )}
      </main>

      {/* Footer Section */}
      <footer className="bg-[#0b192c] text-gray-400 border-t border-[#c5a880]/15 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-right">
          
          {/* Company identity */}
          <div className="space-y-2">
            <h4 className="text-white text-lg font-bold flex items-center justify-center md:justify-start gap-2">
              <span className="text-[#c5a880] font-black">Prime HR Solutions</span>
            </h4>
            <p className="text-xs text-gray-400">
              Recruitment & HR Services | خدمات التوظيف والموارد البشرية الاحترافية
            </p>
            <p className="text-[11px] text-gray-500">
              جميع الحقوق محفوظة © {new Date().getFullYear()} Prime HR Solutions. 
            </p>
          </div>

          {/* Social connections & Privacy */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* Facebook direct link */}
            <a
              href="https://web.facebook.com/profile.php?id=61590515873645" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
              id="btn-facebook-page"
            >
              <Facebook className="w-4 h-4" />
              <span>صفحتنا على فيسبوك</span>
            </a>

            {/* Privacy handler */}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="text-xs text-gray-400 hover:text-white underline hover:no-underline transition-colors font-semibold"
              id="btn-privacy-policy"
            >
              سياسة الخصوصية وسرية البيانات
            </button>
            
          </div>

        </div>
      </footer>

      {/* Floating WhatsApp Action Trigger */}
      <a
        href="https://wa.me/201012702258?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20Prime%20HR%20Solutions%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%85%D8%B5%20%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D8%A8%D9%8A%D8%A7%D9%86%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AA%D9%88%D8%Bblocks"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-[0_4px_24px_rgba(16,185,129,0.4)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.6)] hover:scale-105 transition-all duration-300 animate-bounce group"
        title="تواصل معنا عبر واتساب"
        id="btn-whatsapp-floating"
      >
        <span className="absolute right-full mr-2 hidden group-hover:block bg-[#0b192c] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-md">
          تواصل معنا واتساب
        </span>
        {/* Simple WhatsApp-like SVG icon inside display bubble */}
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      </a>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-[#0b192c]/75 backdrop-blur-sm transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowPrivacyModal(false)}
            />

            {/* Modal helper for vertical alignment */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-3xl text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
              
              <div className="bg-gradient-to-r from-[#c5a880] to-[#b19165] px-6 py-4 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  سياسة خصوصية البيانات وسريتها - Prime HR
                </h3>
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="bg-black/20 hover:bg-black/40 text-white rounded-full p-1"
                >
                  <span className="sr-only">إغلاق</span>
                  ✕
                </button>
              </div>

              <div className="bg-white px-6 pt-5 pb-6 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-800 text-sm">التزامنا تجاه الباحثين عن عمل:</p>
                <p>
                  نهتم في شركة <strong>Prime HR Solutions</strong> التزاماً مطلقاً بحماية كامل سرية بياناتك الشخصية وحقوق الخصوصية التي تمت مشاركتها معنا من خلال هذه الاستمارة الالكترونية.
                </p>
                
                <h5 className="font-bold text-slate-800 text-[13px] pt-2 border-b border-gray-100 pb-1">1. جمع البيانات واستعمالها:</h5>
                <p>
                  تقتصر وتتحدد البيانات الشخصية التي نجمعها (كالاسم، الهاتف، السن، المحافظة، المؤهل الدراسي، والتعليم) بموجب الغرض الوحيد وهو تصنيف مؤهلاتك وتوجيه ترشيحها الملائم مع شواغر ووظائف الشركات المتعاقدة في مصر مجاناً.
                </p>

                <h5 className="font-bold text-slate-800 text-[13px] pt-2 border-b border-gray-100 pb-1">2. حظر مشاركتها لغير الشركاء:</h5>
                <p>
                  نتعهد بعدم تأجير، بيع أو مشاركة رقم هاتفك أو تفاصيل سيرتك الذاتية لجهات خارجية دعائية إطلاقاً. تداول سيرتك المهنية يتم تشفيره ليطلع عليه مدراء التوظيف المعتمدين والموثوقين داخل مصر فقط لغرض التعيين.
                </p>

                <h5 className="font-bold text-slate-800 text-[13px] pt-2 border-b border-gray-100 pb-1">3. حق التعديل والإزالة:</h5>
                <p>
                  لك الحق الكامل بالمطالبة بمسح كامل سجل المتقدم الخاص بك أو تعديله أو سحبه من قاعدة البيانات بمجرد إخطار أحد مسؤولي الدعم الفني لشركة Prime HR عبر قنواتنا المخصصة.
                </p>

                <p className="pt-4 text-[11px] text-gray-400 text-center">
                  أنت بمجرد "تسجيل البيانات" توافق على سياسات تنظيم وعرض السيرة الذاتية لدينا لترشيحك لأصحاب الأعمال. شكراً لثقتكم الغالية بنا.
                </p>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-5 py-2 bg-[#0b192c] hover:bg-[#c5a880] text-white hover:text-[#0b192c] text-xs font-bold rounded-xl transition-colors"
                >
                  لقد فهمت وأوافق
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
