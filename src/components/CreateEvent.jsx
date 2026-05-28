import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const S = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --agua:#7EC8C0;--agua-l:#A8DBD6;--agua-p:#D4F0ED;--agua-d:#5AADA5;
  --mint:#EDF8F7;--white:#FAFFFE;--slate:#2D4A47;--slate-m:#4A706C;
  --muted:#8AADA9;--border:#DDE9E7;--gold:#C9A96E;--red:#E07070;--green:#4CAF7D;
  --orange:#E8945A;
}
body{font-family:'DM Sans',sans-serif}

/* ── DEMO TRIGGER ── */
.demo-wrap{display:flex;flex-direction:column;align-items:center;gap:24px}
.demo-title{font-family:'DM Serif Display',serif;font-size:22px;color:var(--slate);opacity:.5}
.demo-days{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.demo-day{
  width:54px;height:54px;border-radius:13px;
  background:var(--white);border:1.5px solid var(--border);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;
  box-shadow:0 2px 8px rgba(45,74,71,.06);
}
.demo-day:hover{border-color:var(--agua);background:var(--agua-p);transform:translateY(-2px);box-shadow:0 6px 18px rgba(90,173,165,.18)}
.demo-day-num{font-size:18px;font-weight:600;color:var(--slate);line-height:1}
.demo-day-lbl{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-top:2px}
.demo-day.today{border-color:var(--agua-d);background:linear-gradient(135deg,var(--agua-d),var(--agua))}
.demo-day.today .demo-day-num{color:white}
.demo-day.today .demo-day-lbl{color:rgba(255,255,255,.7)}
.demo-hint{font-size:13px;color:var(--slate-m);opacity:.6;display:flex;align-items:center;gap:6px}

/* ── OVERLAY ── */
.overlay{
  position:fixed;inset:0;
  background:rgba(45,74,71,.45);backdrop-filter:blur(6px);
  z-index:200;display:flex;align-items:flex-end;justify-content:center;
  animation:fadeIn .22s ease;
  padding:0;
}
@media(min-width:600px){
  .overlay{align-items:center;padding:20px}
}

/* ── MODAL SHEET ── */
.modal{
  background:var(--white);
  border-radius:24px 24px 0 0;
  width:100%;max-width:500px;
  box-shadow:0 -8px 48px rgba(45,74,71,.18);
  animation:slideUp .28s cubic-bezier(.22,1,.36,1);
  display:flex;flex-direction:column;
  max-height:95vh;overflow:hidden;
  position:relative;
}
@media(min-width:600px){
  .modal{border-radius:22px;max-height:90vh;animation:popIn .26s cubic-bezier(.22,1,.36,1)}
}

/* drag handle */
.drag-handle{width:40px;height:4px;border-radius:2px;background:var(--border);margin:12px auto 0;flex-shrink:0}
@media(min-width:600px){.drag-handle{display:none}}

/* ── MODAL HEADER ── */
.modal-header{padding:20px 24px 0;flex-shrink:0}
.modal-top-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px}
.modal-day-info{display:flex;align-items:center;gap:14px}
.day-bubble{
  width:56px;height:56px;border-radius:15px;flex-shrink:0;
  background:linear-gradient(135deg,var(--agua-d),var(--agua));
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  box-shadow:0 4px 14px rgba(90,173,165,.3);
}
.day-bubble-num{font-family:'DM Serif Display',serif;font-size:24px;color:white;line-height:1}
.day-bubble-mes{font-size:9px;color:rgba(255,255,255,.8);letter-spacing:.5px;text-transform:uppercase;margin-top:1px}
.modal-title-wrap{}
.modal-title{font-family:'DM Serif Display',serif;font-size:22px;color:var(--slate);letter-spacing:-.3px}
.modal-sub{font-size:12.5px;color:var(--muted);margin-top:3px}
.close-btn{
  width:34px;height:34px;border-radius:50%;
  background:var(--mint);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;font-size:16px;color:var(--muted);
  transition:all .15s;flex-shrink:0;margin-top:2px;
}
.close-btn:hover{background:var(--border);color:var(--slate)}

