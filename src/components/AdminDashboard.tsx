import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  FileText, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Briefcase, 
  RefreshCw,
  Users,
  CheckCircle,
  FileDown,
  ChevronDown,
  XCircle,
  User,
  Info
} from "lucide-react";
import { Candidate, GOVERNORATES, QUALIFICATIONS, EXPERIENCE_LEVELS } from "../types";

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [operationMsg, setOperationMsg] = useState("");

  // Filters state
  const [filters, setFilters] = useState({
    searchTerm: "",
    specialization: "",
    governorate: "",
    experience: "",
    qualification: ""
  });

  // Load passcode from local storage to keep session persistent
  useEffect(() => {
    const savedCode = localStorage.getItem("prime_hr_admin_passcode");
    if (savedCode) {
      verifyPasscodeOnClient(savedCode);
    }
  }, []);

  const verifyPasscodeOnClient = async (codeToVerify: string) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const response = await fetch(`/api/candidates?passcode=${encodeURIComponent(codeToVerify)}`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
        setIsAuthorized(true);
        localStorage.setItem("prime_hr_admin_passcode", codeToVerify);
        setPasscode(codeToVerify);
      } else {
        const errorData = await response.json();
        setAuthError(errorData.error || "رمز المرور غير صحيح. يرجى إدخال الصيغة السليمة.");
        setIsAuthorized(false);
        localStorage.removeItem("prime_hr_admin_passcode");
      }
    } catch (err) {
      console.error(err);
      setAuthError("فشل فحص رمز المرور. تحقق من تشغيل السيرفر بالخلفية.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError("الرجاء كتابة رمز الأمان أولاً.");
      return;
    }
    verifyPasscodeOnClient(passcode);
  };

  // Fetch candidate lists on command
  const loadCandidatesList = async () => {
    setIsLoading(true);
    setOperationMsg("");
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.append("passcode", passcode);
      if (filters.searchTerm) queryParams.append("searchTerm", filters.searchTerm);
      if (filters.specialization) queryParams.append("specialization", filters.specialization);
      if (filters.governorate) queryParams.append("governorate", filters.governorate);
      if (filters.experience) queryParams.append("experience", filters.experience);
      if (filters.qualification) queryParams.append("qualification", filters.qualification);

      const response = await fetch(`/api/candidates?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      } else {
        const errorData = await response.json();
        setOperationMsg(`خطأ: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      setOperationMsg("فشل إعادة جلب البيانات من الخادم.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger reloading whenever filters change
  useEffect(() => {
    if (isAuthorized) {
      const delayDebounce = setTimeout(() => {
        loadCandidatesList();
      }, 300); // 300ms debounce
      return () => clearTimeout(delayDebounce);
    }
  }, [filters, isAuthorized]);

  // Handle deletion of single candidate
  const handleDeleteCandidate = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد تماماً من حذف ملف المرشح "${name}" نهائياً من قاعدة البيانات؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/candidates/${id}?passcode=${encodeURIComponent(passcode)}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setOperationMsg("✅ تم حذف ملف المرشح بنجاح من النظام.");
        // local update
        setCandidates(prev => prev.filter(c => c.id !== id));
      } else {
        const errData = await response.json();
        alert(errData.error || "عذراً.. تعذر حذف الملف.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الاتصال بالخادم لحذف السجل.");
    }
  };

  // Export matching filtered sheet to Excel-friendly UTF-8 CSV
  const triggerExportSheets = () => {
    const queryParams = new URLSearchParams();
    queryParams.append("passcode", passcode);
    if (filters.searchTerm) queryParams.append("searchTerm", filters.searchTerm);
    if (filters.specialization) queryParams.append("specialization", filters.specialization);
    if (filters.governorate) queryParams.append("governorate", filters.governorate);
    if (filters.experience) queryParams.append("experience", filters.experience);
    if (filters.qualification) queryParams.append("qualification", filters.qualification);

    const exportUrl = `/api/candidates/export?${queryParams.toString()}`;
    window.open(exportUrl, "_blank");
  };

  // Open candidate CV
  const triggerViewCV = (c: Candidate) => {
    if (!c.cvFile?.data) return;
    try {
      // Direct file downloader
      const link = document.createElement("a");
      link.href = c.cvFile.data;
      link.download = c.cvFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to view/download", err);
      alert("عذراً، فشل تحميل ملف السيرة الذاتية.");
    }
  };

  // Reset filters
  const resetAllFilters = () => {
    setFilters({
      searchTerm: "",
      specialization: "",
      governorate: "",
      experience: "",
      qualification: ""
    });
  };

  // Auth screen
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-100 rounded-3xl shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-full flex items-center justify-center mx-auto text-[#C5A059]">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-[#002B5B]">لوحة التحكم الموحدة بموظفي الموارد البشرية</h3>
          <p className="text-xs text-slate-400">يرجى كتابة رمز الأمان الخاص بشركة Prime HR Solutions للدخول لقاعدة البيانات</p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authError && (
            <div className="p-3 bg-rose-50 border-r-4 border-rose-500 rounded-xl text-rose-800 text-xs font-medium text-right">
              ⚠️ {authError}
            </div>
          )}

          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-slate-500">رمز المرور الافتراضي هو:</label>
            <input
              type="password"
              placeholder="اكتب رمز المرور هنا..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full text-center tracking-widest font-mono px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] outline-none text-slate-800"
              id="input-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#002B5B] hover:bg-[#C5A059] text-white font-bold rounded-xl text-sm transition-all duration-305 flex items-center justify-center gap-2"
            id="btn-admin-submit"
          >
            {isLoading ? (
              <span className="animate-spin h-4 w-4 border-2 border-[#C5A059] border-t-transparent rounded-full" />
            ) : (
              <span>الدخول للوحة التحكم</span>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Calculate stats based on current database slice
  const totalCount = candidates.length;
  const withCVCount = candidates.filter(c => !!c.cvFile).length;
  
  // Governorate stats
  const govMap: Record<string, number> = {};
  candidates.forEach(c => {
    govMap[c.governorate] = (govMap[c.governorate] || 0) + 1;
  });
  const topGov = Object.entries(govMap).sort((a,b) => b[1] - a[1])[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in" id="admin-dashboard-root">
      
      {/* Upper Grid Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-[#002B5B] tracking-tight">قاعدة بيانات المتقدمين للوظائف</h2>
          <p className="text-xs text-gray-500 mt-1">
            متابعة فورية وسيرش متكامل لفرز وتصفية مرشحي Prime HR Solutions
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-right">
          <button
            onClick={triggerExportSheets}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
            id="btn-excel-export"
          >
            <Download className="w-4 h-4" />
            <span>تصدير البيانات لملف Excel</span>
          </button>
          
          <button
            onClick={loadCandidatesList}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            id="btn-refresh-dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold">إجمالي المرشحين</p>
            <h4 className="text-3xl font-black text-[#002B5B]">{totalCount}</h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold">ملفات السيرة الذاتية (CV)</p>
            <h4 className="text-3xl font-black text-emerald-600">
              {withCVCount} <span className="text-xs text-slate-400 font-normal">منها</span>
            </h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold">تغطية المحافظات</p>
            <h4 className="text-xl font-black text-[#002B5B] truncate max-w-[180px]">
              {topGov ? `${topGov[0]} (${topGov[1]})` : "لا يوجد"}
            </h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-emerald-600 font-bold">أمان النظام والبيانات</p>
            <h4 className="text-base font-bold text-slate-700">تشفير تام نشط</h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#002B5B]/5 flex items-center justify-center text-[#002B5B]">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Control Panel: Filters Box */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h3 className="text-base font-extrabold text-[#002B5B] flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#C5A059]" />
            أدوات تصفية وتنقية المرشحين
          </h3>
          <button
            onClick={resetAllFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Quick Search Input */}
          <div className="space-y-1 lg:col-span-1">
            <label className="text-xs font-bold text-slate-500">البحث بالاسم أو الهاتف</label>
            <div className="relative">
              <input
                type="text"
                placeholder="اكتب كلمة رئيسية..."
                value={filters.searchTerm}
                onChange={e => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full text-right pr-9 pl-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#C5A059]/60 focus:ring-1 focus:ring-[#C5A059]/30"
                id="filter-search"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Specialization Filter Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">مجال التخصص</label>
            <input
              type="text"
              placeholder="مثال: محاسبة..."
              value={filters.specialization}
              onChange={e => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
              className="w-full text-right px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#C5A059]/60 focus:ring-1 focus:ring-[#C5A059]/30"
              id="filter-specialization"
            />
          </div>

          {/* Governorate Select */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">المحافظة</label>
            <select
              value={filters.governorate}
              onChange={e => setFilters(prev => ({ ...prev, governorate: e.target.value }))}
              className="w-full text-right px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#C5A059]/60 focus:ring-1 focus:ring-[#C5A059]/30"
              id="filter-governorate"
            >
              <option value="">كافة المحافظات ({GOVERNORATES.length})</option>
              {GOVERNORATES.map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>

          {/* Qualification Select */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">المؤهل الدراسي</label>
            <select
              value={filters.qualification}
              onChange={e => setFilters(prev => ({ ...prev, qualification: e.target.value }))}
              className="w-full text-right px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#C5A059]/60 focus:ring-1 focus:ring-[#C5A059]/30"
              id="filter-qualification"
            >
              <option value="">كافة المؤهلات ({QUALIFICATIONS.length})</option>
              {QUALIFICATIONS.map(qual => (
                <option key={qual} value={qual}>{qual}</option>
              ))}
            </select>
          </div>

          {/* Experience level Select */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">سنوات الخبرة</label>
            <select
              value={filters.experience}
              onChange={e => setFilters(prev => ({ ...prev, experience: e.target.value }))}
              className="w-full text-right px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#C5A059]/60 focus:ring-1 focus:ring-[#C5A059]/30"
              id="filter-experience"
            >
              <option value="">كافة الخبرات ({EXPERIENCE_LEVELS.length})</option>
              {EXPERIENCE_LEVELS.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Operation Alert inside Dashboard */}
      {operationMsg && (
        <div className="p-4 bg-slate-100 border-r-4 border-slate-500 text-slate-800 rounded-xl text-xs font-bold flex justify-between items-center">
          <span>{operationMsg}</span>
          <button onClick={() => setOperationMsg("")} className="text-gray-500 hover:text-black">
            إغلاق
          </button>
        </div>
      )}

      {/* Candidates List Display */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" id="candidates-data-container">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">جاري تصفية قاعدة البيانات وتحميل المرشحين المطابقين...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Info className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-700">لم نجد أي مرشحين مطابقين</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                عذراً، يرجى الاستعلام بكلمات رئيسية بديلة أو إلغاء بعض فلاتر الفرز والتوزيع الجغرافي.
              </p>
            </div>
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              إلغاء كافة شروط الفرز
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs whitespace-nowrap">
              <thead className="bg-[#002B5B] text-white select-none">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-[#C5A059]/10">المرشح (السن)</th>
                  <th className="px-6 py-4 font-bold border-b border-[#C5A059]/10">بيانات الاتصال</th>
                  <th className="px-6 py-4 font-bold border-b border-[#C5A059]/10">المحافظة</th>
                  <th className="px-6 py-4 font-bold border-b border-[#C5A059]/10">المؤهل الدراسي</th>
                  <th className="px-6 py-4 font-bold border-b border-[#C5A059]/10">التخصص والمسمى المطلوب</th>
                  <th className="px-6 py-4 font-bold border-b border-[#C5A059]/10">الخبرة</th>
                  <th className="px-6 py-4 font-bold border-b border-[#C5A059]/10">السيرة الذاتية</th>
                  <th className="px-6 py-4 font-bold border-b border-[#C5A059]/10">تاريخ التقديم</th>
                  <th className="px-6 py-4 font-bold border-b border-[#C5A059]/10 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          {cand.fullName.trim()[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{cand.fullName}</p>
                          <p className="text-slate-400 font-mono text-[10px] mt-0.5">السن: {cand.age} سنة</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone Connects */}
                    <td className="px-6 py-4 font-mono text-slate-700">
                      <div className="flex items-center gap-2">
                        <span>{cand.phone}</span>
                        <a
                          href={`tel:${cand.phone}`}
                          className="w-6 h-6 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
                          title="اتصال هاتفي"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${cand.phone.startsWith("0") ? "2" + cand.phone : cand.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-6 h-6 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors font-bold text-[10px]"
                          title="محادثة واتساب"
                        >
                          W
                        </a>
                      </div>
                    </td>

                    {/* Province */}
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full font-medium">
                        {cand.governorate}
                      </span>
                    </td>

                    {/* Educational */}
                    <td className="px-6 py-4 text-slate-600">
                      {cand.qualification}
                    </td>

                    {/* Specs / Desired */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-700">{cand.desiredTitle || "غير محدد"}</p>
                        <p className="text-slate-400 mt-0.5">{cand.specialization || "بدون تخصص فرعي"}</p>
                      </div>
                    </td>

                    {/* Exp */}
                    <td className="px-6 py-4">
                      <span className="bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-2.5 py-1 rounded-xl font-bold">
                        {cand.experience}
                      </span>
                    </td>

                    {/* CV View */}
                    <td className="px-6 py-4">
                      {cand.cvFile ? (
                        <button
                          onClick={() => triggerViewCV(cand)}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all"
                          title={`تحميل سيرته الذاتية: ${cand.cvFile.name}`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>تحميل السيرة ({ (cand.cvFile.size / 1024).toFixed(0) }KB)</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">غير مرفق</span>
                      )}
                    </td>

                    {/* Submission Stamp */}
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(cand.submittedAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                      })}
                    </td>

                    {/* Deletion triggers */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteCandidate(cand.id, cand.fullName)}
                        className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl transition-colors"
                        title="حذف الملف تماماً"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
