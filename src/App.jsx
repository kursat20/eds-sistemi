import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search, FileText, CheckCircle, CreditCard, Home, ShieldCheck, Trash2, X, Signal, PowerOff, Radio } from 'lucide-react';
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
    document.body.style.backgroundColor = "#e0f2fe";
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

  // 1. ADIM: Firebase Kimlik Doğrulaması
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

  // 2. ADIM: Veri Dinleme (Sadece user varsa)
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
    <div className="min-h-screen w-full font-sans text-slate-900" style={{ backgroundColor: '#e0f2fe' }}>
      <LoadScripts />
      <style>{`
        body { background-color: #e0f2fe !important; margin: 0; }
        .animate-slow-pulse { animation: pulse 3s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
      
      <header className="bg-white border-b-8 border-blue-300 p-6 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
              <Camera size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-blue-900">
              EDS <span className="text-blue-400 font-light italic">YÖNETİM</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {currentPage !== 'home' && (
              <button onClick={() => setCurrentPage('home')} className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg">
                ANASAYFA
              </button>
            )}
            <button onClick={() => setShowAdminLogin(true)} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-md">
              <ShieldCheck size={28} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 md:p-12">
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

      <footer className="fixed bottom-0 w-full bg-blue-900 text-white text-center py-4 text-xl border-t-4 border-blue-400 font-bold z-40">
        EDS MOBESE DENETİM SİSTEMİ
      </footer>
    </div>
  );
}

function HomeScreen({ setPage }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-12">
      <div className="text-center">
        <h2 className="text-7xl font-black text-slate-900 mb-4">TRAFİK KONTROL</h2>
        <p className="text-2xl text-slate-500 font-bold">MOBESE VE CEZA YÖNETİM MERKEZİ</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <button onClick={() => setPage('inquiry')} className="p-16 bg-white rounded-3xl shadow-2xl border-4 border-white hover:border-blue-500 transition-all flex flex-col items-center gap-6">
          <Search size={80} className="text-blue-600" />
          <span className="text-3xl font-black">PLAKA SORGULA</span>
        </button>
        <button onClick={() => setPage('camera')} className="p-16 bg-white rounded-3xl shadow-2xl border-4 border-white hover:border-emerald-500 transition-all flex flex-col items-center gap-6">
          <Camera size={80} className="text-emerald-600" />
          <span className="text-3xl font-black">MOBESE İZLE</span>
        </button>
      </div>
    </div>
  );
}

function CameraScreen({ isAdmin, streamState }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isAdmin && streamState.active) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => { if(videoRef.current) videoRef.current.srcObject = s; })
        .catch(e => console.error("Kamera açma hatası:", e));
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isAdmin, streamState.active]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-black rounded-3xl shadow-2xl relative aspect-video border-[10px] border-white overflow-hidden flex items-center justify-center">
        {streamState.active ? (
          isAdmin ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <div className="text-center text-white animate-slow-pulse">
              <Signal size={100} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="text-4xl font-black">YAYIN AKTİF</h3>
              <p className="text-xl opacity-60">Görüntü yöneticiden geliyor...</p>
            </div>
          )
        ) : (
          <div className="text-center text-slate-600">
            <PowerOff size={80} className="mx-auto mb-4" />
            <h3 className="text-3xl font-black uppercase">SİNYAL YOK</h3>
          </div>
        )}
        <div className="absolute top-6 left-6 bg-red-600 text-white px-6 py-2 rounded-full font-bold text-lg flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-white ${streamState.active ? 'animate-pulse' : ''}`}></div>
          {streamState.active ? 'CANLI' : 'KAPALI'}
        </div>
      </div>
    </div>
  );
}

function InquiryScreen() {
  return (
    <div className="max-w-3xl mx-auto p-12 bg-white rounded-3xl shadow-2xl text-center space-y-8">
      <Search size={60} className="mx-auto text-blue-600" />
      <h3 className="text-4xl font-black">PLAKA SORGULAMA</h3>
      <input className="w-full p-4 text-4xl font-mono text-center border-b-4 border-blue-200 outline-none" placeholder="34 EDS 2024" />
      <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-2xl font-bold">SORGULA</button>
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
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300"><X size={32} /></button>
        <h3 className="text-3xl font-black text-center mb-8">ADMIN GİRİŞİ</h3>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="password" className="w-full p-4 bg-slate-100 rounded-xl text-center text-3xl tracking-widest outline-none" placeholder="****" value={pass} onChange={e => setPass(e.target.value)} />
          <button className="w-full py-4 bg-blue-600 text-white rounded-xl text-xl font-bold">GİRİŞ YAP</button>
        </form>
      </div>
    </div>
  );
}

function AdminPanel({ streamState, onToggleStream }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-12 rounded-3xl shadow-2xl border-l-[20px] border-blue-600 flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black">YAYIN MERKEZİ</h2>
          <p className="text-xl text-slate-400 font-bold mt-2 uppercase">Canlı Mobese Yönetimi</p>
        </div>
        <button 
          onClick={() => onToggleStream(!streamState.active)}
          className={`px-10 py-5 rounded-2xl text-2xl font-black shadow-xl transition-all ${streamState.active ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}
        >
          {streamState.active ? 'YAYINI DURDUR' : 'YAYINI BAŞLAT'}
        </button>
      </div>
      <div className="p-8 bg-white/50 rounded-2xl text-center text-slate-500 font-bold border-2 border-white">
        {streamState.active ? "SİSTEM ŞU AN CANLI YAYINDA" : "YAYIN KAPALI - KİMSE SİZİ İZLEYEMEZ"}
      </div>
    </div>
  );
}