/* ── TYPE TABS ── */
.type-tabs{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:8px;margin-bottom:20px;
}
.type-tab{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:12px 8px;border-radius:13px;
  border:1.5px solid var(--border);background:none;
  cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;
}
.type-tab:hover{border-color:var(--agua-l);background:var(--mint)}
.type-tab.active-pago{border-color:var(--red);background:#FEF0F0}
.type-tab.active-ingreso{border-color:var(--green);background:#E8F7F0}
.type-tab.active-actividad{border-color:var(--gold);background:#FFF8EC}
.type-tab-ico{
  width:38px;height:38px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;font-size:19px;
  transition:all .15s;background:var(--mint);
}
.type-tab.active-pago .type-tab-ico{background:#FEF0F0}
.type-tab.active-ingreso .type-tab-ico{background:#E8F7F0}
.type-tab.active-actividad .type-tab-ico{background:#FFF8EC}
.type-tab-label{font-size:11.5px;font-weight:600;color:var(--muted);letter-spacing:.2px}
.type-tab.active-pago .type-tab-label{color:var(--red)}
.type-tab.active-ingreso .type-tab-label{color:var(--green)}
.type-tab.active-actividad .type-tab-label{color:var(--gold)}

/* ── MODAL BODY (scrollable) ── */
.modal-body{padding:0 24px;overflow-y:auto;flex:1}
.modal-body::-webkit-scrollbar{width:3px}
.modal-body::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}

/* ── FORM ELEMENTS ── */
.fg{margin-bottom:16px}
.fg-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.fl{display:block;font-size:12.5px;font-weight:600;color:var(--slate-m);margin-bottom:7px;letter-spacing:.1px}
.fl-hint{font-weight:400;color:var(--muted);font-size:11px;margin-left:4px}

.fi-wrap{position:relative}
.fi-prefix-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none;color:var(--muted)}
.fi{
  width:100%;padding:11px 14px;
  border:1.5px solid var(--border);border-radius:11px;
  font-size:14px;font-family:'DM Sans',sans-serif;
  color:var(--slate);background:var(--white);
  outline:none;transition:border-color .2s,box-shadow .2s;
  appearance:none;
}
.fi.with-icon{padding-left:38px}
.fi:focus{border-color:var(--agua);box-shadow:0 0 0 3px rgba(126,200,192,.15)}
.fi.error-field{border-color:var(--red);box-shadow:0 0 0 3px rgba(224,112,112,.1)}
.fi::placeholder{color:#BCCFCC}
.field-error{font-size:11px;color:var(--red);margin-top:5px;display:flex;align-items:center;gap:4px}

/* Amount field special */
.amount-wrap{position:relative}
.currency-badge{
  position:absolute;left:13px;top:50%;transform:translateY(-50%);
  font-size:13px;font-weight:600;color:var(--slate-m);pointer-events:none;
}
.fi-amount{padding-left:34px;font-size:16px;font-weight:500;letter-spacing:-.2px}
.fi-amount:focus{border-color:var(--agua)}
.fi-amount.pago:focus{border-color:var(--red);box-shadow:0 0 0 3px rgba(224,112,112,.1)}
.fi-amount.ingreso:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(76,175,122,.1)}

/* Category pills */
.cat-section{margin-bottom:16px}
.cat-grid{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}
.cat-pill{
  display:flex;align-items:center;gap:6px;
  padding:7px 12px;border-radius:100px;
  border:1.5px solid var(--border);background:none;
  cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;
  font-size:12px;font-weight:500;color:var(--muted);
}
.cat-pill:hover{border-color:var(--agua-l);background:var(--mint);color:var(--slate)}
.cat-pill.sel{color:white;border-color:transparent}
.cat-pill-ico{font-size:14px}

/* Icon selector */
.icon-row{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
.icon-opt{
  width:38px;height:38px;border-radius:10px;
  border:1.5px solid var(--border);background:none;
  cursor:pointer;font-size:18px;transition:all .15s;
  display:flex;align-items:center;justify-content:center;
}
.icon-opt:hover{border-color:var(--agua-l);background:var(--mint)}
.icon-opt.sel{border-color:var(--agua-d);background:var(--agua-p);transform:scale(1.08)}

/* Recurrence & toggles */
.toggles-row{display:flex;flex-direction:column;gap:0;border:1.5px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px}
.toggle-item{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 14px;border-bottom:1px solid var(--border);
  transition:background .15s;
}
.toggle-item:last-child{border-bottom:none}
.toggle-item:hover{background:var(--mint)}
.toggle-left{display:flex;align-items:center;gap:10px}
.toggle-ico{font-size:17px}
.toggle-label{font-size:13px;font-weight:500;color:var(--slate)}
.toggle-hint{font-size:11px;color:var(--muted);margin-top:1px}

/* switch */
.switch{position:relative;width:40px;height:22px;flex-shrink:0}
.switch input{opacity:0;width:0;height:0;position:absolute}
.sw-track{position:absolute;inset:0;border-radius:100px;background:var(--border);cursor:pointer;transition:background .2s}
.switch input:checked+.sw-track{background:var(--agua-d)}
.sw-knob{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:white;box-shadow:0 1px 4px rgba(0,0,0,.18);transition:transform .2s;pointer-events:none}
.switch input:checked~.sw-knob{transform:translateX(18px)}

/* Recurrence select (conditionally shown) */
.rec-options{
  display:grid;grid-template-columns:repeat(4,1fr);gap:6px;
  margin-top:10px;animation:fadeUp .2s ease;
}
.rec-opt{
  padding:7px 4px;border-radius:9px;border:1.5px solid var(--border);
  background:none;cursor:pointer;font-family:'DM Sans',sans-serif;
  font-size:11px;font-weight:500;color:var(--muted);text-align:center;
  transition:all .15s;
}
.rec-opt:hover{border-color:var(--agua-l);background:var(--mint)}
.rec-opt.sel{border-color:var(--agua-d);background:var(--agua-p);color:var(--agua-d)}

/* Note textarea */
textarea.fi{resize:none;min-height:72px;line-height:1.5}

/* ── PREVIEW CARD ── */
.preview-card{
  border-radius:13px;padding:13px 16px;margin-bottom:16px;
  display:flex;align-items:center;gap:12px;
  border:1.5px solid var(--border);background:var(--mint);
  transition:all .3s;
}
.prev-ico{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;transition:background .3s}
.prev-info{flex:1;min-width:0}
.prev-desc{font-size:14px;font-weight:500;color:var(--slate);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prev-meta{font-size:11.5px;color:var(--muted);margin-top:2px;display:flex;align-items:center;gap:6px}
.prev-monto{font-size:18px;font-weight:700;font-family:'DM Serif Display',serif;white-space:nowrap}

/* ── FOOTER ── */
.modal-footer{
  padding:16px 24px 20px;border-top:1px solid var(--border);
  display:flex;gap:10px;flex-shrink:0;
  background:var(--white);
}
@media(max-width:400px){.modal-footer{flex-direction:column}}
.btn-cancel{
  flex:1;padding:13px;background:none;
  border:1.5px solid var(--border);border-radius:11px;
  font-family:'DM Sans',sans-serif;font-size:14px;
  color:var(--muted);cursor:pointer;transition:all .18s;
  font-weight:500;
}
.btn-cancel:hover{background:var(--mint);border-color:var(--agua-l);color:var(--slate-m)}
.btn-save{
  flex:2;padding:13px;border:none;border-radius:11px;
  font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;
  cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:7px;
  letter-spacing:.1px;
}
.btn-save.pago{background:linear-gradient(135deg,#D95A5A,var(--red));color:white;box-shadow:0 3px 14px rgba(224,112,112,.3)}
.btn-save.ingreso{background:linear-gradient(135deg,#3A9D6A,var(--green));color:white;box-shadow:0 3px 14px rgba(76,175,122,.3)}
.btn-save.actividad{background:linear-gradient(135deg,#BF8840,var(--gold));color:white;box-shadow:0 3px 14px rgba(201,169,110,.3)}
.btn-save:hover{transform:translateY(-1px)}
.btn-save:hover.pago{box-shadow:0 5px 20px rgba(224,112,112,.4)}
.btn-save:hover.ingreso{box-shadow:0 5px 20px rgba(76,175,122,.4)}
.btn-save:hover.actividad{box-shadow:0 5px 20px rgba(201,169,110,.4)}
.btn-save:active{transform:translateY(0)}

/* ── SUCCESS SCREEN ── */
.success-screen{
  display:flex;flex-direction:column;align-items:center;
  text-align:center;padding:48px 32px;
  animation:fadeUp .4s ease;
}
.success-ring{
  width:80px;height:80px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:36px;margin-bottom:20px;
  animation:popIn .4s cubic-bezier(.22,1,.36,1);
}
.success-title{font-family:'DM Serif Display',serif;font-size:24px;color:var(--slate);letter-spacing:-.3px;margin-bottom:8px}
.success-sub{font-size:14px;color:var(--muted);line-height:1.6;max-width:280px;margin-bottom:28px}
.success-detail{
  display:flex;align-items:center;gap:12px;
  background:var(--mint);border:1px solid var(--border);border-radius:14px;
  padding:14px 20px;width:100%;margin-bottom:24px;
}
.success-det-ico{font-size:26px;flex-shrink:0}
.success-det-desc{font-size:14px;font-weight:500;color:var(--slate);text-align:left}
.success-det-meta{font-size:11.5px;color:var(--muted);margin-top:2px;text-align:left}
.success-det-monto{font-size:17px;font-weight:700;font-family:'DM Serif Display',serif;margin-left:auto;white-space:nowrap}
.btn-done{padding:13px 36px;border:none;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .18s;background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;box-shadow:0 3px 14px rgba(90,173,165,.3)}
.btn-done:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(90,173,165,.4)}
.btn-add-another{background:none;border:none;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--muted);cursor:pointer;padding:6px;margin-top:6px;transition:color .15s}
.btn-add-another:hover{color:var(--agua-d)}

@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
`;

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const DIAS_SEMANA = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MESES_CORTO = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const CATS_PAGO = [
  { id:"vivienda",  label:"Vivienda",   ico:"🏠", color:"#5AADA5" },
  { id:"servicios", label:"Servicios",  ico:"⚡",  color:"#8AADA9" },
  { id:"alimenta",  label:"Comida",     ico:"🍔",  color:"#7EC8C0" },
  { id:"transporte",label:"Transporte", ico:"🚗",  color:"#A8DBD6" },
  { id:"salud",     label:"Salud",      ico:"💊",  color:"#C9A96E" },
  { id:"entrete",   label:"Ocio",       ico:"🎬",  color:"#D4A0C8" },
  { id:"suscripc",  label:"Suscripción",ico:"📱",  color:"#7B9DD4" },
  { id:"otro",      label:"Otro",       ico:"📦",  color:"#8AADA9" },
];

const CATS_INGRESO = [
  { id:"sueldo",    label:"Sueldo",     ico:"💼",  color:"#4CAF7D" },
  { id:"freelance", label:"Freelance",  ico:"🎨",  color:"#5AADA5" },
  { id:"transf",    label:"Transferencia",ico:"💸",color:"#7EC8C0" },
  { id:"inversion", label:"Inversión",  ico:"📈",  color:"#C9A96E" },
  { id:"regalo",    label:"Regalo",     ico:"🎁",  color:"#D4A0C8" },
  { id:"otro",      label:"Otro",       ico:"✨",  color:"#8AADA9" },
];

const CATS_ACTIVIDAD = [
  { id:"recordatorio",label:"Recordatorio",ico:"🔔",color:"#C9A96E" },
  { id:"reunion",     label:"Reunión",     ico:"👥",color:"#7B9DD4" },
  { id:"revision",    label:"Revisión",    ico:"📊",color:"#5AADA5" },
  { id:"meta",        label:"Meta",        ico:"🎯",color:"#7EC8C0" },
  { id:"compra",      label:"Compra",      ico:"🛒",color:"#8AADA9" },
  { id:"otro",        label:"Otro",        ico:"📌",color:"#D4A0C8" },
];

const ICONOS_PAGO      = ["💳","🏠","⚡","💧","📡","🚗","🎬","🎵","💊","🏋️","🛒","✈️","📱","🔒","🎓","🛡️"];
const ICONOS_INGRESO   = ["💼","💸","🎨","📈","🎁","💰","🏦","🤝","📦","🎯"];
const ICONOS_ACTIVIDAD = ["🔔","📊","👥","📋","🎯","📅","💡","✅","⏰","🗒️"];

const REC_OPTS = ["Diario","Semanal","Mensual","Anual"];

const TIPO_CFG = {
  pago:      { label:"Pago",      btnLabel:"Registrar pago",     ico:"💳", accentColor:"var(--red)",   cats:CATS_PAGO,      icons:ICONOS_PAGO      },
  ingreso:   { label:"Ingreso",   btnLabel:"Registrar ingreso",  ico:"💰", accentColor:"var(--green)", cats:CATS_INGRESO,   icons:ICONOS_INGRESO   },
  actividad: { label:"Actividad", btnLabel:"Añadir actividad",   ico:"📋", accentColor:"var(--gold)",  cats:CATS_ACTIVIDAD, icons:ICONOS_ACTIVIDAD },
};

const FORM_DEF = { desc:"", monto:"", categoria:"", icono:"", nota:"", recurrente:false, recFreq:"Mensual", alarma:false, alarmaAntes:"1 día" };

const fmtMonto = (n, tipo) => {
  if (!n) return "S/ 0.00";
  const abs = parseFloat(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return tipo === "pago" ? `- S/ ${abs}` : tipo === "ingreso" ? `+ S/ ${abs}` : `S/ ${abs}`;
};

/* ─────────────────────────────────────────
   MODAL COMPONENT
───────────────────────────────────────── */
function CalEventoModal({ dia, mes, anio, onClose, onSave }) {
  const [tipo, setTipo]     = useState("pago");
  const [form, setForm]     = useState({ ...FORM_DEF });
  const [errors, setErrors] = useState({});
  const [step, setStep]     = useState("form"); // form | success
  const inputRef            = useRef(null);

  const cfg = TIPO_CFG[tipo];
  const cats = cfg.cats;
  const icons = cfg.icons;
  const catSelObj = cats.find(c => c.id === form.categoria);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  // reset icono/cat when type changes
  useEffect(() => {
    setForm(p => ({ ...p, categoria: "", icono: "" }));
    setErrors({});
  }, [tipo]);

  const setField = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    if (errors[f]) setErrors(p => ({ ...p, [f]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.desc.trim())        e.desc  = "Ingresa una descripción";
    if (tipo !== "actividad" && (!form.monto || isNaN(+form.monto) || +form.monto <= 0))
                                   e.monto = "Ingresa un monto válido";
    if (!form.categoria)           e.categoria = "Selecciona una categoría";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep("success");
    onSave?.({ ...form, tipo, dia, mes, anio });
  };

  const handleReset = () => {
    setForm({ ...FORM_DEF });
    setErrors({});
    setStep("form");
    setTipo("pago");
  };

  const diaSemana = DIAS_SEMANA[new Date(anio, mes, dia).getDay() === 0 ? 6 : new Date(anio, mes, dia).getDay() - 1];

  /* ── SUCCESS ── */
  if (step === "success") {
    const montoFmt = tipo !== "actividad" ? fmtMonto(form.monto, tipo) : null;
    const ringColor = tipo === "pago" ? "var(--red)" : tipo === "ingreso" ? "var(--green)" : "var(--gold)";
    return (
      <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="drag-handle" />
          <div className="success-screen">
            <div className="success-ring" style={{ background: ringColor + "20" }}>
              {tipo === "pago" ? "✅" : tipo === "ingreso" ? "🎉" : "📌"}
            </div>
            <div className="success-title">
              {tipo === "pago" ? "Pago registrado" : tipo === "ingreso" ? "¡Ingreso añadido!" : "Actividad guardada"}
            </div>
            <div className="success-sub">
              Se añadió correctamente al día <strong>{dia} de {MESES_CORTO[mes]}</strong> en tu calendario.
            </div>
            <div className="success-detail">
              <div className="success-det-ico">{form.icono || cfg.ico}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="success-det-desc">{form.desc}</div>
                <div className="success-det-meta">
                  {catSelObj?.label || cfg.label} · {dia} {MESES_CORTO[mes]} {anio}
                  {form.recurrente && " · 🔁 " + form.recFreq}
                </div>
              </div>
              {montoFmt && (
                <div className="success-det-monto" style={{ color: tipo === "pago" ? "var(--red)" : "var(--green)" }}>
                  {montoFmt}
                </div>
              )}
            </div>
            <button className="btn-done" onClick={onClose}>Ver en el calendario →</button>
            <button className="btn-add-another" onClick={handleReset}>+ Añadir otro evento</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── FORM ── */
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="drag-handle" />

        {/* ── HEADER ── */}
        <div className="modal-header">
          <div className="modal-top-row">
            <div className="modal-day-info">
              <div className="day-bubble">
                <div className="day-bubble-num">{dia}</div>
                <div className="day-bubble-mes">{MESES_CORTO[mes]}</div>
              </div>
              <div className="modal-title-wrap">
                <div className="modal-title">Nuevo evento</div>
                <div className="modal-sub">{diaSemana}, {dia} de {MESES_CORTO[mes]} {anio}</div>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {/* TYPE TABS */}
          <div className="type-tabs">
            {[
              { k:"pago",      ico:"💳", label:"Pago" },
              { k:"ingreso",   ico:"💰", label:"Ingreso" },
              { k:"actividad", ico:"📋", label:"Actividad" },
            ].map(t => (
              <button key={t.k}
                className={`type-tab${tipo === t.k ? ` active-${t.k}` : ""}`}
                onClick={() => setTipo(t.k)}>
                <div className="type-tab-ico">{t.ico}</div>
                <span className="type-tab-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="modal-body">

          {/* PREVIEW */}
          <div className="preview-card" style={{
            borderColor: form.categoria ? (catSelObj?.color + "55") : "var(--border)",
            background: form.categoria ? (catSelObj?.color + "0D") : "var(--mint)",
          }}>
            <div className="prev-ico" style={{ background: (catSelObj?.color || "var(--agua)") + "22" }}>
              {form.icono || (catSelObj?.ico || cfg.ico)}
            </div>
            <div className="prev-info">
              <div className="prev-desc">{form.desc || "Descripción del evento"}</div>
              <div className="prev-meta">
                <span>{catSelObj?.label || cfg.label}</span>
                {form.recurrente && <><span>·</span><span>🔁 {form.recFreq}</span></>}
                {form.alarma && <><span>·</span><span>⏰</span></>}
              </div>
            </div>
            {tipo !== "actividad" && (
              <div className="prev-monto" style={{ color: tipo === "pago" ? "var(--red)" : "var(--green)" }}>
                {fmtMonto(form.monto, tipo)}
              </div>
            )}
          </div>

          {/* DESCRIPCIÓN */}
          <div className="fg">
            <label className="fl">Descripción</label>
            <input
              ref={inputRef}
              className={`fi${errors.desc ? " error-field" : ""}`}
              placeholder={tipo === "pago" ? "Ej: Netflix, Alquiler, Agua…" : tipo === "ingreso" ? "Ej: Sueldo, Freelance, Venta…" : "Ej: Revisar presupuesto, Reunión…"}
              value={form.desc}
              onChange={setField("desc")}
            />
            {errors.desc && <div className="field-error">⚠ {errors.desc}</div>}
          </div>

          {/* MONTO (solo pago/ingreso) */}
          {tipo !== "actividad" && (
            <div className="fg">
              <label className="fl">Monto <span className="fl-hint">(S/)</span></label>
              <div className="amount-wrap">
                <span className="currency-badge">S/</span>
                <input
                  className={`fi fi-amount ${tipo}${errors.monto ? " error-field" : ""}`}
                  type="number" min="0" step="0.01"
                  placeholder="0.00"
                  value={form.monto}
                  onChange={setField("monto")}
                />
              </div>
              {errors.monto && <div className="field-error">⚠ {errors.monto}</div>}
            </div>
          )}

          {/* CATEGORÍA */}
          <div className="cat-section">
            <label className="fl">
              Categoría
              {errors.categoria && <span className="field-error" style={{ display:"inline", marginLeft:8 }}>⚠ {errors.categoria}</span>}
            </label>
            <div className="cat-grid">
              {cats.map(c => (
                <button key={c.id}
                  className={`cat-pill${form.categoria === c.id ? " sel" : ""}`}
                  style={form.categoria === c.id ? { background: c.color, borderColor: c.color } : {}}
                  onClick={() => { setForm(p => ({ ...p, categoria: c.id, icono: p.icono || c.ico })); setErrors(p => ({ ...p, categoria: null })); }}>
                  <span className="cat-pill-ico">{c.ico}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* ÍCONO */}
          <div className="fg">
            <label className="fl">Ícono <span className="fl-hint">(opcional)</span></label>
            <div className="icon-row">
              {icons.map(ic => (
                <button key={ic}
                  className={`icon-opt${form.icono === ic ? " sel" : ""}`}
                  onClick={() => setForm(p => ({ ...p, icono: ic }))}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* TOGGLES */}
          <div className="toggles-row">
            {/* Recurrente */}
            <div className="toggle-item">
              <div className="toggle-left">
                <span className="toggle-ico">🔁</span>
                <div>
                  <div className="toggle-label">Se repite</div>
                  <div className="toggle-hint">Añadir a meses futuros automáticamente</div>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={form.recurrente}
                  onChange={e => setForm(p => ({ ...p, recurrente: e.target.checked }))} />
                <div className="sw-track" />
                <div className="sw-knob" />
              </label>
            </div>
            {form.recurrente && (
              <div style={{ padding:"10px 14px 14px", borderBottom:"1px solid var(--border)" }}>
                <div className="rec-options">
                  {REC_OPTS.map(r => (
                    <button key={r}
                      className={`rec-opt${form.recFreq === r ? " sel" : ""}`}
                      onClick={() => setForm(p => ({ ...p, recFreq: r }))}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alarma */}
            <div className="toggle-item">
              <div className="toggle-left">
                <span className="toggle-ico">⏰</span>
                <div>
                  <div className="toggle-label">Recordatorio</div>
                  <div className="toggle-hint">Recibir alerta antes del vencimiento</div>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={form.alarma}
                  onChange={e => setForm(p => ({ ...p, alarma: e.target.checked }))} />
                <div className="sw-track" />
                <div className="sw-knob" />
              </label>
            </div>
            {form.alarma && (
              <div style={{ padding:"10px 14px 14px" }}>
                <label className="fl" style={{ marginBottom:6 }}>Avisar con</label>
                <select className="fi" value={form.alarmaAntes}
                  onChange={e => setForm(p => ({ ...p, alarmaAntes: e.target.value }))}>
                  {["1 día","2 días","3 días","1 semana","2 semanas"].map(o => (
                    <option key={o} value={o}>{o} de anticipación</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* NOTA */}
          <div className="fg">
            <label className="fl">Nota <span className="fl-hint">(opcional)</span></label>
            <textarea
              className="fi"
              placeholder="Agrega un detalle o comentario…"
              value={form.nota}
              onChange={setField("nota")}
              rows={2}
            />
          </div>

        </div>

        {/* ── FOOTER ── */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className={`btn-save ${tipo}`} onClick={handleSave}>
            {tipo === "pago" ? "💳" : tipo === "ingreso" ? "💰" : "📌"}
            {cfg.btnLabel} →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DEMO WRAPPER
───────────────────────────────────────── */
export default function CreateEvent(props) {
  return (
    <>
      <style>{S}</style>
      <CalEventoModal {...props} />
    </>
  );

  const [modalDia, setModalDia] = useState(null);

  const hoy = new Date();
  const mes  = hoy.getMonth();
  const anio = hoy.getFullYear();

  const diasDemo = [
    { dia: hoy.getDate() - 2, label: DIAS_SEMANA[(new Date(anio, mes, hoy.getDate()-2).getDay()||7)-1] },
    { dia: hoy.getDate() - 1, label: DIAS_SEMANA[(new Date(anio, mes, hoy.getDate()-1).getDay()||7)-1] },
    { dia: hoy.getDate(),     label: "Hoy",   today: true },
    { dia: hoy.getDate() + 1, label: DIAS_SEMANA[(new Date(anio, mes, hoy.getDate()+1).getDay()||7)-1] },
    { dia: hoy.getDate() + 2, label: DIAS_SEMANA[(new Date(anio, mes, hoy.getDate()+2).getDay()||7)-1] },
  ];

  return (
    <>
      <style>{S}</style>
      <div className="demo-wrap">
        <div className="demo-title">Haz click en un día</div>
        <div className="demo-days">
          {diasDemo.map(d => (
            <div key={d.dia} className={`demo-day${d.today ? " today" : ""}`}
              onClick={() => setModalDia(d.dia)}>
              <div className="demo-day-num">{d.dia}</div>
              <div className="demo-day-lbl">{d.label}</div>
            </div>
          ))}
        </div>
        <div className="demo-hint">
          <span>📅</span>
          {MESES_CORTO[mes]} {anio}
        </div>
      </div>

      {modalDia && (
        <CalEventoModal
          dia={modalDia}
          mes={mes}
          anio={anio}
          onClose={() => setModalDia(null)}
          onSave={(data) => {
            console.log("Evento guardado:", data);
          }}
        />
      )}
    </>
  );
}
