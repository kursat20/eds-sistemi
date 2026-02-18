import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search, FileText, CheckCircle, CreditCard, Home, ShieldCheck, Trash2, X, Signal, PowerOff, Radio, AlertTriangle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

// Firebase Konfigürasyonu
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'eds-sistemi';

const LoadScripts = () => {
  useEffect(() => {
    document.body.style.backgroundColor = "#0f172a";
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
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [streamState, setStreamState] = useState({ active: false });

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Hatası:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const streamDoc = doc(db, 'artifacts', appId, 'public', 'data', 'stream_status');
    const unsub = onSnapshot(streamDoc, (snapshot) => {
      if (snapshot.exists()) {
        setStreamState(snapshot.data());
      }
    }, (err) => {
      console.error("Firestore Yetki Hatası:", err);
    });
    return () => unsub();
  }, [user]);

  const toggleStream = async (status) => {
    if (!user || !isAdmin) return;
    try {
      const streamDoc = doc(db, 'artifacts', appId, 'public', 'data', 'stream_status');
      await setDoc(streamDoc, { active: status, updatedAt: Date.now() });
    } catch (error) {
      console.error("Yayın güncellenemedi:", error);
    }
  };

  return (
    <div className="min-h-screen w-full font-sans text-white bg-slate-900">
      <LoadScripts />
      <header className="bg-slate-800 border-b border-slate-700 p-6 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
              <Camera size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">
              EDS <span className="text-blue-400 font-light italic">SİSTEMİ</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {currentPage !== 'home' && (
              <button onClick={() => setCurrentPage('home')} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all flex items-center gap-2">
                <Home size={18} /> ANASAYFA
              </button>
            )}
            <button onClick={() => setShowAdminLogin(true)} className="p-2 bg-slate-700 text-slate-400 rounded-lg hover:text-white transition-all">
              <ShieldCheck size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 md:p-12 pb-32">
        {currentPage === 'home' && <HomeScreen setPage={setCurrentPage} />}
        {currentPage === 'inquiry' && <InquiryScreen />}
        {currentPage === 'camera' && <CameraScreen isAdmin={isAdmin} streamState={streamState} />}
        {currentPage === 'admin' && isAdmin && (
          <AdminPanel streamState={streamState} onToggleStream={toggleStream} />
        )}
      </main>

      {showAdminLogin && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} onSuccess={() => { setIsAdmin(true); setCurrentPage('admin'); setShowAdminLogin(false); }} />
      )}

      <footer className="fixed bottom-0 w-full bg-slate-800/80 backdrop-blur-md text-slate-500 text-center py-4 text-xs border-t border-slate-700 z-40">
        TÜRKİYE MOBESE VE ELEKTRONİK DENETLEME SİSTEMİ v2.0
      </footer>
    </div>
  );
}

function HomeScreen({ setPage }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tighter uppercase">Trafik Kontrol</h2>
        <p className="text-xl text-slate-400 font-medium tracking-widest uppercase">Güvenli Şehir Yönetim Portalı</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <button onClick={() => setPage('inquiry')} className="p-12 bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-700 hover:border-blue-500 transition-all flex flex-col items-center gap-6 group">
          <Search size={64} className="text-blue-500 group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <span className="text-2xl font-black block">PLAKA SORGULA</span>
            <span className="text-sm text-slate-500">Ceza ve borç dökümü</span>
          </div>
        </button>
        <button onClick={() => setPage('camera')} className="p-12 bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-700 hover:border-emerald-500 transition-all flex flex-col items-center gap-6 group">
          <Camera size={64} className="text-emerald-500 group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <span className="text-2xl font-black block">MOBESE İZLE</span>
            <span className="text-sm text-slate-500">Canlı şehir kameraları</span>
          </div>
        </button>
      </div>
    </div>
  );
}

function CameraScreen({ isAdmin, streamState }) {
  const videoRef = useRef(null);
  useEffect(() => {
    let s = null;
    if (isAdmin && streamState.active) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { 
          s = stream;
          if(videoRef.current) videoRef.current.srcObject = stream; 
        })
        .catch(e => console.error("Kamera hatası:", e));
    }
    return () => { if(s) s.getTracks().forEach(t => t.stop()); };
  }, [isAdmin, streamState.active]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-black rounded-3xl shadow-2xl relative aspect-video border-4 border-slate-700 overflow-hidden flex items-center justify-center">
        {streamState.active ? (
          isAdmin ? ( <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" /> ) : (
            <div className="text-center">
              <Signal size={80} className="text-emerald-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-3xl font-black uppercase">Yayın Aktif</h3>
              <p className="text-slate-400">Merkezden canlı veri aktarılıyor...</p>
            </div>
          )
        ) : (
          <div className="text-center text-slate-700">
            <PowerOff size={60} className="mx-auto mb-4" />
            <h3 className="text-2xl font-black uppercase tracking-widest">Sinyal Kesildi</h3>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <div className={`px-4 py-1 rounded-full text-xs font-black flex items-center gap-2 ${streamState.active ? 'bg-red-600 animate-pulse' : 'bg-slate-800'}`}>
            {streamState.active ? 'CANLI' : 'OFFLINE'}
          </div>
        </div>
      </div>
    </div>
  );
}

