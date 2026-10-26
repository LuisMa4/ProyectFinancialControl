export const INCOMES_STORAGE_KEY = "savia-incomes";
export const INCOMES_CHANGED_EVENT = "savia-incomes-changed";

// Mismo formato que EXPENSE_CATEGORIES; los ids existen en expense_categories (BD)
export const INCOME_CATEGORIES = [
  { id:"sueldo",         nameKey:"incomeCategory.salary",      icon:"💼", color:"#4CAF7D" },
  { id:"freelance",      nameKey:"incomeCategory.freelance",   icon:"🎨", color:"#3A9D6A" },
  { id:"ventas",         nameKey:"incomeCategory.sales",       icon:"🛍️", color:"#6BBF8E" },
  { id:"inversiones",    nameKey:"incomeCategory.investments", icon:"📈", color:"#2E8B57" },
  { id:"regalos",        nameKey:"incomeCategory.gifts",       icon:"🎁", color:"#8FD1A8" },
  { id:"otros_ingresos", nameKey:"incomeCategory.other",       icon:"💰", color:"#A8DBB9" },
];

import { apiRequest } from "./apiClient";

export const readStoredIncomes = () => {
  try {
    const raw = localStorage.getItem(INCOMES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const loadStoredIncomes = async (fallback = []) => {
  try {
    const incomes = await apiRequest("/incomes");
    localStorage.setItem(INCOMES_STORAGE_KEY, JSON.stringify(incomes));
    window.dispatchEvent(new CustomEvent(INCOMES_CHANGED_EVENT, { detail: incomes }));
    return incomes;
  } catch {
    return readStoredIncomes() || fallback;
  }
};

export const writeStoredIncomes = async (incomes) => {
  try {
    const saved = await apiRequest("/incomes", {
      method: "PUT",
      body: JSON.stringify({ incomes }),
    });
    localStorage.setItem(INCOMES_STORAGE_KEY, JSON.stringify(saved));
    window.dispatchEvent(new CustomEvent(INCOMES_CHANGED_EVENT, { detail: saved }));
    return saved;
  } catch {
    localStorage.setItem(INCOMES_STORAGE_KEY, JSON.stringify(incomes));
    window.dispatchEvent(new CustomEvent(INCOMES_CHANGED_EVENT, { detail: incomes }));
    return incomes;
  }
};

export const getInitialIncomes = (fallback = []) => readStoredIncomes() || fallback;
