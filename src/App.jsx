import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search, FileText, CheckCircle, CreditCard, Home, ShieldCheck, Trash2, X, Signal, PowerOff, Radio } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Firebase Konfigürasyonu (Ortam değişkenlerinden alınır)
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
  const [streamState, setStreamState] = useState({ active: false, peerId: null });

  // Auth ve Firebase Bağlantısı
  useEffect(() => {
    const initAuth = async () => {
      await signInAnonymously(auth);
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Yayın Durumunu Dinle
  useEffect(() => {
    if (!user) return;
    const streamDoc = doc(db, 'artifacts', appId, 'public', 'data', 'stream_status');
    const unsub = onSnapshot(streamDoc, (doc) => {
      if (doc.exists()) {
        setStreamState(doc.data());
      }
    }, (err) => console.error("Firestore hatası:", err));
    return () => unsub();
  }, [user]);

  const toggleStream = async (status) => {
    const streamDoc = doc(db, 'artifacts', appId, 'public', 'data', 'stream_status');
    await setDoc(streamDoc, { active: status, updatedAt: Date.now() });
  };

  return (
    <div className="min-h-screen w-full font-sans text-slate-900 overflow-x-hidden" style={{ backgroundColor: '#e0f2fe' }}>
      <LoadScripts />
      <style>{`
        body { background-color: #e0f2fe !important; }
        .animate-slow-pulse { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .7; } }
      `}</style>
      
      <header className="bg-white border-b-[12px] border-blue-300 p-10 shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
              <Camera size={48} />
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-blue-900">
              EDS <span className="text-blue-400 font-light italic">SİSTEMİ</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            {currentPage !== 'home' && (
              <button onClick={() => setCurrentPage('home')} className="flex items-center gap-4 px-10 py-5 bg-blue-600 hover:bg-blue-800 text-white rounded-full transition-all text-2xl font-black shadow-xl">
                <Home size={32} /> ANASAYFA
              </button>
            )}
            <button onClick={() => setShowAdminLogin(true)} className="p-5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-[25px] text-slate-500 transition-all shadow-lg border-2 border-slate-200">
              <ShieldCheck size={40} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8 md:p-20 pb-48">
        {currentPage === 'home' && <HomeScreen setPage={setCurrentPage} />}
        {currentPage === 'inquiry' && <InquiryScreen />}
        {currentPage === 'camera' && <CameraScreen isAdmin={isAdmin} streamState={streamState} />}
        {currentPage === 'admin' && isAdmin && <AdminPanel streamState={streamState} onToggleStream={toggleStream} />}
      </main>

      {showAdminLogin && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} onSuccess={() => { setIsAdmin(true); setCurrentPage('admin'); setShowAdminLogin(false); }} />
      )}

      <footer className="fixed bottom-0 w-full bg-blue-900 text-white text-center py-8 text-3xl border-t-8 border-blue-400 font-black tracking-widest uppercase z-40 shadow-2xl">
        TÜRKİYE MOBESE DENETİM MERKEZİ
      </footer>
    </div>
  );
}

function HomeScreen({ setPage }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-20 py-10">
      <div className="text-center space-y-8">
        <h2 className="text-[8rem] font-black text-slate-900 leading-[0.8] tracking-tighter">TRAFİK <br/> <span className="text-blue-600 underline decoration-blue-200">GÜVENLİĞİ</span></h2>
        <p className="text-4xl text-slate-500 font-black uppercase">Şehir İzleme ve Ceza Sorgulama Sistemi</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-6xl">
        <MenuButton icon={<Search size={100}/>} label="PLAKA SORGULA" color="blue" onClick={() => setPage('inquiry')} />
        <MenuButton icon={<Camera size={100}/>} label="MOBESE İZLE" color="emerald" onClick={() => setPage('camera')} />
      </div>
    </div>
  );
}

function MenuButton({ icon, label, color, onClick }) {
  const colors = { blue: 'text-blue-600 hover:border-blue-500', emerald: 'text-emerald-600 hover:border-emerald-500' };
  return (
    <button onClick={onClick} className={`p-24 bg-white border-[10px] border-white rounded-[70px] shadow-2xl transition-all hover:-translate-y-4 flex flex-col items-center space-y-10 group ${colors[color]}`}>
      <div className="group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <span className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{label}</span>
    </button>
  );
}

