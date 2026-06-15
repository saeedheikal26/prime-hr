import React, { useState, useRef } from "react";
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Award, 
  Briefcase, 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  X,
  ShieldCheck,
  Check,
  Building,
  Users,
  Search
} from "lucide-react";
import { GOVERNORATES, QUALIFICATIONS, EXPERIENCE_LEVELS, Candidate } from "../types";

export default function CandidateForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    age: "",
    governorate: "",
    qualification: "",
    specialization: "",
    experience: "",
    desiredTitle: ""
  });

  const [cvFile, setCvFile] = useState<{
    name: string;
    type: string;
    size: number;
    data: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Field change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Convert uploaded file to base64
  const handleFileProcess = (file: File) => {
    if (!file) return;

    // Validate size (max 8MB for performance and server limits)
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("حجم الملف كبير جداً. السقف الأقصى لملف السيرة الذاتية هو 8 ميجابايت.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setCvFile({
        name: file.name,
        type: file.type || "application/pdf",
        size: file.size,
        data: reader.result as string
      });
      setErrorMsg("");
    };
    reader.onerror = () => {
      console.error("Error reading file");
      setErrorMsg("حدث خطأ أثناء قراءة ملف السيرة الذاتية. يرجى تكرار المحاولة.");
    };
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeCvFile = () => {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Apply basic validation and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    // Validation
    const { fullName, phone, age, governorate, qualification, experience } = formData;
    if (!fullName.trim()) {
      setErrorMsg("يرجى إدخال الاسم الكامل ثنائياً أو ثلاثياً على الأقل.");
      setIsLoading(false);
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("يرجى إدخال رقم الهاتف للتواصل.");
      setIsLoading(false);
      return;
    }
    // Simple Egyptian mobile check (optional warning)
    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (phone.length < 10) {
      setErrorMsg("يرجى إدخال رقم هاتف صحيح ومكتمل.");
      setIsLoading(false);
      return;
    }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 16 || ageNum > 65) {
      setErrorMsg("يرجى إدخال سن واقعي للتقديم للعمل (بين 16 و 65 عاماً).");
      setIsLoading(false);
      return;
    }
    if (!governorate) {
      setErrorMsg("يرجى اختيار المحافظة المقيم بها.");
      setIsLoading(false);
      return;
    }
    if (!qualification) {
      setErrorMsg("يرجى اختيار مؤهلك الدراسي الحالي.");
      setIsLoading(false);
      return;
    }
    if (!experience) {
      setErrorMsg("يرجى تحديد سنوات الخبرة لديك.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          age: ageNum,
          cvFile: cvFile ? {
            name: cvFile.name,
            type: cvFile.type,
            size: cvFile.size,
            data: cvFile.data
          } : undefined
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "فشل تسجيل البيانات");
      }

      setSuccess(true);
      // Reset form on success
      setFormData({
        fullName: "",
        phone: "",
        age: "",
        governorate: "",
        qualification: "",
        specialization: "",
        experience: "",
        desiredTitle: ""
      });
      setCvFile(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "عذراً.. تعذر إرسال النموذج، يرجى التحقق من اتصالك بالشبكة وإعادة المحاولة.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#002B5B] via-[#001d3d] to-[#f8fafc] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-grid-[#C5A059]/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none opacity-45" />
        <div className="relative max-w-4xl mx-auto text-center" id="hero-content">
          
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] mb-6 animate-pulse">
            ✨ انضم إلى قاعدة البيانات الكبرى للتوظيف بمصر
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            🚀 فرص عمل حقيقية في شركات داخل مصر
          </h2>

          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed mb-10">
            سجل بياناتك الآن في قاعدة بيانات <strong className="text-[#C5A059] font-bold">Prime HR Solutions</strong> ليتم ترشيحك للوظائف المناسبة حسب مؤهلك وخبراتك.
          </p>

          <div className="flex justify-center gap-4">
            <a
              href="#registration-section"
              className="px-8 py-4 bg-[#C5A059] hover:bg-[#b08d48] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              سجل بياناتك الآن
            </a>
          </div>
        </div>
      </section>

      {/* Main Container for Benefits & Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Benefits Section - Left/Top on responsive */}
          <div className="lg:col-span-5 space-y-6">
            {/* Core Benefits Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-[#002B5B] pb-4 border-b border-gray-100 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-[#C5A059] rounded-full inline-block"></span>
                مزايا التسجيل معنا
              </h3>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3 bg-white p-4.5 rounded-xl border-r-4 border-[#C5A059] shadow-sm hover:translate-x-1 duration-250 transition-transform">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#C5A059]/15 text-[#C5A059] font-bold flex items-center justify-center text-sm">✓</span>
                  <div>
                    <h4 className="font-bold text-[#002B5B] text-sm sm:text-base">فرص عمل محدثة باستمرار</h4>
                    <p className="text-xs text-gray-500 mt-1">نقوم بضم مئات الوظائف الجديدة يومياً بمختلف التخصصات.</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-3 bg-white p-4.5 rounded-xl border-r-4 border-[#C5A059] shadow-sm hover:translate-x-1 duration-250 transition-transform">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#C5A059]/15 text-[#C5A059] font-bold flex items-center justify-center text-sm">✓</span>
                  <div>
                    <h4 className="font-bold text-[#002B5B] text-sm sm:text-base">ترشيح مباشر للشركات</h4>
                    <p className="text-xs text-gray-500 mt-1">سيرتك الذاتية تصل مباشرة لمديري الموارد البشرية بالشركاء.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3 bg-white p-4.5 rounded-xl border-r-4 border-[#C5A059] shadow-sm hover:translate-x-1 duration-250 transition-transform">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#C5A059]/15 text-[#C5A059] font-bold flex items-center justify-center text-sm">✓</span>
                  <div>
                    <h4 className="font-bold text-[#002B5B] text-sm sm:text-base">فرص لجميع المؤهلات والخبرات</h4>
                    <p className="text-xs text-gray-500 mt-1">نرحب بجميع المستويات الأكاديمية والمهنية بدءاً من الطلبة ومبتدئي الخبرة.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3 bg-white p-4.5 rounded-xl border-r-4 border-[#C5A059] shadow-sm hover:translate-x-1 duration-250 transition-transform">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#C5A059]/15 text-[#C5A059] font-bold flex items-center justify-center text-sm">✓</span>
                  <div>
                    <h4 className="font-bold text-[#002B5B] text-sm sm:text-base">متابعة مستمرة مع المرشحين</h4>
                    <p className="text-xs text-gray-500 mt-1">فريقنا يساندك ويوجهك خطوة بخطوة حتى تجاوز المقابلة والقبول الوظيفي.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3 bg-white p-4.5 rounded-xl border-r-4 border-[#C5A059] shadow-sm hover:translate-x-1 duration-250 transition-transform">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#C5A059]/15 text-[#C5A059] font-bold flex items-center justify-center text-sm">✓</span>
                  <div>
                    <h4 className="font-bold text-[#002B5B] text-sm sm:text-base">خدمات توظيف احترافية</h4>
                    <p className="text-xs text-gray-500 mt-1">التسجيل وصياغة السيرة الذاتية لدينا تقدم مجاناً للباحثين عن وظائف.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick Contact & Working Hours Support Card */}
            <div className="bg-gradient-to-br from-[#002B5B] to-[#001730] text-white p-6 rounded-2xl border-r-4 border-[#C5A059] shadow-md">
              <h4 className="font-bold text-[#C5A059] text-base mb-3">هل واجهت مشكلة في التسجيل؟</h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                فريق الدعم الفني متواجد لمساعدتك في رفع سيرتك الذاتية وتعديل نماذج التقديم طوال ساعات العمل الرسمية عبر واتساب.
              </p>
              <a
                href="https://wa.me/201012702258" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#C5A059] hover:bg-[#b08d48] px-5 py-2.5 rounded-full transition-all duration-200 shadow-md"
              >
                <span>تواصل معنا فوراً</span>
              </a>
            </div>
          </div>

          {/* Registration Form Column - Right/Bottom on responsive */}
          <div className="lg:col-span-7" id="registration-section">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl relative overflow-hidden flex flex-col">
              
              {/* Form Sleek Header Segment */}
              <div className="bg-[#002B5B] p-6 text-center shrink-0 border-b-4 border-[#C5A059]">
                <h3 className="text-xl font-bold text-white tracking-tight">استمارة تسجيل المرشحين</h3>
                <p className="text-white/80 text-xs mt-1.5 leading-relaxed">
                  يرجى ملء البيانات بدقة لضمان ترشيحك وتسهيل التواصل معك فوراً
                </p>
              </div>

              {/* Success Screen */}
              {success ? (
                <div className="py-16 px-6 text-center space-y-6 animate-fade-in" id="success-screen">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400 border-dashed animate-bounce">
                    <Check className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-[#002B5B]">✅ تم تسجيل بياناتك بنجاح.</h4>
                    <p className="text-slate-600 text-sm max-w-md mx-auto">
                      سيتم التواصل معك فوراً وتنسيق المقابلة بمجرد توفر وظائف شاغرة ملائمة لمؤهلاتك وخبراتك بمنطقتك الجغرافية.
                    </p>
                  </div>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2.5 bg-[#002B5B] hover:bg-[#C5A059] text-white text-sm font-bold rounded-full transition-all duration-300 shadow-md"
                  >
                    تسجيل نموذج جديد كلياً
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6" id="form-candidate-register">
                  
                  {/* Alert Msg */}
                  {errorMsg && (
                    <div className="p-4 bg-rose-50 border-r-4 border-rose-500 text-rose-850 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-2">
                      <span>⚠️ {errorMsg}</span>
                      <button type="button" onClick={() => setErrorMsg("")} className="text-rose-500 hover:text-rose-800">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#C5A059]" />
                        الاسم الكامل بالكامل <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="مثال: أحمد محمد محمود"
                        className="w-full text-right px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 outline-none text-sm bg-slate-50 transition-all text-slate-800"
                        id="input-fullname"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-[#C5A059]" />
                        رقم الهاتف الشخصي <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="مثال: 01012345678"
                        className="w-full text-left px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 outline-none text-sm bg-slate-50 transition-all text-slate-800"
                        dir="ltr"
                        id="input-phone"
                      />
                    </div>

                    {/* Age */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#C5A059]" />
                        السن الحالي (سنوات) <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        min="16"
                        max="65"
                        placeholder="مثال: 25"
                        className="w-full text-right px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 outline-none text-sm bg-slate-50 transition-all text-slate-800"
                        id="input-age"
                      />
                    </div>

                    {/* Governorate Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#C5A059]" />
                        المحافظة <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <select
                        name="governorate"
                        value={formData.governorate}
                        onChange={handleChange}
                        required
                        className="w-full text-right px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 outline-none text-sm transition-all text-slate-800 cursor-pointer"
                        id="select-governorate"
                      >
                        <option value="">-- اختر المحافظة --</option>
                        {GOVERNORATES.map(gov => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                    </div>

                    {/* Educational Qualification Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-[#C5A059]" />
                        المؤهل الدراسي <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <select
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        required
                        className="w-full text-right px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 outline-none text-sm transition-all text-slate-800 cursor-pointer"
                        id="select-qualification"
                      >
                        <option value="">-- اختر المؤهل الدراسي --</option>
                        {QUALIFICATIONS.map(qual => (
                          <option key={qual} value={qual}>{qual}</option>
                        ))}
                      </select>
                    </div>

                    {/* Specialization Field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#C5A059]" />
                        مجال التخصص
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="مثال: المحاسبة، خدمة العملاء، البرمجة..."
                        className="w-full text-right px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 outline-none text-sm bg-slate-50 transition-all text-slate-800"
                        id="input-specialization"
                      />
                    </div>

                    {/* Years of Experience Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-[#C5A059]" />
                        سنوات الخبرة <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                        className="w-full text-right px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 outline-none text-sm transition-all text-slate-800 cursor-pointer"
                        id="select-experience"
                      >
                        <option value="">-- اختر سنوات الخبرة --</option>
                        {EXPERIENCE_LEVELS.map(exp => (
                          <option key={exp} value={exp}>{exp}</option>
                        ))}
                      </select>
                    </div>

                    {/* Desired Job Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-[#C5A059]" />
                        المسمى الوظيفي المطلوب
                      </label>
                      <input
                        type="text"
                        name="desiredTitle"
                        value={formData.desiredTitle}
                        onChange={handleChange}
                        placeholder="مثال: محاسب مالي، موظف مبيعات، مهندس مدني"
                        className="w-full text-right px-4 py-2.5 border border-slate-200 rounded-lg focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 outline-none text-sm bg-slate-50 transition-all text-slate-800"
                        id="input-desiredtitle"
                      />
                    </div>

                  </div>

                  {/* Drag-and-Drop CV Upload area */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#C5A059]" />
                      إرفاق السيرة الذاتية (ملف PDF أو Word) <span className="text-xs text-gray-400">(اختياري)</span>
                    </label>
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                        dragActive 
                          ? "border-[#C5A059] bg-[#C5A059]/5" 
                          : cvFile 
                          ? "border-emerald-300 bg-emerald-50/20" 
                          : "border-slate-200 hover:border-[#C5A059]/60 bg-slate-50"
                      }`}
                      id="drop-holder"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ display: "none" }}
                      />

                      {cvFile ? (
                        <div className="flex flex-col items-center text-center space-y-2">
                          <CheckCircle className="w-9 h-9 text-emerald-500" />
                          <div>
                            <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[280px] sm:max-w-md">
                              {cvFile.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {(cvFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeCvFile}
                            className="text-[10px] font-semibold px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 rounded transition-transform duration-200"
                          >
                            إلغاء الملف الحاسم
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-2" onClick={triggerFileSelect}>
                          <UploadCloud className="w-10 h-10 text-[#C5A059]" />
                          <div>
                            <p className="text-xs font-bold text-slate-750">اسحب سيرتك الذاتية هنا أو اضغط للتصفح</p>
                            <p className="text-[10px] text-slate-400 mt-1">تنسيقات الملفات المقبولة: PDF or Word (بحجم أقصى 8MB)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submission Trigger */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-[#C5A059] text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-[#b08d48] transition-all text-lg mt-2 flex items-center justify-center gap-2 ${
                        isLoading ? "opacity-75 cursor-not-allowed" : "transform active:scale-[0.99]"
                      }`}
                      id="btn-register-submit"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>جاري تسجيل بياناتك...</span>
                        </>
                      ) : (
                        <span>تسجيل البيانات</span>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Trust Section */}
      <section className="bg-slate-50 border-y border-slate-200 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-black text-[#002B5B] tracking-tight">
              لماذا تسجل في Prime HR Solutions؟
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
              نوفر منظومة توظيف ذكية وموثوقة تضمن جودة الخدمة وخصوصية المستخدم.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 border-r-4 border-r-[#C5A059]">
              <span className="w-12 h-12 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-xl text-[#C5A059] font-bold">🏢</span>
              <div className="space-y-1">
                <h4 className="font-bold text-[#002B5B] text-sm sm:text-base">شركة متخصصة</h4>
                <p className="text-xs text-gray-400 leading-relaxed">خبرات متراكمة في التوظيف وإدارة وتطوير الموارد البشرية من الفئة "أ".</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 border-r-4 border-r-[#C5A059]">
              <span className="w-12 h-12 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-xl text-[#C5A059] font-bold">📈</span>
              <div className="space-y-1">
                <h4 className="font-bold text-[#002B5B] text-sm sm:text-base">قاعدة بيانات متنامية</h4>
                <p className="text-xs text-gray-400 leading-relaxed">تكامل واسع مع مئات الكيانات والشركات بمصر.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 border-r-4 border-r-[#C5A059]">
              <span className="w-12 h-12 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-xl text-[#C5A059] font-bold">🌟</span>
              <div className="space-y-1">
                <h4 className="font-bold text-[#002B5B] text-sm sm:text-base">فرص في كافة المجالات</h4>
                <p className="text-xs text-gray-400 leading-relaxed">وظائف إدارية، هندسية، مبيعات، عمالة وفنيين وغيرها.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 border-r-4 border-r-[#C5A059]">
              <span className="w-12 h-12 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-xl text-[#C5A059] font-bold">🔒</span>
              <div className="space-y-1">
                <h4 className="font-bold text-[#002B5B] text-sm sm:text-base">سرية وأمان البيانات</h4>
                <p className="text-xs text-gray-400 leading-relaxed">تشفير تام لبيانات الباحثين عن وظائف وسريتها بنسبة 100%.</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
