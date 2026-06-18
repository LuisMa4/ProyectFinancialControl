export const EXPENSES_STORAGE_KEY = "savia-expenses";
export const EXPENSES_CHANGED_EVENT = "savia-expenses-changed";

export const EXPENSE_CATEGORIES = [
  { id:"alimentacion", name:"Alimentación",    icon:"🍔", color:"#7EC8C0", presupuesto:800  },
  { id:"transporte",   name:"Transporte",       icon:"🚗", color:"#5AADA5", presupuesto:400  },
  { id:"entrete",      name:"Entretenimiento",  icon:"🎬", color:"#A8DBD6", presupuesto:300  },
  { id:"salud",        name:"Salud",            icon:"💊", color:"#C9A96E", presupuesto:250  },
  { id:"educacion",    name:"Educación",        icon:"📚", color:"#8AADA9", presupuesto:200  },
  { id:"servicios",    name:"Servicios",        icon:"⚡", color:"#4A706C", presupuesto:350  },
  { id:"ropa",         name:"Ropa",             icon:"👗", color:"#D4B8A0", presupuesto:150  },
  { id:"otros",        name:"Otros",            icon:"📦", color:"#DDE9E7", presupuesto:200  },
];

export const DEMO_EXPENSES = [
  { id:1,  desc:"Wong - Compras mensuales",   cat:"alimentacion", monto:185.50, fecha:"2025-05-24", nota:"Despensa completa",     recurrente:false },
  { id:2,  desc:"Uber",                        cat:"transporte",   monto:18.90,  fecha:"2025-05-23", nota:"",                      recurrente:false },
  { id:3,  desc:"Netflix",                     cat:"entrete",      monto:37.90,  fecha:"2025-05-23", nota:"Suscripción mensual",   recurrente:true  },
  { id:4,  desc:"Farmacia Inkafarma",          cat:"salud",        monto:62.00,  fecha:"2025-05-22", nota:"Medicamentos",          recurrente:false },
  { id:5,  desc:"Luz del Sur",                 cat:"servicios",    monto:89.00,  fecha:"2025-05-21", nota:"Recibo mayo",           recurrente:true  },
  { id:6,  desc:"Plaza Vea",                   cat:"alimentacion", monto:134.20, fecha:"2025-05-20", nota:"",                      recurrente:false },
  { id:7,  desc:"Metropolitano",               cat:"transporte",   monto:50.00,  fecha:"2025-05-19", nota:"Recarga tarjeta",       recurrente:false },
  { id:8,  desc:"Spotify",                     cat:"entrete",      monto:19.90,  fecha:"2025-05-18", nota:"",                      recurrente:true  },
  { id:9,  desc:"Claro Internet",              cat:"servicios",    monto:89.00,  fecha:"2025-05-18", nota:"Plan Hogar",            recurrente:true  },
  { id:10, desc:"Librería",                    cat:"educacion",    monto:45.00,  fecha:"2025-05-15", nota:"Cuadernos y útiles",    recurrente:false },
  { id:11, desc:"Cineplanet",                  cat:"entrete",      monto:38.00,  fecha:"2025-05-14", nota:"Película + pop corn",   recurrente:false },
  { id:12, desc:"KFC",                         cat:"alimentacion", monto:52.80,  fecha:"2025-05-13", nota:"Almuerzo familiar",     recurrente:false },
  { id:13, desc:"Ripley - Camisas",            cat:"ropa",         monto:129.90, fecha:"2025-05-12", nota:"",                      recurrente:false },
  { id:14, desc:"Gimnasio",                    cat:"salud",        monto:80.00,  fecha:"2025-05-10", nota:"Mensualidad",           recurrente:true  },
  { id:15, desc:"Taxi",                        cat:"transporte",   monto:25.00,  fecha:"2025-05-09", nota:"",                      recurrente:false },
  { id:16, desc:"Dentista",                    cat:"salud",        monto:120.00, fecha:"2025-05-07", nota:"Limpieza dental",       recurrente:false },
  { id:17, desc:"Curso Udemy",                 cat:"educacion",    monto:39.90,  fecha:"2025-05-06", nota:"Python para finanzas",  recurrente:false },
  { id:18, desc:"Agua Sedapal",                cat:"servicios",    monto:42.00,  fecha:"2025-05-05", nota:"",                      recurrente:true  },
  { id:19, desc:"Zara",                        cat:"ropa",         monto:89.00,  fecha:"2025-05-03", nota:"",                      recurrente:false },
  { id:20, desc:"Gas",                         cat:"otros",        monto:28.00,  fecha:"2025-05-02", nota:"Balón de gas",          recurrente:false },
];

import { apiRequest } from "./apiClient";

export const readStoredExpenses = () => {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const loadStoredExpenses = async (fallback = []) => {
  try {
    const expenses = await apiRequest("/expenses");
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    window.dispatchEvent(new CustomEvent(EXPENSES_CHANGED_EVENT, { detail: expenses }));
    return expenses;
  } catch {
    return readStoredExpenses() || fallback;
  }
};

export const writeStoredExpenses = async (expenses) => {
  try {
    const saved = await apiRequest("/expenses", {
      method: "PUT",
      body: JSON.stringify({ expenses }),
    });
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(saved));
    window.dispatchEvent(new CustomEvent(EXPENSES_CHANGED_EVENT, { detail: saved }));
    return saved;
  } catch {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    window.dispatchEvent(new CustomEvent(EXPENSES_CHANGED_EVENT, { detail: expenses }));
    return expenses;
  }
};

export const getInitialExpenses = (fallback = []) => readStoredExpenses() || fallback;

export const addStoredExpense = async (expense, fallback = []) => {
  const current = getInitialExpenses(fallback);
  const nextExpense = {
    id: Date.now(),
    nota: "",
    recurrente: false,
    ...expense,
    monto: Number(expense.monto),
  };
  const next = [nextExpense, ...current];
  await writeStoredExpenses(next);
  return nextExpense;
};