function CameraScreen({ isAdmin, streamState }) {
  const videoRef = useRef(null);

  useEffect(() => {
    // SADECE ADMİN VE YAYIN AKTİFSE kamerayı aç
    if (isAdmin && streamState.active) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => { if(videoRef.current) videoRef.current.srcObject = s; })
        .catch(e => console.error("Kamera açılamadı:", e));
    }
  }, [isAdmin, streamState.active]);

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="bg-black rounded-[80px] shadow-[0_80px_120px_-40px_rgba(0,0,0,0.4)] overflow-hidden relative border-[16px] border-white aspect-video flex items-center justify-center">
        {streamState.active ? (
          isAdmin ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-[50px] scale-x-[-1]" />
          ) : (
            <div className="text-center space-y-8 animate-slow-pulse">
              <Signal size={120} className="text-emerald-500 mx-auto" />
              <h3 className="text-6xl font-black text-white uppercase tracking-widest">CANLI YAYIN AKTİF</h3>
              <p className="text-2xl text-slate-400">Görüntü yöneticiden aktarılıyor...</p>
            </div>
          )
        ) : (
          <div className="text-center space-y-8">
            <PowerOff size={120} className="text-slate-700 mx-auto" />
            <h3 className="text-6xl font-black text-slate-600 uppercase tracking-widest">SİNYAL YOK</h3>
            <p className="text-2xl text-slate-500">Yönetici tarafından yayın başlatılmadı.</p>
          </div>
        )}

        <div className="absolute top-12 left-12 flex items-center gap-5 bg-red-600 text-white px-10 py-5 text-3xl font-black rounded-full shadow-2xl">
          <div className={`w-6 h-6 rounded-full bg-white ${streamState.active ? 'animate-pulse' : 'opacity-30'}`}></div>
          {streamState.active ? 'CANLI: MOBESE-01' : 'OFFLINE'}
        </div>
        
        <div className="absolute bottom-12 right-12 text-white/90 font-mono text-3xl bg-black/40 px-10 py-5 rounded-3xl backdrop-blur-xl border border-white/20">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
      {isAdmin && (
        <p className="text-center text-blue-600 text-2xl font-black uppercase">ŞU AN YAYINDASINIZ. TÜM SİSTEM SİZİ İZLİYOR.</p>
      )}
    </div>
  );
}

function InquiryScreen() {
  const [plate, setPlate] = useState('');
  return (
    <div className="max-w-5xl mx-auto space-y-16 py-10">
      <div className="bg-white p-10 rounded-[50px] shadow-2xl flex gap-6 border-8 border-white">
        <input className="flex-1 text-6xl font-black uppercase placeholder:text-slate-200 outline-none" placeholder="PLAKA NO..." value={plate} onChange={e => setPlate(e.target.value)} />
        <button className="bg-blue-600 text-white px-16 py-6 rounded-[35px] text-4xl font-black">ARA</button>
      </div>
      <div className="bg-white p-24 rounded-[80px] shadow-2xl border-8 border-white text-center">
        <p className="text-4xl font-black text-slate-300 mb-6 uppercase tracking-widest">Sorgulama Sonucu</p>
        <h3 className="text-[12rem] font-black text-slate-900 leading-none">{plate || '01 EDS 01'}</h3>
        <p className="text-6xl font-black text-emerald-500 mt-10">BORÇ BULUNAMADI</p>
      </div>
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
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-10">
      <div className="bg-white w-full max-w-2xl rounded-[60px] p-20 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-300"><X size={60} /></button>
        <h3 className="text-6xl font-black text-center mb-12 uppercase">MERKEZİ YETKİ</h3>
        <form onSubmit={handleLogin} className="space-y-10">
          <input type="password" className="w-full p-10 bg-slate-100 rounded-[35px] text-center text-6xl font-black tracking-widest outline-none border-4 border-transparent focus:border-blue-500" placeholder="****" value={pass} onChange={e => setPass(e.target.value)} />
          <button className="w-full py-10 bg-blue-600 text-white rounded-[35px] text-4xl font-black">SİSTEME GİR</button>
        </form>
      </div>
    </div>
  );
}

function AdminPanel({ streamState, onToggleStream }) {
  return (
    <div className="max-w-5xl mx-auto space-y-16 py-10">
      <div className="bg-white p-20 rounded-[70px] shadow-2xl border-l-[40px] border-blue-600 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-4">
          <h2 className="text-7xl font-black tracking-tighter uppercase">YAYIN MERKEZİ</h2>
          <p className="text-3xl font-bold text-slate-400">Kontrol Sizde</p>
        </div>
        <button 
          onClick={() => onToggleStream(!streamState.active)}
          className={`px-20 py-12 rounded-[40px] text-5xl font-black transition-all flex items-center gap-6 shadow-2xl ${streamState.active ? 'bg-red-600 text-white hover:bg-red-800' : 'bg-emerald-600 text-white hover:bg-emerald-800'}`}
        >
          {streamState.active ? <><PowerOff size={60}/> YAYINI KES</> : <><Radio size={60}/> YAYINI BAŞLAT</>}
        </button>
      </div>
      <div className="bg-white p-16 rounded-[60px] shadow-2xl space-y-8">
        <h4 className="text-4xl font-black uppercase text-slate-400">Sistem Durumu</h4>
        <div className="flex items-center gap-6 p-10 bg-slate-50 rounded-3xl border-4 border-slate-100">
          <div className={`w-10 h-10 rounded-full ${streamState.active ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
          <span className="text-4xl font-black">{streamState.active ? 'YAYIN AKTİF: VATANDAŞLAR SİZİ İZLİYOR' : 'YAYIN KAPALI: KAMERA GİZLİ'}</span>
        </div>
      </div>
    </div>
  );
}