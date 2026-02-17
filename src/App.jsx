import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search, FileText, CheckCircle, CreditCard, Home, ShieldCheck, Trash2, X, Signal, PowerOff } from 'lucide-react';

/* ÖNEMLİ NOT:
  Başkalarının senin kameranı görmesi için bilgisayarından bir yayın açman (YouTube/Twitch) gerekir.
  Aşağıdaki 'YOUTUBE_LIVE_ID' kısmına YouTube canlı yayın ID'ni yapıştırırsan,
  siteye giren herkes SENİ izler. Boş bırakırsan "Sinyal Yok" görürler.
*/
const YOUTUBE_LIVE_ID = ""; // Örn: "jfKfPfyJRdk"

const LoadScripts = () => {
  useEffect(() => {
    // Tüm sayfa arka planını zorla açık mavi yap
    document.body.style.backgroundColor = "#e0f2fe";
    document.body.style.margin = "0";
    document.body.style.minHeight = "100vh";
    
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
  
  const [fines, setFines] = useState([
    { id: 1, plate: '01 ADN 01', amount: 4000, paid: false },
    { id: 2, plate: '34 EDS 2024', amount: 1500, paid: false }
  ]);

  const goHome = () => {
    setIsAdmin(false); // Admin yetkisini sıfırla
    setCurrentPage('home');
  };

  const handlePayFine = (plateNumber) => {
    setFines(prev => prev.map(f => f.plate.replace(/\s/g, '') === plateNumber.replace(/\s/g, '') ? { ...f, paid: true } : f));
  };

  return (
    <div className="w-full min-h-screen font-sans text-slate-900" style={{ backgroundColor: '#e0f2fe' }}>
      <LoadScripts />
      
      {/* Stil Zorlayıcı - Koyu Modu Engeller */}
      <style>{`
        html, body, #root { background-color: #e0f2fe !important; height: 100%; }
        .bg-forced-blue { background-color: #e0f2fe !important; }
      `}</style>
      
      {/* Üst Menü */}
      <header className="bg-white border-b-8 border-blue-300 p-8 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Camera size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-blue-900">
              EDS <span className="text-blue-500 font-light italic">MOBESE</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            {currentPage !== 'home' && (
              <button 
                onClick={goHome}
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-800 text-white rounded-full transition-all text-xl font-bold shadow-lg"
              >
                <Home size={28} />
                <span className="hidden md:inline">ANASAYFA</span>
              </button>
            )}
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-all shadow-md border-2 border-blue-200"
              title="Yönetici Girişi"
            >
              <ShieldCheck size={32} />
            </button>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="container mx-auto p-6 md:p-16 pb-32">
        {currentPage === 'home' && <HomeScreen setPage={setCurrentPage} />}
        {currentPage === 'inquiry' && <InquiryScreen fines={fines} onPay={handlePayFine} />}
        {currentPage === 'camera' && <CameraScreen isAdmin={isAdmin} />}
        {currentPage === 'admin' && isAdmin && <AdminPanel fines={fines} setFines={setFines} />}
      </main>

      {/* Admin Giriş Modalı */}
      {showAdminLogin && (
        <AdminLogin 
          onClose={() => setShowAdminLogin(false)} 
          onSuccess={() => { setIsAdmin(true); setCurrentPage('admin'); setShowAdminLogin(false); }} 
        />
      )}

      <footer className="fixed bottom-0 w-full bg-blue-900 text-white text-center py-6 text-xl md:text-2xl border-t-8 border-blue-400 font-bold tracking-widest uppercase z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        TÜRKİYE MOBESE AĞI &copy; 2024
      </footer>
    </div>
  );
}

// --- EKRAN BİLEŞENLERİ ---

function HomeScreen({ setPage }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-16 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-6">
        <h2 className="text-6xl md:text-9xl font-black text-slate-900 leading-[0.9] tracking-tighter drop-shadow-sm">
          ŞEHİR <br/> <span className="text-blue-600">GÜVENLİK</span>
        </h2>
        <p className="text-2xl md:text-4xl text-slate-500 font-bold max-w-4xl mx-auto tracking-tight">
          ELEKTRONİK DENETLEME SİSTEMİ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl px-4">
        <button 
          onClick={() => setPage('inquiry')} 
          className="group relative p-16 bg-white rounded-[50px] shadow-2xl transition-all hover:-translate-y-4 hover:shadow-blue-200 overflow-hidden border-4 border-white hover:border-blue-400"
        >
          <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center space-y-8">
            <Search size={100} className="text-blue-600" />
            <span className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter">PLAKA SORGULA</span>
          </div>
        </button>

        <button 
          onClick={() => setPage('camera')} 
          className="group relative p-16 bg-white rounded-[50px] shadow-2xl transition-all hover:-translate-y-4 hover:shadow-emerald-200 overflow-hidden border-4 border-white hover:border-emerald-400"
        >
          <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center space-y-8">
            <Camera size={100} className="text-emerald-600" />
            <span className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter">KAMERALAR</span>
          </div>
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
    doc.text("EDS CEZA MAKBUZU", 105, 30, null, null, "center");
    doc.setFontSize(16);
    doc.text(`Plaka: ${searchResult.plate}`, 20, 60);
    doc.text(`Durum: ${searchResult.paid ? 'ODENDI' : 'ODENMEDI'}`, 20, 80);
    doc.save(`EDS_${searchResult.plate}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <form onSubmit={handleSearch} className="flex gap-6 p-6 bg-white rounded-[40px] shadow-xl border-4 border-white">
        <input 
          className="flex-1 p-6 bg-transparent border-none focus:ring-0 text-5xl font-black uppercase placeholder:text-slate-200" 
          placeholder="PLAKA GİRİNİZ..." 
          value={plateInput}
          onChange={e => setPlateInput(e.target.value)}
        />
        <button className="bg-blue-600 hover:bg-blue-800 text-white px-12 rounded-[30px] font-black text-3xl transition-all">
          SORGULA
        </button>
      </form>

      {searchResult && (
        <div className="p-16 bg-white rounded-[60px] shadow-2xl border-4 border-white space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-slate-100 pb-12 gap-8">
            <div className="text-center md:text-left">
              <p className="text-xl font-black text-slate-400 uppercase tracking-widest">ARAÇ</p>
              <span className="text-7xl md:text-9xl font-mono font-black text-slate-900">{searchResult.plate}</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xl font-black text-slate-400 uppercase tracking-widest">DURUM</p>
              <span className={`text-7xl md:text-8xl font-black ${searchResult.paid ? 'text-emerald-500' : 'text-red-600'}`}>
                {searchResult.paid ? '0 TL' : `${searchResult.amount} TL`}
              </span>
            </div>
          </div>
          <div className="flex justify-center gap-6">
            {!searchResult.paid && searchResult.amount > 0 && (
              <button onClick={handleLocalPay} disabled={isPaying} className="bg-red-600 hover:bg-red-700 text-white px-16 py-8 rounded-[40px] font-black text-3xl flex items-center gap-4 shadow-xl">
                {isPaying ? "İŞLENİYOR..." : "ÖDEME YAP"}
              </button>
            )}
            {!searchResult.noRecord && (
              <button onClick={downloadPDF} className="bg-slate-900 hover:bg-black text-white px-16 py-8 rounded-[40px] font-black text-3xl flex items-center gap-4 shadow-xl">
                MAKBUZ
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CameraScreen({ isAdmin }) {
  const videoRef = useRef(null);

  useEffect(() => {
    // Sadece ADMIN ise yerel kamerayı aç. Değilse kamerayı açma.
    if (isAdmin) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          if(videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.log("Admin kamera hatası:", err));
    }
  }, [isAdmin]);

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="bg-black p-4 rounded-[60px] shadow-2xl overflow-hidden relative border-[12px] border-white aspect-video flex items-center justify-center">
        
        {/* Senaryo 1: Admin Girişi Yapıldı (Senin Kameran) */}
        {isAdmin ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full h-full object-cover rounded-[40px] scale-x-[-1]" 
            />
            <div className="absolute top-10 left-10 flex items-center gap-4 bg-red-600 text-white px-8 py-3 text-2xl font-black rounded-full animate-pulse shadow-xl">
              <div className="w-4 h-4 bg-white rounded-full"></div> SİSTEM YÖNETİCİSİ - CANLI
            </div>
          </>
        ) : (
          /* Senaryo 2: Normal Kullanıcı (Sinyal Yok veya YouTube Yayını) */
          YOUTUBE_LIVE_ID ? (
             <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${YOUTUBE_LIVE_ID}?autoplay=1&mute=1&controls=0`}
                title="Canlı Yayın" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-[40px]"
             ></iframe>
          ) : (
            <div className="text-center space-y-6 animate-pulse">
               <PowerOff size={100} className="text-slate-600 mx-auto" />
               <h3 className="text-5xl font-black text-slate-500 uppercase tracking-widest">SİNYAL YOK</h3>
               <p className="text-xl text-slate-600">YÖNETİCİ BAĞLANTISI BEKLENİYOR...</p>
            </div>
          )
        )}

        {/* Ortak Arayüz (Mobese Süsleri) */}
        <div className="absolute bottom-10 left-10 text-white/80 font-mono text-2xl bg-black/60 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/20">
          KAMERA: MERKEZ-01
        </div>
        <div className="absolute bottom-10 right-10 text-white/80 font-mono text-2xl bg-black/60 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/20">
          {new Date().toLocaleTimeString()}
        </div>
        
        {/* Köşe Çizgileri */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-8 border-l-8 border-white/30 rounded-tl-3xl"></div>
        <div className="absolute top-8 right-8 w-16 h-16 border-t-8 border-r-8 border-white/30 rounded-tr-3xl"></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-8 border-l-8 border-white/30 rounded-bl-3xl"></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-8 border-r-8 border-white/30 rounded-br-3xl"></div>
      </div>
      
      {!isAdmin && !YOUTUBE_LIVE_ID && (
         <p className="text-center text-red-500 font-bold text-xl bg-white p-4 rounded-xl shadow-sm border-l-8 border-red-500 max-w-2xl mx-auto">
           GÜVENLİK UYARISI: Şu an görüntü aktarımı yapılmıyor. Görüntüyü sadece Admin (Yönetici) görebilir.
         </p>
      )}
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
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-8">
      <div className="bg-white w-full max-w-2xl rounded-[60px] p-16 shadow-2xl relative border-t-[20px] border-blue-600">
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-300 hover:text-red-500">
          <X size={48} />
        </button>
        <div className="text-center mb-12 space-y-6">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[30px] flex items-center justify-center mx-auto">
            <ShieldCheck size={64} />
          </div>
          <h3 className="text-5xl font-black text-slate-900 uppercase">GÜVENLİK GİRİŞİ</h3>
        </div>
        <form onSubmit={handleLogin} className="space-y-8">
          <input 
            type="password" 
            className={`w-full p-8 bg-slate-100 rounded-[30px] border-4 text-center text-4xl font-black tracking-[0.5em] focus:ring-8 ${error ? 'border-red-500 ring-red-100' : 'border-transparent focus:ring-blue-100'}`}
            placeholder="••••••••"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          {error && <p className="text-red-500 text-center text-xl font-black">HATA: YETKİSİZ ERİŞİM</p>}
          <button className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[30px] font-black text-3xl shadow-xl">
            SİSTEMİ AÇ
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
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center bg-white p-12 rounded-[50px] shadow-2xl border-l-[20px] border-blue-600">
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter">YÖNETİM</h2>
        <div className="text-right">
          <p className="text-slate-400 font-black uppercase text-xl tracking-widest">KAYITLAR</p>
          <p className="text-8xl font-black text-blue-600 leading-none">{fines.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-[60px] shadow-2xl overflow-hidden border-8 border-white">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b-8 border-blue-50">
            <tr>
              <th className="p-8 text-2xl font-black text-slate-400 uppercase">DETAYLAR</th>
              <th className="p-8 text-2xl font-black text-slate-400 uppercase text-right">EYLEM</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-slate-50">
            {fines.map(fine => (
              <tr key={fine.id}>
                <td className="p-8">
                  <span className="text-5xl font-mono font-black text-slate-900">{fine.plate}</span>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-3xl font-black text-red-500">{fine.amount} TL</span>
                    <span className={`px-4 py-1 rounded-xl text-xl font-black ${fine.paid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {fine.paid ? 'ÖDENDİ' : 'AÇIK'}
                    </span>
                  </div>
                </td>
                <td className="p-8 text-right space-x-6">
                  {!fine.paid && (
                    <button onClick={() => markAsPaid(fine.id)} className="p-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[30px] shadow-lg">
                      <CheckCircle size={40} />
                    </button>
                  )}
                  <button onClick={() => deleteFine(fine.id)} className="p-6 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-300 rounded-[30px]">
                    <Trash2 size={40} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}