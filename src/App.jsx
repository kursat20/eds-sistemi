import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search, FileText, CheckCircle, CreditCard, Home, ShieldCheck, Trash2, X } from 'lucide-react';

// PDF Kütüphanesi Yükleyici
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
  
  // Örnek Ceza Verileri
  const [fines, setFines] = useState([
    { id: 1, plate: '01 ADN 01', amount: 4000, paid: false, date: '2024-02-15' },
    { id: 2, plate: '34 EDS 2024', amount: 1500, paid: false, date: '2024-02-16' }
  ]);

  // Anasayfaya döndüğünde admin yetkisini sıfırla
  const goHome = () => {
    setIsAdmin(false);
    setCurrentPage('home');
  };

  const handlePayFine = (plateNumber) => {
    setFines(prev => prev.map(f => f.plate.replace(/\s/g, '') === plateNumber.replace(/\s/g, '') ? { ...f, paid: true } : f));
  };

  return (
    // Arka planın her yeri kaplaması için h-full ve min-h-screen kullanımı
    <div className="min-h-screen w-full bg-[#e0f2fe] text-slate-900 font-sans selection:bg-blue-200 overflow-x-hidden">
      <LoadScripts />
      
      {/* Üst Menü */}
      <header className="bg-white border-b-[12px] border-blue-300 p-12 shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={goHome}>
            <h1 className="text-6xl font-black tracking-tighter text-blue-900">
              EDS <span className="text-blue-400 font-light italic">SİSTEMİ</span>
            </h1>
          </div>
          <div className="flex items-center gap-8">
            {currentPage !== 'home' && (
              <button 
                onClick={goHome}
                className="flex items-center space-x-4 px-12 py-6 bg-blue-600 hover:bg-blue-800 text-white rounded-full transition-all text-2xl font-black shadow-2xl"
              >
                <Home size={40} />
                <span>ANASAYFA</span>
              </button>
            )}
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="p-6 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-[30px] text-slate-500 transition-all shadow-xl"
            >
              <ShieldCheck size={48} />
            </button>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="container mx-auto p-12 md:p-24 pb-64">
        {currentPage === 'home' && <HomeScreen setPage={setCurrentPage} />}
        {currentPage === 'inquiry' && <InquiryScreen fines={fines} onPay={handlePayFine} />}
        {currentPage === 'camera' && <CameraScreen />}
        {currentPage === 'admin' && isAdmin && <AdminPanel fines={fines} setFines={setFines} />}
      </main>

      {/* Admin Giriş Modalı */}
      {showAdminLogin && (
        <AdminLogin 
          onClose={() => setShowAdminLogin(false)} 
          onSuccess={() => { setIsAdmin(true); setCurrentPage('admin'); setShowAdminLogin(false); }} 
        />
      )}

      <footer className="fixed bottom-0 w-full bg-blue-900 text-white text-center py-10 text-3xl border-t-8 border-blue-400 font-black tracking-widest uppercase z-40">
        TÜRKİYE EDS DENETİM VE YÖNETİM MERKEZİ
      </footer>
    </div>
  );
}

// --- EKRAN BİLEŞENLERİ ---

