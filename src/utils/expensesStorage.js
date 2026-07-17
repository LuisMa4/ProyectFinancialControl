export const EXPENSES_STORAGE_KEY = "savia-expenses";
export const EXPENSES_CHANGED_EVENT = "savia-expenses-changed";

// Los nombres de categoría se traducen en tiempo de render vía getCategoryName(id, t);
// nameKey apunta a la clave del diccionario i18n (category.*).
export const EXPENSE_CATEGORIES = [
  { id:"alimentacion", nameKey:"category.food",          icon:"🍔", color:"#7EC8C0", presupuesto:800  },
  { id:"transporte",   nameKey:"category.transport",     icon:"🚗", color:"#5AADA5", presupuesto:400  },
  { id:"entrete",      nameKey:"category.entertainment", icon:"🎬", color:"#A8DBD6", presupuesto:300  },
  { id:"salud",        nameKey:"category.health",        icon:"💊", color:"#C9A96E", presupuesto:250  },
  { id:"educacion",    nameKey:"category.education",     icon:"📚", color:"#8AADA9", presupuesto:200  },
  { id:"servicios",    nameKey:"category.utilities",     icon:"⚡", color:"#4A706C", presupuesto:350  },
  { id:"ropa",         nameKey:"category.clothing",      icon:"👗", color:"#D4B8A0", presupuesto:150  },
  { id:"otros",        nameKey:"category.other",         icon:"📦", color:"#DDE9E7", presupuesto:200  },
];

export const getCategoryName = (id, t) => {
  const category = EXPENSE_CATEGORIES.find((cat) => cat.id === id);
  return category ? t(category.nameKey) : t("category.other");
};

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