function InquiryScreen() {
  const [plate, setPlate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!plate) return;
    setLoading(true);
    setTimeout(() => {
      const cleanPlate = plate.toUpperCase().replace(/\s/g, '');
      if (cleanPlate === '01ADN01' || cleanPlate === '34EDS2024') {
        setResult({ plate: plate.toUpperCase(), fine: 4250, date: '12.05.2024' });
      } else {
        setResult({ plate: plate.toUpperCase(), fine: 0 });
      }
      setLoading(false);
    }, 800);
  };

  const generatePDF = () => {
    if (!window.jspdf || !result) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("T.C. TRAFIK CEZA MAKBUZU", 105, 20, null, null, "center");
    doc.text(`Plaka: ${result.plate}`, 20, 40);
    doc.text(`Borç: ${result.fine} TL`, 20, 50);
    doc.text(`Sorgu Tarihi: ${new Date().toLocaleString()}`, 20, 60);
    doc.save(`EDS_${result.plate}.pdf`);
  };

  return (
    <div className="max-w-2xl mx-auto p-10 bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 space-y-8 animate-in slide-in-from-bottom-4">
      <div className="text-center">
        <Search size={48} className="mx-auto text-blue-500 mb-2" />
        <h3 className="text-3xl font-black uppercase">Plaka Sorgula</h3>
      </div>
      <form onSubmit={handleSearch} className="space-y-4">
        <input 
          className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-center text-4xl font-mono uppercase focus:border-blue-500 outline-none transition-all" 
          placeholder="34 ABC 123" 
          value={plate}
          onChange={e => setPlate(e.target.value)}
        />
        <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xl font-bold shadow-lg transition-all">
          {loading ? "Sorgulanıyor..." : "SORGULA"}
        </button>
      </form>
      {result && (
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-700 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center">
            <span className="text-4xl font-black">{result.plate}</span>
            <span className={`text-2xl font-bold ${result.fine > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {result.fine > 0 ? `${result.fine} TL BORÇ` : 'BORÇ YOK'}
            </span>
          </div>
          <button onClick={generatePDF} className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold flex items-center justify-center gap-2">
            <FileText size={20} /> BELGE İNDİR (PDF)
          </button>
        </div>
      )}
    </div>
  );
}

function AdminLogin({ onClose, onSuccess }) {
  const [pass, setPass] = useState('');
  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === '17368863956') onSuccess();
    else setPass('');
  };
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <div className="bg-slate-800 w-full max-w-md rounded-3xl p-10 shadow-2xl relative border border-slate-700">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={28} /></button>
        <h3 className="text-2xl font-black text-center mb-8 uppercase tracking-tighter">Yetkili Girişi</h3>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="password" autoFocus className="w-full p-4 bg-slate-900 rounded-xl text-center text-3xl outline-none border border-slate-700 focus:border-blue-500" placeholder="****" value={pass} onChange={e => setPass(e.target.value)} />
          <button className="w-full py-4 bg-blue-600 text-white rounded-xl text-xl font-bold">GİRİŞ YAP</button>
        </form>
      </div>
    </div>
  );
}

function AdminPanel({ streamState, onToggleStream }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl border-l-8 border-blue-600 flex justify-between items-center flex-wrap gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase">Yayın Merkezi</h2>
          <p className="text-slate-400 font-bold uppercase text-sm italic mt-1">Sistem Durumu: {streamState.active ? 'Canlı' : 'Kapalı'}</p>
        </div>
        <button 
          onClick={() => onToggleStream(!streamState.active)}
          className={`px-10 py-5 rounded-2xl text-xl font-black transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3 ${streamState.active ? 'bg-red-600' : 'bg-emerald-600'}`}
        >
          {streamState.active ? <><PowerOff /> DURDUR</> : <><Radio className="animate-pulse" /> YAYINLA</>}
        </button>
      </div>
    </div>
  );
}