import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  addDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Settings2, 
  Trash2, 
  X,
  LayoutDashboard,
  ChefHat,
  Coffee,
  Calendar,
  Timer,
  ChevronLeft,
  ChevronRight,
  Phone,
  ListOrdered,
  UserCircle,
  Search,
  MessageSquare,
  Save,
  StickyNote,
  Lock,
  Grid3X3
} from 'lucide-react';

// --- KONFIGURACJA I INICJALIZACJA FIREBASE ---

const myFirebaseConfig = {
  apiKey: "AIzaSyDADxt2Xm_13z_lkWvGp9otlUtlsBxTioI", // Pamiętaj, aby podmienić "WKLEJ_TUTAJ" na Twój klucz API
  authDomain: "wloskipiecrezerwacje.firebaseapp.com", // Pamiętaj, aby podmienić "WKLEJ_TUTAJ" na Twoją domenę
  projectId: "wloskipiecrezerwacje",
  storageBucket: "wloskipiecrezerwacje.firebasestorage.app",
  messagingSenderId: "977141469721",
  appId: "1:977141469721:web:a98252fb1c8d7fb1861088",
  measurementId: "G-3W1KLG4H3S"
};

// Logika środowiska: Jeśli wkleiłeś swoje klucze, użyje ich. 
// W przeciwnym razie użyje wbudowanych kluczy testowych środowiska.
const actualConfig = myFirebaseConfig.apiKey !== "AIzaSyDADxt2Xm_13z_lkWvGp9otlUtlsBxTioI" 
  ? myFirebaseConfig 
  : JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