function HomeScreen({ setPage }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-24">
      <div className="text-center space-y-10">
        <h2 className="text-8xl md:text-[10rem] font-black text-slate-900 leading-[0.9] tracking-tighter">
          TRAFİK <br/> <span className="text-blue-600 underline decoration-blue-200">KONTROLÜ</span>
        </h2>
        <p className="text-4xl text-slate-500 font-black max-w-5xl mx-auto uppercase tracking-tighter">
          Lütfen yapmak istediğiniz işlemi seçiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 w-full max-w-7xl">
        <button 
          onClick={() => setPage('inquiry')} 
          className="p-28 bg-white border-[10px] border-white hover:border-blue-500 rounded-[80px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-6 flex flex-col items-center space-y-10 group"
        >
          <div className="p-12 rounded-[50px] bg-blue-50 text-blue-600 group-hover:scale-125 transition-transform duration-500">
            <Search size={120} />
          </div>
          <span className="text-6xl font-black text-slate-900 tracking-tighter uppercase">PLAKA SORGULA</span>
        </button>
        <button 
          onClick={() => setPage('camera')} 
          className="p-28 bg-white border-[10px] border-white hover:border-emerald-500 rounded-[80px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-6 flex flex-col items-center space-y-10 group"
        >
          <div className="p-12 rounded-[50px] bg-emerald-50 text-emerald-600 group-hover:scale-125 transition-transform duration-500">
            <Camera size={120} />
          </div>
          <span className="text-6xl font-black text-slate-900 tracking-tighter uppercase">MOBESE İZLE</span>
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
    doc.setFontSize(26);
    doc.text("EDS RESMI CEZA MAKBUZU", 105, 30, null, null, "center");
    doc.setFontSize(18);
    doc.text(`Arac Plakasi: ${searchResult.plate}`, 20, 60);
    doc.text(`Odeme Durumu: ${searchResult.paid ? 'ODENDI' : 'ODENMEDI'}`, 20, 80);
    doc.text(`Tarih: ${new Date().toLocaleDateString()}`, 20, 100);
    doc.save(`EDS_MAKBUZ_${searchResult.plate}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-20">
      <form onSubmit={handleSearch} className="flex gap-8 p-10 bg-white rounded-[50px] shadow-2xl border-8 border-white">
        <input 
          className="flex-1 p-10 bg-transparent border-none focus:ring-0 text-6xl font-black uppercase placeholder:text-slate-200" 
          placeholder="PLAKAYI YAZINIZ..." 
          value={plateInput}
          onChange={e => setPlateInput(e.target.value)}
        />
        <button className="bg-blue-600 hover:bg-blue-800 text-white px-20 rounded-[40px] font-black text-4xl shadow-2xl transition-all active:scale-95">
          SORGULA
        </button>
      </form>

      {searchResult && (
        <div className="p-20 bg-white rounded-[80px] shadow-2xl border-8 border-white space-y-16 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center border-b-8 border-slate-50 pb-20 gap-10">
            <div className="text-center md:text-left">
              <p className="text-2xl font-black text-slate-400 uppercase tracking-widest mb-4">ARAÇ PLAKASI</p>
              <span className="text-[10rem] font-mono font-black text-slate-900 leading-none">{searchResult.plate}</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-2xl font-black text-slate-400 uppercase tracking-widest mb-4">CEZA BORCU</p>
              <span className={`text-[9rem] font-black leading-none ${searchResult.paid ? 'text-emerald-500' : 'text-red-600'}`}>
                {searchResult.paid ? '0' : searchResult.amount} <span className="text-5xl">TL</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-10 justify-center">
            {!searchResult.paid && searchResult.amount > 0 && (
              <button 
                onClick={handleLocalPay} 
                disabled={isPaying} 
                className="bg-red-600 hover:bg-red-700 text-white px-24 py-12 rounded-[50px] font-black text-5xl flex items-center justify-center gap-8 shadow-2xl"
              >
                {isPaying ? <div className="w-16 h-16 border-8 border-white border-t-transparent animate-spin rounded-full"></div> : <CreditCard size={60}/>}
                HEMEN ÖDE
              </button>
            )}
            {!searchResult.noRecord && (
              <button 
                onClick={downloadPDF} 
                className="bg-slate-900 hover:bg-black text-white px-20 py-12 rounded-[50px] font-black text-4xl flex items-center justify-center gap-8 shadow-2xl"
              >
                <FileText size={50}/> PDF BELGE İNDİR
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
  const [streamStarted, setStreamStarted] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        if(videoRef.current) {
          videoRef.current.srcObject = s;
          setStreamStarted(true);
        }
      })
      .catch(err => console.log("Kamera erişimi reddedildi veya bulunamadı."));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      <div className="bg-black p-4 rounded-[100px] shadow-[0_100px_150px_-50px_rgba(0,0,0,0.5)] overflow-hidden relative border-[20px] border-white">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          className="w-full h-full object-cover rounded-[70px] scale-x-[-1] bg-slate-900 aspect-video" 
        />
        
        {/* Güvenlik Kamerası Arayüzü Elemanları */}
        <div className="absolute top-20 left-20 flex items-center gap-8 bg-red-600 text-white px-12 py-6 text-4xl font-black rounded-full animate-pulse shadow-2xl">
          <div className="w-8 h-8 bg-white rounded-full"></div> CANLI MOBESE-01
        </div>
        
        <div className="absolute top-20 right-20 flex flex-col items-end text-white font-mono text-3xl space-y-2 drop-shadow-lg">
          <div className="bg-black/40 px-6 py-2 rounded-lg border border-white/20">REC ● 00:42:11:08</div>
          <div className="bg-black/40 px-6 py-2 rounded-lg border border-white/20 text-emerald-400">HD 4K 60FPS</div>
        </div>

        <div className="absolute bottom-20 left-20 text-white/90 font-mono text-4xl bg-black/60 px-12 py-6 rounded-full backdrop-blur-2xl border-2 border-white/20">
          KONUM: MERKEZ KAVŞAK / IST
        </div>

        <div className="absolute bottom-20 right-20 text-white/90 font-mono text-3xl bg-black/60 px-12 py-6 rounded-full backdrop-blur-2xl border-2 border-white/20">
          TARİH: {new Date().toLocaleDateString('tr-TR')} // {new Date().toLocaleTimeString()}
        </div>

        {/* Köşe Nişangahları */}
        <div className="absolute top-10 left-10 w-20 h-20 border-t-8 border-l-8 border-white/50 rounded-tl-3xl"></div>
        <div className="absolute top-10 right-10 w-20 h-20 border-t-8 border-r-8 border-white/50 rounded-tr-3xl"></div>
        <div className="absolute bottom-10 left-10 w-20 h-20 border-b-8 border-l-8 border-white/50 rounded-bl-3xl"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b-8 border-r-8 border-white/50 rounded-br-3xl"></div>
      </div>
      
      <div className="flex justify-center gap-10">
         <div className="bg-white/50 px-10 py-5 rounded-full text-slate-500 text-2xl font-black uppercase tracking-widest border border-blue-200">
           Sistem Durumu: Çevrimiçi
         </div>
         <div className="bg-white/50 px-10 py-5 rounded-full text-slate-500 text-2xl font-black uppercase tracking-widest border border-blue-200">
           Veri Akışı: Aktif
         </div>
      </div>
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
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[100] flex items-center justify-center p-12">
      <div className="bg-white w-full max-w-3xl rounded-[80px] p-24 shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] relative border-t-[30px] border-blue-600">
        <button onClick={onClose} className="absolute top-16 right-16 text-slate-300 hover:text-red-500 transition-colors">
          <X size={70} />
        </button>
        <div className="text-center mb-20 space-y-8">
          <div className="w-32 h-32 bg-blue-50 text-blue-600 rounded-[40px] flex items-center justify-center mx-auto">
            <ShieldCheck size={80} />
          </div>
          <h3 className="text-7xl font-black text-slate-900 uppercase tracking-tighter">YETKİLİ GİRİŞİ</h3>
        </div>
        <form onSubmit={handleLogin} className="space-y-12">
          <input 
            type="password" 
            className={`w-full p-12 bg-slate-100 rounded-[40px] border-[6px] text-center text-6xl font-black tracking-[0.5em] focus:ring-[20px] transition-all ${error ? 'border-red-500 ring-red-100' : 'border-transparent focus:ring-blue-100'}`}
            placeholder="••••••••"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          {error && <p className="text-red-500 text-center text-2xl font-black uppercase">HATALI ŞİFRE!</p>}
          <button className="w-full py-12 bg-blue-600 hover:bg-blue-700 text-white rounded-[40px] font-black text-4xl shadow-2xl transition-all">
            YÖNETİME BAĞLAN
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
    <div className="max-w-7xl mx-auto space-y-20">
      <div className="flex justify-between items-center bg-white p-20 rounded-[60px] shadow-2xl border-l-[30px] border-blue-600">
        <h2 className="text-7xl font-black text-slate-900 tracking-tighter">SİSTEM YÖNETİMİ</h2>
        <div className="text-right">
          <p className="text-slate-400 font-black uppercase text-2xl tracking-widest">TOPLAM KAYIT</p>
          <p className="text-[8rem] font-black text-blue-600 leading-none">{fines.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-[80px] shadow-2xl overflow-hidden border-8 border-white">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b-8 border-blue-50">
            <tr>
              <th className="p-12 text-3xl font-black text-slate-400 uppercase">PLAKA / CEZA</th>
              <th className="p-12 text-3xl font-black text-slate-400 uppercase text-right">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody className="divide-y-8 divide-slate-50">
            {fines.map(fine => (
              <tr key={fine.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-12">
                  <span className="text-6xl font-mono font-black text-slate-900">{fine.plate}</span>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-4xl font-black text-red-500">{fine.amount} TL</span>
                    <span className={`px-6 py-2 rounded-2xl text-2xl font-black ${fine.paid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {fine.paid ? 'ÖDENDİ' : 'ÖDENMEDİ'}
                    </span>
                  </div>
                </td>
                <td className="p-12 text-right space-x-10">
                  {!fine.paid && (
                    <button onClick={() => markAsPaid(fine.id)} className="p-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[35px] shadow-xl active:scale-90">
                      <CheckCircle size={60} />
                    </button>
                  )}
                  <button onClick={() => deleteFine(fine.id)} className="p-8 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-300 rounded-[35px] transition-all active:scale-90">
                    <Trash2 size={60} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {fines.length === 0 && (
          <div className="p-48 text-center text-slate-200">
            <p className="text-7xl font-black uppercase tracking-[0.2em]">Sistem Temiz</p>
          </div>
        )}
      </div>
    </div>
  );
}