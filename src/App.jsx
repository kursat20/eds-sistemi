import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search, FileText, CheckCircle, CreditCard, Home, ShieldCheck, Trash2, X } from 'lucide-react';

// PDF Generator Loader
const LoadScripts = () => {
  useEffect(() => {
    if (!window.jspdf) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  return null;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Sample Fine Data
  const [fines, setFines] = useState([
    { id: 1, plate: '01 ADN 01', amount: 4000, paid: false, date: '2024-02-15' },
    { id: 2, plate: '34 EDS 2024', amount: 1500, paid: false, date: '2024-02-16' }
  ]);

  const goHome = () => setCurrentPage('home');

  const handlePayFine = (plateNumber) => {
    setFines(prev => prev.map(f => f.plate.replace(/\s/g, '') === plateNumber.replace(/\s/g, '') ? { ...f, paid: true } : f));
  };

  return (
    <div className="min-h-screen bg-sky-100 text-slate-800 font-sans selection:bg-blue-200">
      <LoadScripts />
      
      {/* Header */}
      <header className="bg-white border-b-8 border-blue-200 p-10 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={goHome}>
            <h1 className="text-5xl font-black tracking-tighter text-blue-900">
              EDS <span className="text-slate-400 font-light italic text-4xl">KONTROL PANELİ</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            {currentPage !== 'home' && (
              <button 
                onClick={goHome}
                className="flex items-center space-x-3 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl transition-all text-xl font-black shadow-2xl"
              >
                <Home size={32} />
                <span>ANASAYFA</span>
              </button>
            )}
            <button 
              onClick={() => isAdmin ? setCurrentPage('admin') : setShowAdminLogin(true)}
              className="p-5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-3xl text-slate-500 transition-all shadow-inner"
            >
              <ShieldCheck size={36} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-12 md:p-24">
        {currentPage === 'home' && <HomeScreen setPage={setCurrentPage} />}
        {currentPage === 'inquiry' && <InquiryScreen fines={fines} onPay={handlePayFine} />}
        {currentPage === 'camera' && <CameraScreen />}
        {currentPage === 'admin' && isAdmin && <AdminPanel fines={fines} setFines={setFines} />}
      </main>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin 
          onClose={() => setShowAdminLogin(false)} 
          onSuccess={() => { setIsAdmin(true); setCurrentPage('admin'); setShowAdminLogin(false); }} 
        />
      )}

      <footer className="fixed bottom-0 w-full bg-white/95 backdrop-blur-lg text-slate-600 text-center py-8 text-2xl border-t-4 border-blue-50 font-black">
        ELEKTRONİK DENETLEME SİSTEMİ (ADMIN YETKİLİ)
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function HomeScreen({ setPage }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-20">
      <div className="text-center space-y-8">
        <h2 className="text-7xl md:text-9xl font-black text-slate-900 leading-none tracking-tight">
          MERKEZİ <br/> <span className="text-blue-600">EDS SİSTEMİ</span>
        </h2>
        <p className="text-3xl text-slate-500 font-bold max-w-4xl mx-auto uppercase tracking-widest">
          Sorgulama ve Kamera Sistemi Aktif
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-7xl">
        <button 
          onClick={() => setPage('inquiry')} 
          className="p-24 bg-white border-8 border-transparent hover:border-blue-500 rounded-[60px] shadow-2xl transition-all hover:-translate-y-4 flex flex-col items-center space-y-8 group"
        >
          <div className="p-10 rounded-[40px] bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
            <Search size={100} />
          </div>
          <span className="text-5xl font-black text-slate-800 tracking-tighter uppercase">Plaka Sorgula</span>
        </button>
        <button 
          onClick={() => setPage('camera')} 
          className="p-24 bg-white border-8 border-transparent hover:border-emerald-500 rounded-[60px] shadow-2xl transition-all hover:-translate-y-4 flex flex-col items-center space-y-8 group"
        >
          <div className="p-10 rounded-[40px] bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
            <Camera size={100} />
          </div>
          <span className="text-5xl font-black text-slate-800 tracking-tighter uppercase">Şehir Kamerası</span>
        </button>
      </div>
    </div>
  );
}

function InquiryScreen({ fines, onPay }) {
  const [plateInput, setPlateInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanPlate = plateInput.toUpperCase().replace(/\s/g, '');
    const found = fines.find(f => f.plate.replace(/\s/g, '') === cleanPlate);
    setSearchResult(found || { plate: cleanPlate, amount: 0, paid: true, noRecord: true });
  };

  const handleLocalPay = () => {
    setIsPaying(true);
    setTimeout(() => {
      onPay(searchResult.plate);
      setSearchResult(prev => ({ ...prev, paid: true }));
      setIsPaying(false);
    }, 2000);
  };

  const downloadPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.text("EDS TRAFIK CEZA MAKBUZU", 105, 30, null, null, "center");
    doc.text(`Plaka: ${searchResult.plate}`, 20, 60);
    doc.text(`Durum: ${searchResult.paid ? 'ODENDI' : 'ODEME BEKLIYOR'}`, 20, 80);
    doc.save(`EDS_Makbuz_${searchResult.plate}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-16">
      <form onSubmit={handleSearch} className="flex gap-6 p-6 bg-white rounded-[40px] shadow-2xl border-4 border-blue-50">
        <input 
          className="flex-1 p-8 bg-transparent border-none focus:ring-0 text-5xl font-black uppercase" 
          placeholder="PLAKA GİRİNİZ..." 
          value={plateInput}
          onChange={e => setPlateInput(e.target.value)}
        />
        <button className="bg-blue-600 hover:bg-blue-800 text-white px-16 rounded-[30px] font-black text-3xl shadow-xl transition-all">
          SORGULA
        </button>
      </form>

      {searchResult && (
        <div className="p-16 bg-white rounded-[60px] shadow-2xl border-4 border-blue-50 space-y-12">
          <div className="flex justify-between items-end border-b-4 border-slate-50 pb-16">
            <div className="space-y-4">
              <p className="text-xl font-black text-slate-400 uppercase">Sorgulanan Araç</p>
              <span className="text-8xl font-mono font-black text-slate-900">{searchResult.plate}</span>
            </div>
            <div className="text-right space-y-4">
              <p className="text-xl font-black text-slate-400 uppercase">Borç Tutarı</p>
              <span className={`text-8xl font-black ${searchResult.amount > 0 && !searchResult.paid ? 'text-red-600' : 'text-emerald-500'}`}>
                {searchResult.paid ? '0' : searchResult.amount} TL
              </span>
            </div>
          </div>
          <div className="flex gap-6 justify-end">
            {!searchResult.paid && searchResult.amount > 0 && (
              <button onClick={handleLocalPay} disabled={isPaying} className="bg-red-600 hover:bg-red-700 text-white px-16 py-8 rounded-[35px] font-black text-3xl flex items-center gap-6">
                {isPaying ? <div className="w-10 h-10 border-4 border-white border-t-transparent animate-spin rounded-full"></div> : <CreditCard size={44}/>}
                ÖDE
              </button>
            )}
            {!searchResult.noRecord && (
              <button onClick={downloadPDF} className="bg-slate-900 hover:bg-black text-white px-14 py-8 rounded-[35px] font-black text-3xl flex items-center gap-6">
                <FileText size={44}/> PDF İNDİR
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CameraScreen() {
  const videoRef = useRef(null);
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
      if(videoRef.current) videoRef.current.srcObject = s;
    }).catch(err => console.error("Kamera hatası:", err));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="bg-white p-8 rounded-[60px] shadow-2xl border-8 border-white overflow-hidden relative">
        <video ref={videoRef} autoPlay className="w-full h-full object-cover rounded-[40px] scale-x-[-1] bg-slate-900 aspect-video shadow-inner" />
        <div className="absolute top-16 left-16 flex items-center gap-6 bg-red-600 text-white px-10 py-4 text-3xl font-black rounded-full animate-pulse shadow-2xl">
          <div className="w-6 h-6 bg-white rounded-full"></div> CANLI MOBESE
        </div>
        <div className="absolute bottom-16 right-16 text-white/80 font-mono text-2xl bg-black/50 px-8 py-4 rounded-3xl backdrop-blur-md">
          MOBESE-SERVER-01: {new Date().toLocaleTimeString()}
        </div>
      </div>
      <p className="text-center text-slate-500 text-3xl font-black uppercase tracking-[0.5em] opacity-40 italic">Güvenli Trafik Kontrolü</p>
    </div>
  );
}

function AdminLogin({ onClose, onSuccess }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === '17368863956') onSuccess();
    else { setError(true); setPass(''); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-10">
      <div className="bg-white w-full max-w-2xl rounded-[60px] p-20 shadow-2xl relative border-t-[20px] border-blue-600">
        <button onClick={onClose} className="absolute top-12 right-12 text-slate-300 hover:text-red-500 transition-colors">
          <X size={48} />
        </button>
        <div className="text-center mb-16 space-y-6">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[30px] flex items-center justify-center mx-auto">
            <ShieldCheck size={60} />
          </div>
          <h3 className="text-5xl font-black text-slate-900 uppercase">Admin Girişi</h3>
        </div>
        <form onSubmit={handleLogin} className="space-y-10">
          <input 
            type="password" 
            className={`w-full p-8 bg-slate-100 rounded-3xl border-4 text-center text-4xl font-black tracking-[0.5em] focus:ring-8 ${error ? 'border-red-500 ring-red-100' : 'border-transparent focus:ring-blue-100'}`}
            placeholder="••••••••"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          {error && <p className="text-red-500 text-center text-xl font-black uppercase">Şifre Hatalı!</p>}
          <button className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-3xl shadow-2xl">
            SİSTEME GİRİŞ YAP
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminPanel({ fines, setFines }) {
  const deleteFine = (id) => setFines(prev => prev.filter(f => f.id !== id));
  const markAsPaid = (id) => setFines(prev => prev.map(f => f.id === id ? { ...f, paid: true } : f));

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white p-16 rounded-[50px] shadow-2xl border-l-[24px] border-blue-600">
        <h2 className="text-5xl font-black text-slate-900">SİSTEM YÖNETİMİ</h2>
        <div className="text-right">
          <p className="text-slate-400 font-black uppercase text-lg tracking-widest">Kayıtlı Cezalar</p>
          <p className="text-7xl font-black text-blue-600">{fines.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-[60px] shadow-2xl overflow-hidden border-4 border-blue-50">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b-4 border-blue-50">
            <tr>
              <th className="p-10 text-2xl font-black text-slate-400 uppercase">Araç Plakası</th>
              <th className="p-10 text-2xl font-black text-slate-400 uppercase text-right">Durum / İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-slate-50">
            {fines.map(fine => (
              <tr key={fine.id}>
                <td className="p-10">
                  <span className="text-4xl font-mono font-black text-slate-800">{fine.plate}</span>
                  <p className="text-red-500 text-2xl font-black mt-2">{fine.amount} TL CEZA</p>
                </td>
                <td className="p-10 text-right space-x-6">
                  {!fine.paid && (
                    <button onClick={() => markAsPaid(fine.id)} className="p-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl shadow-xl active:scale-90">
                      <CheckCircle size={44} />
                    </button>
                  )}
                  <button onClick={() => deleteFine(fine.id)} className="p-6 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-400 rounded-3xl transition-all active:scale-90">
                    <Trash2 size={44} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {fines.length === 0 && (
          <div className="p-32 text-center text-slate-300">
            <p className="text-5xl font-black uppercase tracking-widest opacity-30">Hiç Kayıt Yok</p>
          </div>
        )}
      </div>
    </div>
  );
}