const app = initializeApp(actualConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'table-manager-wloskipiec';

const TABLE_STATUSES = {
  AVAILABLE: { id: 'AVAILABLE', label: 'Dostępny', color: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
  OCCUPIED: { id: 'OCCUPIED', label: 'Zajęty', color: 'bg-rose-500', hover: 'hover:bg-rose-600' },
  RESERVED: { id: 'RESERVED', label: 'Rezerwacja', color: 'bg-amber-500', hover: 'hover:bg-amber-600' },
  CLEANING: { id: 'CLEANING', label: 'Sprzątanie', color: 'bg-blue-500', hover: 'hover:bg-blue-600' }
};

const INITIAL_TABLES_DATA = [
  { id: 10, number: '10', capacity: 4, x: 40, y: 40, shape: 'rect' },
  { id: 11, number: '11', capacity: 2, x: 180, y: 40, shape: 'rect' },
  { id: 12, number: '12', capacity: 4, x: 320, y: 40, shape: 'rect' },
  { id: 101, number: 'B1', capacity: 1, x: 480, y: 160, shape: 'round', type: 'bar' },
  { id: 102, number: 'B2', capacity: 1, x: 540, y: 160, shape: 'round', type: 'bar' },
  { id: 103, number: 'B3', capacity: 1, x: 600, y: 160, shape: 'round', type: 'bar' },
  { id: 104, number: 'B4', capacity: 1, x: 660, y: 160, shape: 'round', type: 'bar' },
  { id: 13, number: '13', capacity: 2, x: 140, y: 320, shape: 'rect' },
  { id: 20, number: '20', capacity: 2, x: 260, y: 320, shape: 'rect' },
  { id: 21, number: '21', capacity: 2, x: 380, y: 320, shape: 'rect' },
  { id: 22, number: '22', capacity: 2, x: 500, y: 320, shape: 'rect' },
  { id: 14, number: '14', capacity: 4, x: 140, y: 440, shape: 'rect' },
  { id: 15, number: '15', capacity: 4, x: 260, y: 440, shape: 'rect' },
  { id: 30, number: '30', capacity: 6, x: 380, y: 440, shape: 'rect', width: 'w-24' },
  { id: 31, number: '31', capacity: 4, x: 520, y: 440, shape: 'rect' },
  { id: 16, number: '16', capacity: 7, x: 40, y: 600, shape: 'round', type: 'booth' },
  { id: 34, number: '34', capacity: 2, x: 220, y: 600, shape: 'round' },
  { id: 33, number: '33', capacity: 2, x: 340, y: 600, shape: 'round' },
  { id: 32, number: '32', capacity: 2, x: 460, y: 600, shape: 'round' },
  { id: 35, number: '35', capacity: 5, x: 220, y: 740, shape: 'rect' },
  { id: 36, number: '36', capacity: 6, x: 340, y: 740, shape: 'rect' },
  { id: 37, number: '37', capacity: 6, x: 460, y: 740, shape: 'rect' },
  { id: 23, number: '23', capacity: 8, x: 750, y: 330, shape: 'round', size: 'w-32 h-32' },
  { id: 27, number: '27', capacity: 4, x: 750, y: 480, shape: 'rect' },
  { id: 26, number: '26', capacity: 4, x: 750, y: 600, shape: 'rect' },
  { id: 24, number: '24', capacity: 2, x: 890, y: 480, shape: 'round' },
  { id: 25, number: '25', capacity: 2, x: 890, y: 600, shape: 'round' },
];

const TIME_OPTIONS = [];
const TIME_SLOTS = [];
for (let h = 12; h <= 22; h++) {
  const hStr = h < 10 ? `0${h}` : `${h}`;
  TIME_OPTIONS.push({ v: `${hStr}:00`, l: `${hStr}:00` });
  TIME_SLOTS.push(`${hStr}:00`);
  if (h < 22) {
    TIME_OPTIONS.push({ v: `${hStr}:30`, l: `${hStr}:30` });
    TIME_SLOTS.push(`${hStr}:30`);
  }
}

const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Zdefiniowane grupy stolików, które można ze sobą łączyć
const COMBINABLE_GROUPS = [
  [10, 11, 12],
  [15, 30, 31],
  [26, 27]
];

// Funkcja pomocnicza do pobierania nazw połączonych stołów
const getAssignedTableNumbers = (res) => {
  const ids = res.tableIds || (res.tableId ? [res.tableId] : []);
  if (ids.length === 0) return "-";
  return ids.map(id => INITIAL_TABLES_DATA.find(t=>t.id===id)?.number).join(', ');
};

const App = () => {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('floor'); // floor, timeline, add-reservation, reservations, guests
  const [reservations, setReservations] = useState([]);
  const [tableStates, setTableStates] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showResForm, setShowResForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // Reservation form states
  const [resTableIds, setResTableIds] = useState([]);
  const [resTime, setResTime] = useState("18:00");
  const [resDuration, setResDuration] = useState(120);
  const [resName, setResName] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resPax, setResPax] = useState(2);
  const [resNotes, setResNotes] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [tempComment, setTempComment] = useState("");

  // --- AUTORYZACJA ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Błąd autoryzacji", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- DANE W CZASIE RZECZYWISTYM ---
  useEffect(() => {
    if (!user) return;

    const resRef = collection(db, 'artifacts', appId, 'public', 'data', 'reservations');
    const unsubRes = onSnapshot(resRef, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReservations(data);
      }
    );

    const stateRef = collection(db, 'artifacts', appId, 'public', 'data', 'tableStates');
    const unsubStates = onSnapshot(stateRef,
      (snapshot) => {
        const states = {};
        snapshot.docs.forEach(doc => { states[doc.id] = doc.data(); });
        setTableStates(states);
      }
    );

    return () => { unsubRes(); unsubStates(); };
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const currentDayReservations = useMemo(() => 
    reservations.filter(r => r.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time)),
    [reservations, selectedDate]
  );

  const guestDatabase = useMemo(() => {
    const guests = {};
    reservations.forEach(r => {
      const phone = r.phone?.trim() || "Brak numeru";
      const name = r.name?.trim() || "Nieznany";
      const key = `${name.toLowerCase()}_${phone.toLowerCase()}`;
      
      if (!guests[key]) {
        guests[key] = { idKey: key, name: r.name, phone: phone, lastVisit: r.date, visitCount: 0, allVisits: [] };
      }
      
      guests[key].visitCount += 1;
      guests[key].allVisits.push({ date: r.date, notes: r.notes, feedback: r.feedback, pax: r.pax, id: r.id, time: r.time });

      if (new Date(r.date) >= new Date(guests[key].lastVisit)) {
        guests[key].name = r.name;
        guests[key].lastVisit = r.date;
      }
    });

    return Object.values(guests).filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.phone.includes(searchTerm)).sort((a,b) => b.visitCount - a.visitCount);
  }, [reservations, searchTerm]);

  const getUpcomingReservation = (tableId) => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate !== today) return null;
    const tableRes = currentDayReservations.filter(r => (r.tableIds || [r.tableId]).includes(tableId));
    if (tableRes.length === 0) return null;
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return tableRes.find(res => {
      const resMinutes = timeToMinutes(res.time);
      const diff = resMinutes - nowMinutes;
      return diff > 0 && diff <= 60;
    });
  };

  const updateTableManualStatus = async (id, newStatus) => {
    if (!user) return;
    if (newStatus === 'OCCUPIED' && getUpcomingReservation(id)) {
      setNotification({ message: `Stolik zablokowany - nadchodząca rezerwacja!`, type: 'warning' });
      return;
    }
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'tableStates', String(id));
    await setDoc(docRef, { status: newStatus, occupiedSince: newStatus === 'OCCUPIED' ? Date.now() : null });
    setNotification({ message: `Status stolika zaktualizowany`, type: 'success' });
  };

  const handleTableSelectionChange = (newIds) => {
    setResTableIds(newIds);
    const totalCap = newIds.reduce((sum, tid) => sum + (INITIAL_TABLES_DATA.find(t=>t.id===tid)?.capacity || 0), 0);
    if (totalCap > 0) {
      setResPax(totalCap);
    } else {
      setResPax(2);
    }
  };

  const addReservation = async () => {
    if (!user || resTableIds.length === 0) {
      setNotification({ message: `Proszę wybrać przynajmniej jeden stolik!`, type: 'warning' });
      return;
    }

    const newStart = timeToMinutes(resTime);
    const newEnd = newStart + parseInt(resDuration);

    const hasConflict = reservations.some(r => {
      if (r.date !== selectedDate) return false;
      const rTables = r.tableIds || [r.tableId];
      
      const intersects = rTables.some(tid => resTableIds.includes(tid));
      if (!intersects) return false;
      
      const existStart = timeToMinutes(r.time);
      const existEnd = existStart + parseInt(r.duration);
      return newStart < existEnd && newEnd > existStart;
    });

    if (hasConflict) {
      setNotification({ message: `Błąd! Przynajmniej jeden ze stolików jest już zajęty w tym czasie.`, type: 'warning' });
      return;
    }

    const newRes = { 
      tableIds: resTableIds, date: selectedDate, time: resTime, duration: parseInt(resDuration), 
      name: resName || "Klient", phone: resPhone || "Brak numeru", pax: parseInt(resPax) || 2,
      notes: resNotes || "", feedback: "", createdAt: Date.now()
    };
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reservations'), newRes);
    setNotification({ message: `Rezerwacja dodana poprawnie`, type: 'success' });
    
    setShowResForm(false);
    setResName(""); setResPhone(""); setResNotes(""); setResPax(2); setResTableIds([]);
    
    if (activeView === 'add-reservation') setActiveView('timeline');
  };

  const updateReservationFeedback = async (resId, feedback) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'reservations', resId);
    await updateDoc(docRef, { feedback });
    setEditingCommentId(null);
    setNotification({ message: `Komentarz został zapisany`, type: 'success' });
  };

  const deleteReservation = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reservations', id));
  };

  const getOccupancyTime = (occupiedSince) => {
    if (!occupiedSince) return null;
    const diffMins = Math.floor((currentTime.getTime() - occupiedSince) / 60000);
    return diffMins < 60 ? `${diffMins} min` : `${Math.floor(diffMins/60)}h ${diffMins%60}m`;
  };

  const calculateEndTime = (startTime, duration) => {
    const [h, m] = startTime.split(':').map(Number);
    const d = new Date(); d.setHours(h); d.setMinutes(m + parseInt(duration));
    const finalH = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
    const finalM = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
    return `${finalH}:${finalM}`;
  };

  const changeDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
    setSelectedTableId(null);
  };

  const handleTimelineClick = (tableId, time) => {
    setResTime(time);
    handleTableSelectionChange([tableId]);
    setActiveView('add-reservation');
  };

  const selectedTableData = INITIAL_TABLES_DATA.find(t => t.id === selectedTableId);
  const upcomingResForSelected = selectedTableId ? getUpcomingReservation(selectedTableId) : null;

  const sortedTablesForTimeline = [...INITIAL_TABLES_DATA].sort((a, b) => {
    const numA = parseInt(a.number) || 999;
    const numB = parseInt(b.number) || 999;
    return numA - numB;
  });

  const timelineColors = ['bg-red-500', 'bg-rose-600', 'bg-red-600', 'bg-rose-500', 'bg-red-700'];

  const tableOptions = [
    { v: "", l: "-- Wybierz stolik --" },
    ...INITIAL_TABLES_DATA.map(t => ({ v: t.id, l: `${t.type === 'bar' ? '' : 'Stół'} ${t.number} (do ${t.capacity} os.)` }))
  ];

  if (!user) return <div className="flex items-center justify-center h-screen font-bold text-slate-400 italic">Łączenie z bazą danych...</div>;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-orange-400 to-rose-500 p-2.5 rounded-2xl text-white shadow-lg"><ChefHat size={28} /></div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Rezerwacje Włoski Piec</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Manager | Panel Sterowania</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <button onClick={() => changeDate(-1)} className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-600"><ChevronLeft size={22} /></button>
          <div className="px-6 flex items-center gap-4 border-x border-slate-200 mx-2">
            <Calendar size={20} className="text-indigo-600" />
            <input type="date" value={selectedDate} onChange={(e) => {setSelectedDate(e.target.value); setSelectedTableId(null);}} className="bg-transparent font-black text-slate-700 outline-none cursor-pointer text-base" />
          </div>
          <button onClick={() => changeDate(1)} className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-600"><ChevronRight size={22} /></button>
        </div>

        <nav className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
          <NavBtn active={activeView === 'floor'} onClick={() => setActiveView('floor')} icon={<LayoutDashboard size={18}/>} label="Plan Sali" />
          <NavBtn active={activeView === 'timeline'} onClick={() => setActiveView('timeline')} icon={<Grid3X3 size={18}/>} label="Grafik Czasowy" />
          <NavBtn active={activeView === 'add-reservation'} onClick={() => { setActiveView('add-reservation'); setResTableIds([]); setResPax(2); }} icon={<Plus size={18}/>} label="Rezerwuj" />
          <NavBtn active={activeView === 'reservations'} onClick={() => setActiveView('reservations')} icon={<ListOrdered size={18}/>} label="Lista Wizyt" />
          <NavBtn active={activeView === 'guests'} onClick={() => setActiveView('guests')} icon={<UserCircle size={18}/>} label="Baza Gości" />
        </nav>
      </header>

      <main className="flex-1 p-8 flex flex-col">
        <div className="max-w-full mx-auto h-full w-full">
          
          {/* WIDOK 1: PLAN SALI */}
          {activeView === 'floor' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
              <div className="xl:col-span-9 bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 relative overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-8 px-2">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Plan Restauracji</h2>
                    <p className="text-xs font-bold text-slate-400">Widok na dzień: {selectedDate}</p>
                  </div>
                  <div className="flex gap-6">
                    <LegendItem color="bg-emerald-500" label="Wolny" />
                    <LegendItem color="bg-rose-500" label="Zajęty" />
                    <LegendItem color="bg-amber-500" label="Rezerwacja" />
                    <LegendItem color="ring-4 ring-amber-300 animate-pulse bg-emerald-500" label="Blokada 60m" />
                  </div>
                </div>

                <div className="relative flex-1 bg-slate-50 rounded-3xl border border-slate-100 overflow-auto shadow-inner p-10 min-h-[850px]">
                  {INITIAL_TABLES_DATA.map(table => {
                    const tableRes = currentDayReservations.filter(r => (r.tableIds || [r.tableId]).includes(table.id));
                    const state = tableStates[table.id] || { status: 'AVAILABLE' };
                    const occupancyTime = getOccupancyTime(state.occupiedSince);
                    const isUpcoming = getUpcomingReservation(table.id);
                    let statusColor = TABLE_STATUSES[state.status].color;
                    if (tableRes.length > 0) statusColor = TABLE_STATUSES.RESERVED.color;
                    const size = table.size || (table.type === 'bar' ? 'w-14 h-14' : table.type === 'booth' ? 'w-32 h-32' : `${table.width || 'w-24'} h-20`);
                    const shape = table.shape === 'round' ? 'rounded-full' : table.type === 'booth' ? 'rounded-tr-[3.5rem] rounded-bl-[3.5rem]' : 'rounded-2xl';

                    return (
                      <button key={table.id} onClick={() => { setSelectedTableId(table.id); setShowResForm(false); }} style={{ left: table.x, top: table.y }}
                        className={`absolute ${size} ${shape} flex flex-col items-center justify-center text-white transition-all transform hover:scale-105 shadow-2xl active:scale-95 z-10 ${statusColor} ${selectedTableId === table.id ? 'ring-8 ring-indigo-200 ring-offset-4' : ''} ${isUpcoming ? 'ring-4 ring-amber-400 animate-pulse ring-offset-2' : ''}`}
                      >
                        <span className="text-2xl font-black leading-none mb-1">{table.number}</span>
                        <div className="flex items-center gap-1.5 opacity-80 font-bold text-xs"><Users size={14} /><span>{table.capacity}</span></div>
                        {state.status === 'OCCUPIED' && occupancyTime && (<div className="absolute -bottom-2 bg-white text-rose-600 rounded-full px-2.5 py-1 text-[10px] font-black border border-rose-100 shadow-lg whitespace-nowrap">{occupancyTime}</div>)}
                        {tableRes.length > 0 && (<div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 border border-slate-100 shadow-lg"><Clock size={16} className={`${isUpcoming ? 'text-amber-600 animate-bounce' : 'text-amber-500'}`} /></div>)}
                      </button>
                    )})}
                </div>
              </div>

              <div className="xl:col-span-3">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 h-full flex flex-col overflow-y-auto">
                  {selectedTableId ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Stół {selectedTableData?.number}</h2>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Pojemność: {selectedTableData?.capacity} os.</p>
                        </div>
                        <button onClick={() => setSelectedTableId(null)} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-colors text-slate-300 hover:text-slate-600"><X size={24}/></button>
                      </div>

                      {!showResForm ? (
                        <div className="space-y-8">
                          {upcomingResForSelected && (
                            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex items-start gap-3 animate-pulse">
                              <Lock className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                              <div>
                                <p className="text-amber-800 font-black text-xs uppercase">Blokada rezerwacji</p>
                                <p className="text-amber-700 text-[11px] font-medium leading-tight mt-1">Przygotuj stolik dla gościa <b>{upcomingResForSelected.name}</b> na godzinę <b>{upcomingResForSelected.time}</b>.</p>
                              </div>
                            </div>
                          )}

                          <div className="bg-slate-50 p-6 rounded-[2rem] space-y-6">
                            <button onClick={() => updateTableManualStatus(selectedTableId, 'OCCUPIED')} disabled={!!upcomingResForSelected}
                              className={`w-full py-6 rounded-2xl font-black text-sm uppercase flex flex-col items-center gap-2 transition-all shadow-sm ${upcomingResForSelected ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60' : tableStates[selectedTableId]?.status === 'OCCUPIED' ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300'}`}
                            >
                              <Clock size={24} />Zajmij Live
                              {tableStates[selectedTableId]?.status === 'OCCUPIED' && <span className="opacity-80 text-[11px]">Od: {getOccupancyTime(tableStates[selectedTableId].occupiedSince)}</span>}
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                              {['AVAILABLE', 'CLEANING'].map(sid => (
                                <button key={sid} onClick={() => updateTableManualStatus(selectedTableId, sid)} className={`py-4 rounded-xl text-[10px] font-black uppercase border transition-all ${tableStates[selectedTableId]?.status === sid ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-500 border-slate-200'}`}>{TABLE_STATUSES[sid].label}</button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">Harmonogram stolika</h3>
                            <div className="space-y-3">
                              {currentDayReservations.filter(r => (r.tableIds || [r.tableId]).includes(selectedTableId)).map(res => (
                                <div key={res.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                                  <div className={`absolute top-0 left-0 w-1.5 h-full ${upcomingResForSelected?.id === res.id ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                      <p className="font-black text-slate-800 text-base">{res.time} - {calculateEndTime(res.time, res.duration)}</p>
                                      <div className="flex items-center gap-2 text-indigo-500">
                                        <p className="text-xs font-bold uppercase">{res.name}</p>
                                        <span className="text-[10px] bg-indigo-50 px-1.5 rounded-md flex items-center gap-1"><Users size={10}/> {res.pax}</span>
                                      </div>
                                    </div>
                                    <button onClick={() => deleteReservation(res.id)} className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20} /></button>
                                  </div>
                                  {res.notes && (<div className="mt-3 flex gap-2 text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100"><StickyNote size={14} className="flex-shrink-0 text-slate-400" /><span>{res.notes}</span></div>)}
                                  
                                  {/* Pokaż z czym ten stół jest połączony, jeśli to rezerwacja zbiorowa */}
                                  {(res.tableIds?.length > 1) && (
                                    <div className="mt-2 text-[9px] font-black text-slate-400 uppercase border-t border-slate-100 pt-2">
                                      Łączony: Stół {getAssignedTableNumbers(res)}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {currentDayReservations.filter(r => (r.tableIds || [r.tableId]).includes(selectedTableId)).length === 0 && (<div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200"><p className="text-[11px] font-black text-slate-300 uppercase">Dziś brak planów</p></div>)}
                            </div>
                            <button onClick={() => { 
                              setShowResForm(true); 
                              handleTableSelectionChange([selectedTableId]); 
                            }} className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3"><Plus size={22} /> Rezerwuj stolik</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500 pb-10">
                           <div className="bg-slate-50 p-6 rounded-[2rem] space-y-5">
                              <InputGroup label="Godzina przyjścia" type="select" value={resTime} onChange={e=>setResTime(e.target.value)} options={TIME_OPTIONS} />
                              <InputGroup label="Długość wizyty" type="select" value={resDuration} onChange={e=>setResDuration(e.target.value)} options={[
                                {v: 60, l: '1 godzina'}, {v: 90, l: '1.5 godziny'}, {v: 120, l: '2 godziny (standard)'}, {v: 150, l: '2.5 godziny'}, {v: 180, l: '3 godziny'}, {v: 240, l: '4 godziny (limit)'}
                              ]} />
                           </div>
                           <div className="bg-white p-6 rounded-[2rem] border border-slate-200 space-y-5">
                              <InputGroup label="Imię i Nazwisko" type="text" placeholder="Np. Kowalski" value={resName} onChange={e=>setResName(e.target.value)} />
                              <InputGroup label="Telefon Kontaktowy" type="tel" placeholder="+48 ___ ___ ___" value={resPhone} onChange={e=>setResPhone(e.target.value)} />
                              <InputGroup label={`Liczba gości`} type="number" value={resPax} onChange={e=>setResPax(e.target.value)} min={1} max={50} />
                              <InputGroup label="Uwagi / Życzenia specjalne" type="textarea" placeholder="Np. stolik przy oknie, alergie..." value={resNotes} onChange={e=>setResNotes(e.target.value)} />
                           </div>
                           
                           <MultiTableSelect selectedIds={resTableIds} onChange={handleTableSelectionChange} />
                           
                           <div className="flex gap-4">
                             <button onClick={()=>setShowResForm(false)} className="flex-1 py-5 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Anuluj</button>
                             <button onClick={addReservation} className="flex-[2] bg-indigo-600 text-white rounded-3xl py-5 font-black uppercase text-sm shadow-xl hover:shadow-indigo-200 transition-all">Zatwierdź</button>
                           </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
                      <div className="bg-slate-50 p-12 rounded-[2.5rem] text-slate-200 border border-slate-100"><Coffee size={64}/></div>
                      <p className="text-slate-800 font-black uppercase text-sm tracking-widest">Wybierz stolik</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* WIDOK 2: GRAFIK CZASOWY (EXCEL-LIKE) */}
          {activeView === 'timeline' && (
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 p-8 flex flex-col animate-in fade-in duration-500">
               <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Grafik Czasowy</h2>
                    <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest mt-1">Wizualny podgląd obłożenia: {selectedDate}</p>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    Kliknij puste pole, aby dodać rezerwację
                  </div>
               </div>
               
               <div className="w-full max-h-[75vh] overflow-auto border border-slate-200 rounded-2xl relative shadow-inner bg-slate-50/50">
                  <table className="w-full border-collapse text-sm text-center">
                    <thead className="sticky top-0 z-30 bg-white shadow-sm">
                      <tr>
                        <th className="sticky left-0 top-0 bg-white z-40 p-2 border-b border-r border-slate-200 w-16 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                          <Clock size={16} className="mx-auto text-slate-300" />
                        </th>
                        {sortedTablesForTimeline.map(t => (
                          <th key={t.id} className="p-1.5 border-b border-r border-slate-200 min-w-[50px] max-w-[65px]">
                             <p className="font-black text-slate-800 text-sm leading-none">{t.number}</p>
                             <p className="text-[8px] font-bold text-slate-400 mt-0.5"><Users size={8} className="inline"/> {t.capacity}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map(slotTime => {
                        const slotMins = timeToMinutes(slotTime);
                        return (
                          <tr key={slotTime} className="group">
                            <td className="sticky left-0 bg-white z-20 p-2 border-b border-r border-slate-200 font-black text-slate-500 text-[10px] md:text-xs shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                              {slotTime}
                            </td>
                            {sortedTablesForTimeline.map(t => {
                               // Tu magia się dzieje - rTables to tablica wielu id połączonych stolików
                               const resInSlot = currentDayReservations.find(r => {
                                  const rTables = r.tableIds || [r.tableId];
                                  if (!rTables.includes(t.id)) return false;
                                  const rStart = timeToMinutes(r.time);
                                  const rEnd = rStart + r.duration;
                                  return rStart <= slotMins && rEnd > slotMins;
                               });

                               if (resInSlot) {
                                  const isStart = timeToMinutes(resInSlot.time) === slotMins;
                                  const isEnd = timeToMinutes(resInSlot.time) + resInSlot.duration - 30 === slotMins;

                                  return (
                                    <td key={t.id} className={`border-r border-slate-200 bg-red-500 p-0 relative ${isEnd ? 'border-b border-slate-200' : 'border-b border-red-600'}`}>
                                       <div className="w-full h-full min-h-[28px] flex items-center justify-center overflow-hidden">
                                          {isStart && <span className="text-[8px] font-black text-white px-0.5 truncate absolute top-0.5 z-10 drop-shadow-md w-full text-center">{resInSlot.name}</span>}
                                       </div>
                                    </td>
                                  )
                               }

                               return (
                                 <td 
                                  key={t.id} 
                                  className="border-b border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors p-0"
                                  onClick={() => handleTimelineClick(t.id, slotTime)}
                                 >
                                    <div className="w-full h-full min-h-[28px] opacity-0 group-hover:opacity-100 flex items-center justify-center text-slate-300">
                                      <Plus size={14}/>
                                    </div>
                                 </td>
                               );
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* WIDOK 3: NOWA REZERWACJA (PEŁNY EKRAN) */}
          {activeView === 'add-reservation' && (
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 p-10 h-full flex flex-col animate-in fade-in duration-500 max-w-5xl mx-auto overflow-y-auto">
              <div className="mb-10 text-center">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Nowa Rezerwacja</h2>
                <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest mt-2">Wybierany termin: {selectedDate}</p>
              </div>
              
              <div className="space-y-8 flex-1">
                 <div className="bg-slate-50 p-8 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InputGroup label="Wybierz stolik" type="select" value={resTableIds[0] || ""} onChange={e=>{
                      const val = e.target.value;
                      if (!val) {
                        handleTableSelectionChange([]);
                      } else {
                        handleTableSelectionChange([Number(val)]);
                      }
                    }} options={tableOptions} />
                    <InputGroup label="Liczba gości" type="number" value={resPax} onChange={e=>setResPax(e.target.value)} min={1} max={50} />
                    <InputGroup label="Godzina" type="select" value={resTime} onChange={e=>setResTime(e.target.value)} options={TIME_OPTIONS} />
                    <InputGroup label="Czas trwania" type="select" value={resDuration} onChange={e=>setResDuration(e.target.value)} options={[{v: 60, l: '1h'}, {v: 120, l: '2h'}, {v: 180, l: '3h'}, {v: 240, l: '4h'}]} />
                 </div>
                 
                 <div className="bg-white p-8 rounded-[2rem] border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Imię i Nazwisko" type="text" placeholder="Np. Kowalski" value={resName} onChange={e=>setResName(e.target.value)} />
                    <InputGroup label="Nr Telefonu" type="tel" placeholder="+48..." value={resPhone} onChange={e=>setResPhone(e.target.value)} />
                    <div className="md:col-span-2">
                      <InputGroup label="Uwagi / Życzenia" type="textarea" placeholder="Specjalne życzenia..." value={resNotes} onChange={e=>setResNotes(e.target.value)} />
                    </div>
                 </div>

                 <MultiTableSelect selectedIds={resTableIds} onChange={handleTableSelectionChange} />
              </div>
              
              <div className="mt-8 flex gap-4 justify-end">
                 <button onClick={()=>setActiveView('timeline')} className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Anuluj</button>
                 <button onClick={addReservation} className="px-12 bg-indigo-600 text-white rounded-3xl py-5 font-black uppercase text-sm shadow-xl hover:shadow-indigo-200 transition-all flex items-center gap-2"><Plus size={18} /> Dodaj Rezerwację</button>
              </div>
            </div>
          )}

          {/* WIDOK 4: LISTA REZERWACJI */}
          {activeView === 'reservations' && (
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 p-10 h-full flex flex-col animate-in fade-in duration-500 text-wrap">
              <div className="mb-10"><h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Lista Rezerwacji</h2></div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">
                      <th className="pb-6 px-6">Godzina</th><th className="pb-6 px-6">Stół</th><th className="pb-6 px-6">Klient</th><th className="pb-6 px-6">Osób</th><th className="pb-6 px-6">Uwagi</th><th className="pb-6 px-6">Status / Komentarz</th><th className="pb-6 px-6 text-right">Zarządzaj</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentDayReservations.map(res => (
                      <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-7 px-6">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-lg">{res.time}</span>
                            <span className="text-[10px] text-slate-400 font-bold">Koniec: {calculateEndTime(res.time, res.duration)}</span>
                          </div>
                        </td>
                        <td className="py-7 px-6">
                          <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-black text-sm uppercase">
                            Stół {getAssignedTableNumbers(res)}
                          </span>
                        </td>
                        <td className="py-7 px-6"><div><p className="font-black text-slate-800">{res.name}</p><p className="text-xs font-bold text-slate-400">{res.phone}</p></div></td>
                        <td className="py-7 px-6 font-black text-slate-700"><Users size={18} className="inline mr-2 text-slate-300"/> {res.pax}</td>
                        <td className="py-7 px-6 text-sm italic text-slate-500 max-w-xs">{res.notes || "-"}</td>
                        <td className="py-7 px-6">
                           {editingCommentId === res.id ? (
                             <div className="flex gap-2">
                               <input type="text" value={tempComment} onChange={e=>setTempComment(e.target.value)} className="flex-1 px-4 py-2 rounded-xl border-2 border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Wpisz komentarz..."/>
                               <button onClick={()=>updateReservationFeedback(res.id, tempComment)} className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg"><Save size={18}/></button>
                             </div>
                           ) : (
                             <div className="flex items-center gap-3">
                               {res.feedback ? (<p className="text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-2xl flex items-center gap-2"><MessageSquare size={14} className="text-indigo-400"/> {res.feedback}</p>) : (<span className="text-slate-300 text-xs italic">Brak komentarza po wizycie</span>)}
                               <button onClick={()=>{setEditingCommentId(res.id); setTempComment(res.feedback || "");}} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-colors"><MessageSquare size={18}/></button>
                             </div>
                           )}
                        </td>
                        <td className="py-7 px-6 text-right"><button onClick={() => deleteReservation(res.id)} className="p-3 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={22}/></button></td>
                      </tr>
                    ))}
                    {currentDayReservations.length === 0 && (
                      <tr><td colSpan="7" className="py-32 text-center text-slate-400 font-bold text-lg uppercase tracking-widest italic opacity-40">Brak zaplanowanych rezerwacji</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WIDOK 5: BAZA GOŚCI (TABELA) */}
          {activeView === 'guests' && (
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 p-10 h-full flex flex-col animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Baza Danych Gości</h2>
                <div className="relative w-full md:w-[32rem]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24}/>
                  <input type="text" placeholder="Szukaj gościa..." className="w-full pl-12 pr-6 py-4 rounded-[1.5rem] bg-slate-50 border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold text-lg transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="flex-1 overflow-auto rounded-[2rem] border border-slate-200">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="py-5 px-6 border-b border-slate-200">Gość</th>
                      <th className="py-5 px-6 border-b border-slate-200">Telefon</th>
                      <th className="py-5 px-6 border-b border-slate-200">Liczba wizyt</th>
                      <th className="py-5 px-6 border-b border-slate-200">Ostatnia wizyta</th>
                      <th className="py-5 px-6 border-b border-slate-200">Historia i Uwagi (ostatnie 3 wizyty)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {guestDatabase.map(guest => (
                      <tr key={guest.idKey} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 px-6 font-black text-slate-800 text-lg align-top">
                          <div className="flex items-center gap-3">
                            <UserCircle size={28} className="text-indigo-500" />
                            {guest.name}
                          </div>
                        </td>
                        <td className="py-6 px-6 font-bold text-slate-600 align-top">
                          <span className="flex items-center gap-2 mt-1"><Phone size={16} className="text-indigo-400"/> {guest.phone}</span>
                        </td>
                        <td className="py-6 px-6 align-top">
                          <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-black text-sm mt-1 inline-block">{guest.visitCount}</span>
                        </td>
                        <td className="py-6 px-6 font-bold text-slate-500 align-top">
                          <div className="mt-1">{guest.lastVisit}</div>
                        </td>
                        <td className="py-6 px-6 text-sm align-top">
                          <div className="space-y-3 max-w-lg">
                            {guest.allVisits.slice().reverse().slice(0, 3).map(visit => (
                              <div key={visit.id} className="bg-white p-4 rounded-2xl border border-slate-200 text-xs shadow-sm">
                                <div className="flex justify-between font-black text-indigo-500 mb-2">
                                  <span>{visit.date} {visit.time} ({visit.pax} os.)</span>
                                </div>
                                {visit.notes && <p className="text-slate-600 italic mb-2 bg-amber-50 p-2 rounded-lg border border-amber-100">"{visit.notes}"</p>}
                                {visit.feedback && <p className="font-bold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100"><MessageSquare size={12} className="inline text-indigo-400 mr-2"/>{visit.feedback}</p>}
                                {!visit.notes && !visit.feedback && <p className="text-slate-300 italic">Brak uwag</p>}
                              </div>
                            ))}
                            {guest.allVisits.length > 3 && (
                              <p className="text-xs font-bold text-slate-400 italic text-center py-2">+ {guest.allVisits.length - 3} wcześniejszych wizyt</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {guestDatabase.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-32 text-center text-slate-400 font-black italic text-xl opacity-30 tracking-widest uppercase">
                          Baza danych jest pusta
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {notification && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 z-[100] animate-in slide-in-from-bottom-12 duration-500 border border-white/10">
          <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${notification.type === 'warning' ? 'bg-amber-400 shadow-amber-400/50' : 'bg-emerald-400 shadow-emerald-400/50'}`}></div>
          <span className="text-[13px] font-black uppercase tracking-widest">{notification.message}</span>
        </div>
      )}
    </div>
  );
};

// --- KOMPONENTY POMOCNICZE ---

// Zaktualizowany komponent do wyboru stolików obsługujący dedykowane grupy
const MultiTableSelect = ({ selectedIds, onChange }) => {
  if (!selectedIds || selectedIds.length === 0) return null;

  const primaryTableId = Number(selectedIds[0]);
  const activeGroup = COMBINABLE_GROUPS.find(g => g.includes(primaryTableId));

  // Jeśli stolik nie należy do żadnej grupy lub jest sam, nie pokazuj panelu
  if (!activeGroup || activeGroup.length <= 1) return null;

  const toggle = (id) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  };
  
  return (
    <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100">
      <label className="text-[10px] font-black text-indigo-500 uppercase block mb-4 ml-2 tracking-widest">Większa grupa? Połącz z sąsiednimi stolikami:</label>
      <div className="flex flex-wrap gap-3">
        {activeGroup.filter(id => id !== primaryTableId).map(id => {
          const t = INITIAL_TABLES_DATA.find(table => table.id === id);
          if(!t) return null;
          const isSel = selectedIds.includes(id);
          return (
            <button
              key={id}
              onClick={(e) => { e.preventDefault(); toggle(id); }}
              className={`px-5 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 border-2 ${isSel ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-105' : 'bg-white border-indigo-100 text-slate-600 hover:border-indigo-300'}`}
            >
              <Plus size={16} className={isSel ? "rotate-45 transition-transform" : "transition-transform text-indigo-400"} />
              Stół {t.number}
              <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md ml-1 ${isSel ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}><Users size={12}/>{t.capacity}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center whitespace-nowrap gap-3 px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${active ? 'bg-white text-slate-800 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
    {icon} <span>{label}</span>
  </button>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-3 text-[11px] font-black uppercase text-slate-400 tracking-widest">
    <div className={`w-3.5 h-3.5 rounded-full shadow-lg ${color}`}></div> {label}
  </div>
);

const InputGroup = ({ label, type, value, onChange, placeholder, options, min, max }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-2 tracking-widest">{label}</label>
    {type === 'select' ? (
      <select value={value} onChange={onChange} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all">
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea placeholder={placeholder} value={value} onChange={onChange} rows={2} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none" />
    ) : (
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} min={min} max={max} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
    )}
  </div>
);

export default App;