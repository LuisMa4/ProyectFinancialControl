import { useState } from "react";
import SidebarCards from "../components/SidebarCards";

/* ─────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────── */
const USUARIO_INIT = {
  nombre: "Juan",
  apellido: "Pérez",
  email: "juan.perez@gmail.com",
  telefono: "+51 999 888 777",
  moneda: "PEN",
  idioma: "es",
  plan: "premium",
  fechaRegistro: "12 enero 2025",
  avatar: "JP",
  avatarColor: "#5AADA5",
  presupuestoMensual: 2500,
  timezone: "America/Lima",
};

const USUARIO_EMPTY = {
  nombre: "Cuenta",
  apellido: "nueva",
  email: "",
  telefono: "",
  moneda: "PEN",
  idioma: "es",
  plan: "free",
  fechaRegistro: "",
  avatar: "CN",
  avatarColor: "#5AADA5",
  presupuestoMensual: 0,
  timezone: "America/Lima",
};

const ACTIVIDAD = [
  { id:1, tipo:"gasto",    desc:"Wong - Compras",       monto:-185.50, fecha:"Hoy, 10:32",   icon:"🛒" },
  { id:2, tipo:"ingreso",  desc:"Sueldo Mayo",          monto:+3600,   fecha:"Hoy, 09:00",   icon:"💼" },
  { id:3, tipo:"meta",     desc:'Abono "Viaje a Europa"',monto:-400,   fecha:"Ayer, 18:00",  icon:"✈️" },
  { id:4, tipo:"gasto",    desc:"Netflix",              monto:-37.90,  fecha:"Ayer, 00:00",  icon:"🎬" },
  { id:5, tipo:"meta",     desc:'Meta "Inglés" completada',monto:0,    fecha:"22 May",       icon:"🏆" },
  { id:6, tipo:"gasto",    desc:"Farmacia",             monto:-62.00,  fecha:"21 May",       icon:"💊" },
];

const ESTADISTICAS = [
  { label:"Gastos registrados", val:"20", icon:"💳", color:"#7EC8C0" },
  { label:"Metas activas",      val:"4",  icon:"🎯", color:"#5AADA5" },
  { label:"Meses de uso",       val:"5",  icon:"📅", color:"#C9A96E" },
  { label:"Ahorro acumulado",   val:"S/ 8,170", icon:"💰", color:"#4CAF7D" },
];

const NAV_ITEMS = [
  { id:"dashboard",  label:"Dashboard",  icon:"◉" },
  { id:"gastos",     label:"Gastos",     icon:"💳" },
  { id:"metas",      label:"Metas",      icon:"🎯" },
  { id:"calendario", label:"Calendario", icon:"📅" },
  { id:"chatbot",    label:"Chatbot IA", icon:"🤖" },
  { id:"perfil",     label:"Mi Perfil",  icon:"👤" },
];

const AVATAR_COLORS = [
  "#5AADA5","#7EC8C0","#C9A96E","#8AADA9","#4CAF7D",
  "#7B9DD4","#D4A0C8","#E07070","#4A706C","#A8DBD6",
];

const AVATAR_EMOJIS = ["👤","😊","🦁","🐬","🦅","🌟","🎯","🌊","🍀","⚡"];

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
  --sidebar-w:240px;--header-h:68px;
}
body{font-family:'DM Sans',sans-serif;background:var(--mint);color:var(--slate)}
#root:has(.profile-app){width:100%;max-width:none;min-height:100svh;margin:0;border:0;text-align:left}
.app{display:flex;min-height:100vh}
.profile-app{display:flex;width:100%;min-height:100svh;background:var(--mint)}
.profile-app .main{margin-left:var(--sidebar-w);flex:1;display:flex;flex-direction:column;width:calc(100% - var(--sidebar-w));min-width:0}
.profile-app .content{padding:clamp(18px,2.5vw,32px);display:flex;flex-direction:column;gap:22px;width:100%}
.profile-app .card{padding:0;min-width:0}

/* ── SIDEBAR ── */
.sidebar{width:var(--sidebar-w);background:var(--slate);display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:50}
.sb-brand{display:flex;align-items:center;gap:10px;padding:23px 22px 19px;border-bottom:1px solid rgba(255,255,255,.08)}
.sb-ico{width:35px;height:35px;border-radius:10px;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:17.5px}
.sb-txt{font-family:'DM Serif Display',serif;font-size:21.5px;color:white;letter-spacing:-.3px}
.sb-nav{flex:1;padding:15px 11px;display:flex;flex-direction:column;gap:4px;overflow-y:auto}
.nav-item{display:flex;align-items:center;gap:11.5px;padding:10.5px 13.5px;border-radius:10px;font-size:13.75px;color:rgba(255,255,255,.55);cursor:pointer;transition:all .18s;border:none;background:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif}
.nav-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.85)}
.nav-item.active{background:linear-gradient(135deg,rgba(90,173,165,.35),rgba(126,200,192,.2));color:white;font-weight:500;box-shadow:inset 0 0 0 1px rgba(126,200,192,.25)}
.sb-footer{padding:15px 11px;border-top:1px solid rgba(255,255,255,.08)}
.user-chip{display:flex;align-items:center;gap:9.5px;padding:9.5px 11.5px;border-radius:10px;background:rgba(255,255,255,.06)}
.user-av{width:33px;height:33px;border-radius:50%;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:13.5px;color:white;font-weight:600;flex-shrink:0}
.user-nm{font-size:12.75px;font-weight:500;color:white}
.user-pl{font-size:10.75px;color:var(--agua-l)}

/* ── MAIN ── */
.main{margin-left:var(--sidebar-w);flex:1;display:flex;flex-direction:column}
.header{height:var(--header-h);background:var(--white);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 32px;position:sticky;top:0;z-index:40}
.hd-eye{font-size:13px;color:var(--muted);font-weight:300}
.hd-title{font-family:'DM Serif Display',serif;font-size:22px;color:var(--slate);letter-spacing:-.3px}
.hd-right{display:flex;align-items:center;gap:10px}
.btn-primary{display:flex;align-items:center;gap:7px;padding:10px 18px;background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;box-shadow:0 3px 14px rgba(90,173,165,.3);transition:all .18s}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(90,173,165,.4)}
.btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none}

/* ── CONTENT ── */
.content{padding:28px 32px;display:flex;flex-direction:column;gap:22px}

/* ── HERO BANNER ── */
.hero-banner{
  background:linear-gradient(135deg,var(--slate) 0%,var(--slate-m) 100%);
  border-radius:20px;padding:32px 36px;
  display:flex;align-items:center;gap:28px;
  position:relative;overflow:hidden;
  animation:fadeUp .4s ease;
}
.hero-banner::before{content:'';position:absolute;top:-80px;right:-60px;width:280px;height:280px;border-radius:50%;background:rgba(126,200,192,.08)}
.hero-banner::after{content:'';position:absolute;bottom:-60px;left:200px;width:180px;height:180px;border-radius:50%;background:rgba(126,200,192,.06)}

.hero-avatar-wrap{position:relative;flex-shrink:0;z-index:1}
.hero-avatar{
  width:88px;height:88px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:32px;font-weight:700;color:white;
  border:3px solid rgba(255,255,255,.25);
  box-shadow:0 4px 20px rgba(0,0,0,.2);
  cursor:pointer;transition:transform .2s;
  position:relative;
}
.hero-avatar:hover{transform:scale(1.05)}
.avatar-edit-badge{
  position:absolute;bottom:0;right:0;
  width:26px;height:26px;border-radius:50%;
  background:var(--agua);border:2px solid var(--slate);
  display:flex;align-items:center;justify-content:center;
  font-size:11px;cursor:pointer;
}

.hero-info{flex:1;z-index:1}
.hero-name{font-family:'DM Serif Display',serif;font-size:30px;color:white;letter-spacing:-.4px;margin-bottom:4px}
.hero-email{font-size:14px;color:rgba(255,255,255,.6);margin-bottom:12px}
.hero-tags{display:flex;gap:8px;flex-wrap:wrap}
.hero-tag{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:500}
.tag-plan{background:rgba(201,169,110,.2);color:var(--gold)}
.tag-date{background:rgba(255,255,255,.1);color:rgba(255,255,255,.7)}
.tag-collab{background:rgba(126,200,192,.2);color:var(--agua-l)}

.hero-stats{display:flex;flex-direction:column;gap:10px;z-index:1;flex-shrink:0}
.hero-stat{text-align:right}
.hero-stat-val{font-family:'DM Serif Display',serif;font-size:22px;color:white;letter-spacing:-.3px}
.hero-stat-lbl{font-size:11px;color:rgba(255,255,255,.5)}

/* ── GRID ── */
.grid-main{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,340px);gap:20px;align-items:start}

/* ── CARD ── */
.card{background:var(--white);border:1px solid var(--border);border-radius:16px;overflow:hidden;animation:fadeUp .4s ease both}
.card-hd{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 0}
.card-title{font-family:'DM Serif Display',serif;font-size:17px;color:var(--slate);letter-spacing:-.2px}
.card-sub{font-size:12px;color:var(--muted);margin-top:2px}
.card-body{padding:20px 24px}

/* ── SECTION TABS ── */
.section-tabs{display:flex;border-bottom:1px solid var(--border);padding:0 24px}
.stab{padding:12px 16px;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-size:13px;font-weight:500;color:var(--muted);font-family:'DM Sans',sans-serif;transition:all .15s;margin-bottom:-1px}
.stab.on{color:var(--agua-d);border-bottom-color:var(--agua-d)}
.stab:hover:not(.on){color:var(--slate)}

/* ── FORM ── */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.fg{display:flex;flex-direction:column;gap:6px}
.fg.full{grid-column:1/-1}
.fl{font-size:13px;font-weight:500;color:var(--slate-m)}
.fi{padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;color:var(--slate);background:var(--white);outline:none;transition:border-color .2s,box-shadow .2s;appearance:none;width:100%}
.fi:focus{border-color:var(--agua);box-shadow:0 0 0 3px rgba(126,200,192,.15)}
.fi:disabled{background:#F5F5F5;color:var(--muted);cursor:not-allowed}
.fi-prefix{position:relative}
.fi-prefix .fi{padding-left:38px}
.fi-prefix-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--muted);pointer-events:none}
.field-hint{font-size:11px;color:var(--muted)}

/* toggle switch */
.toggle-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)}
.toggle-row:last-child{border-bottom:none;padding-bottom:0}
.toggle-label{font-size:14px;color:var(--slate)}
.toggle-hint{font-size:12px;color:var(--muted);margin-top:2px}
.switch{position:relative;width:42px;height:24px;flex-shrink:0}
.switch input{opacity:0;width:0;height:0}
.switch-track{position:absolute;inset:0;border-radius:100px;background:var(--border);cursor:pointer;transition:background .2s}
.switch input:checked+.switch-track{background:var(--agua-d)}
.switch-knob{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:white;box-shadow:0 1px 4px rgba(0,0,0,.2);transition:transform .2s;pointer-events:none}
.switch input:checked~.switch-knob{transform:translateX(18px)}

/* ── PLAN CARD ── */
.plan-current{display:flex;align-items:center;gap:16px;background:linear-gradient(135deg,var(--agua-d),var(--agua));border-radius:14px;padding:20px;margin-bottom:16px}
.plan-ico{font-size:28px}
.plan-info{flex:1}
.plan-name{font-family:'DM Serif Display',serif;font-size:18px;color:white;letter-spacing:-.2px}
.plan-sub{font-size:12px;color:rgba(255,255,255,.7);margin-top:2px}
.plan-price{font-size:22px;font-weight:600;color:white;font-family:'DM Serif Display',serif}
.plan-period{font-size:11px;color:rgba(255,255,255,.6)}

.feature-list{display:flex;flex-direction:column;gap:8px}
.feature-item{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--slate-m)}
.feature-check{width:18px;height:18px;border-radius:50%;background:var(--agua-p);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--agua-d);flex-shrink:0}
.feature-check.off{background:#F5F5F5;color:var(--muted)}

.btn-upgrade{width:100%;margin-top:16px;padding:12px;background:linear-gradient(135deg,var(--gold),#E4C07A);color:white;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;box-shadow:0 3px 12px rgba(201,169,110,.35);transition:all .18s}
.btn-upgrade:hover{transform:translateY(-1px);box-shadow:0 5px 18px rgba(201,169,110,.45)}

/* ── STATS ── */
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.stat-chip{border-radius:12px;padding:14px 16px;display:flex;flex-direction:column;gap:4px}
.stat-chip-val{font-family:'DM Serif Display',serif;font-size:20px;letter-spacing:-.3px}
.stat-chip-lbl{font-size:11px}

/* ── ACTIVIDAD ── */
.act-list{display:flex;flex-direction:column}
.act-item{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border)}
.act-item:last-child{border-bottom:none}
.act-ico{width:36px;height:36px;border-radius:10px;background:var(--mint);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
.act-info{flex:1;min-width:0}
.act-desc{font-size:13px;color:var(--slate);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.act-date{font-size:11px;color:var(--muted);margin-top:1px}
.act-monto{font-size:13px;font-weight:500;white-space:nowrap}
.act-monto.pos{color:var(--green)}
.act-monto.neg{color:var(--red)}
.act-monto.neu{color:var(--muted)}

/* ── SEGURIDAD ── */
.security-item{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--border)}
.security-item:last-child{border-bottom:none}
.sec-ico{width:38px;height:38px;border-radius:11px;background:var(--mint);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.sec-info{flex:1}
.sec-label{font-size:13px;font-weight:500;color:var(--slate)}
.sec-sub{font-size:12px;color:var(--muted);margin-top:2px}
.sec-badge{font-size:11px;font-weight:500;padding:3px 9px;border-radius:100px}
.b-green{background:#E8F7F0;color:var(--green)}
.b-warn{background:#FFF8EC;color:var(--gold)}
.btn-sec{padding:7px 14px;border:1px solid var(--border);border-radius:8px;background:none;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;color:var(--slate-m);cursor:pointer;transition:all .15s;white-space:nowrap}
.btn-sec:hover{background:var(--mint);border-color:var(--agua-l);color:var(--agua-d)}

/* ── ZONA PELIGROSA ── */
.danger-zone{border:1.5px solid #FBDCDC;border-radius:14px;padding:20px}
.danger-zone-title{font-size:14px;font-weight:600;color:var(--red);margin-bottom:12px}
.danger-item{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid #FBDCDC}
.danger-item:last-child{border-bottom:none;padding-bottom:0}
.danger-desc{font-size:13px;color:var(--slate)}
.danger-hint{font-size:11px;color:var(--muted);margin-top:2px}
.btn-danger{padding:7px 14px;border:1px solid var(--red);border-radius:8px;background:none;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;color:var(--red);cursor:pointer;transition:all .15s;white-space:nowrap}
.btn-danger:hover{background:#FEF0F0}

/* ── AVATAR PICKER MODAL ── */
.overlay{position:fixed;inset:0;background:rgba(45,74,71,.45);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease}
.modal{background:var(--white);border-radius:20px;width:100%;max-width:420px;box-shadow:0 24px 64px rgba(45,74,71,.2);animation:slideUp .25s ease}
.modal-hd{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 0}
.modal-title{font-family:'DM Serif Display',serif;font-size:20px;color:var(--slate)}
.modal-close{background:none;border:none;cursor:pointer;font-size:20px;color:var(--muted);line-height:1}
.modal-close:hover{color:var(--slate)}
.modal-body{padding:20px 24px}
.modal-foot{padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px}
.btn-cancel{flex:1;padding:11px;background:none;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--muted);cursor:pointer;transition:all .18s}
.btn-cancel:hover{background:var(--mint)}
.btn-save{flex:2;padding:11px;background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;box-shadow:0 3px 14px rgba(90,173,165,.3);transition:all .18s}
.btn-save:hover{transform:translateY(-1px)}

.av-preview{display:flex;justify-content:center;margin-bottom:20px}
.av-big{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:white;border:3px solid white;box-shadow:0 4px 16px rgba(0,0,0,.15)}

.av-section{font-size:12px;font-weight:600;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px}
.av-emoji-grid{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.av-emoji-opt{width:40px;height:40px;border-radius:10px;border:1.5px solid var(--border);background:none;cursor:pointer;font-size:20px;transition:all .15s;display:flex;align-items:center;justify-content:center}
.av-emoji-opt.sel{border-color:var(--agua-d);background:var(--agua-p)}
.av-color-grid{display:flex;gap:8px;flex-wrap:wrap}
.av-color-opt{width:28px;height:28px;border-radius:50%;cursor:pointer;border:2.5px solid transparent;transition:all .15s}
.av-color-opt.sel{border-color:var(--slate);transform:scale(1.2)}

/* ── PW MODAL ── */
.pw-strength{height:4px;border-radius:2px;margin-top:6px;transition:all .3s}

/* ── TOAST ── */
.profile-toast{position:fixed;bottom:28px;right:28px;width:max-content;max-width:min(360px,calc(100vw - 32px));background:var(--slate);color:white;padding:13px 20px;border-radius:12px;font-size:13px;line-height:1.35;display:flex;align-items:center;gap:10px;box-shadow:0 6px 24px rgba(45,74,71,.25);animation:slideUp .3s ease;z-index:300}

/* ── CONFIRM MODAL (small) ── */
.confirm-modal{background:var(--white);border-radius:16px;width:100%;max-width:360px;box-shadow:0 20px 60px rgba(45,74,71,.2);animation:slideUp .25s ease;padding:28px}
.confirm-title{font-family:'DM Serif Display',serif;font-size:20px;color:var(--slate);margin-bottom:10px}
.confirm-msg{font-size:14px;color:var(--slate-m);line-height:1.6;margin-bottom:24px}
.confirm-btns{display:flex;gap:10px}
.btn-confirm-cancel{flex:1;padding:11px;background:none;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--muted);cursor:pointer;transition:all .18s}
.btn-confirm-cancel:hover{background:var(--mint)}
.btn-confirm-ok{flex:1;padding:11px;background:var(--red);color:white;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .18s}
.btn-confirm-ok:hover{background:#c85555}

@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

@media(max-width:1050px){.grid-main{grid-template-columns:1fr}.right-col{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.right-col .card:last-child{grid-column:1/-1}}
@media(max-width:768px){
  :root{--sidebar-w:0px}
  .sidebar{display:none}
  .main{margin-left:0}
  .profile-app .main{margin-left:0;width:100%}
  .content{padding:16px}
  .profile-app .content{padding:16px}
  .header{padding:0 16px}
  .hero-banner{flex-direction:column;text-align:center;padding:24px}
  .hero-stats{flex-direction:row;justify-content:center;gap:24px}
  .hero-stat{text-align:center}
  .form-grid{grid-template-columns:1fr}
  .fg.full{grid-column:1}
  .profile-toast{left:16px;right:16px;bottom:18px;width:auto;max-width:none}
}
@media(max-width:560px){
  .header{height:auto;min-height:var(--header-h);align-items:flex-start;flex-direction:column;gap:12px;padding:14px 16px}
  .hd-right{width:100%;justify-content:flex-start}
  .hero-banner{padding:22px 18px;gap:18px}
  .hero-avatar{width:76px;height:76px;font-size:28px}
  .hero-name{font-size:25px}
  .hero-email{font-size:13px;overflow-wrap:anywhere}
  .hero-tags{justify-content:center}
  .hero-stats{width:100%;gap:10px}
  .hero-stat{flex:1;padding:10px;border-radius:12px;background:rgba(255,255,255,.08)}
  .section-tabs{padding:0 12px;overflow-x:auto}
  .stab{padding:12px 10px;white-space:nowrap}
  .card-body{padding:18px}
  .right-col{grid-template-columns:1fr!important}
  .right-col .card:last-child{grid-column:auto}
  .stats-grid{grid-template-columns:1fr}
  .plan-current{align-items:flex-start;flex-direction:column}
  .toggle-row,.security-item,.danger-item{align-items:flex-start;flex-direction:column}
  .switch{align-self:flex-end}
  .btn-sec,.btn-danger{width:100%}
  .modal{max-width:calc(100vw - 24px)}
  .modal-foot,.confirm-btns{flex-direction:column}
}
`;

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const getPwStrength = (pw) => {
  if (!pw) return { w: 0, color: "var(--border)", label: "" };
  let s = 0;
  if (pw.length >= 8)        s++;
  if (/[A-Z]/.test(pw))     s++;
  if (/[0-9]/.test(pw))     s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { w:20,  color:"#E07070", label:"Muy débil" },
    { w:40,  color:"#E0A870", label:"Débil" },
    { w:65,  color:"#E0D070", label:"Regular" },
    { w:85,  color:"#7EC8C0", label:"Buena" },
    { w:100, color:"#4CAF7D", label:"Fuerte" },
  ];
  return map[s];
};

/* Toggle Switch */
const Switch = ({ checked, onChange }) => (
  <label className="switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <div className="switch-track" />
    <div className="switch-knob" />
  </label>
);

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function PerfilPage({ onLogout, onNavigate, isGuest = false, registeredAt }) {
  const initialUser = isGuest ? USUARIO_INIT : { ...USUARIO_EMPTY, fechaRegistro: registeredAt || "" };
  const [activeNav, setActiveNav] = useState("perfil");
  const [tab, setTab]             = useState("personal"); // personal | seguridad | notificaciones | plan
  const [usuario, setUsuario]     = useState(initialUser);
  const [form, setForm]           = useState({ ...initialUser });
  const [dirty, setDirty]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);

  const handleNavClick = (id) => {
    setActiveNav(id);
    if (onNavigate) onNavigate(id);
  };

  // Avatar modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avEmoji, setAvEmoji]  = useState("");
  const [avColor, setAvColor]  = useState(initialUser.avatarColor);

  // Password modal
  const [showPwModal, setShowPwModal]   = useState(false);
  const [pwForm, setPwForm]             = useState({ actual: "", nueva: "", confirmar: "" });
  const [showPws, setShowPws]           = useState({ actual: false, nueva: false, confirmar: false });

  // Notif
  const [notif, setNotif] = useState({
    emailResumen:   true,
    emailAlertas:   true,
    pushGastos:     false,
    pushMetas:      true,
    pushPagos:      true,
    recordatorios:  true,
  });

  // Confirm modal
  const [confirm, setConfirm] = useState(null); // { title, msg, onOk }
  const estadisticas = isGuest ? ESTADISTICAS : [
    { label:"Metas activas",      val:"0", icon:"🎯", color:"#5AADA5" },
    { label:"Meses de uso",       val:"0", icon:"📅", color:"#C9A96E" },
    { label:"Ahorro acumulado",   val:"S/ 0", icon:"💰", color:"#4CAF7D" },
  ];
  const actividad = isGuest ? ACTIVIDAD : [];

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleFormChange = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setDirty(true);
  };

  const guardarPerfil = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setUsuario({ ...form });
    setSaving(false);
    setDirty(false);
    showToast("✓ Perfil actualizado correctamente");
  };

  const guardarAvatar = () => {
    const label = avEmoji || usuario.avatar;
    setUsuario(p => ({ ...p, avatar: label, avatarColor: avColor }));
    setForm(p => ({ ...p, avatar: label, avatarColor: avColor }));
    setShowAvatarModal(false);
    showToast("✓ Avatar actualizado");
  };

  const cambiarPassword = async () => {
    if (!pwForm.actual) { showToast("⚠ Ingresa tu contraseña actual"); return; }
    if (pwForm.nueva.length < 8) { showToast("⚠ La contraseña nueva debe tener al menos 8 caracteres"); return; }
    if (pwForm.nueva !== pwForm.confirmar) { showToast("⚠ Las contraseñas no coinciden"); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setPwForm({ actual: "", nueva: "", confirmar: "" });
    setShowPwModal(false);
    showToast("✓ Contraseña actualizada correctamente");
  };

  const pwStrength = getPwStrength(pwForm.nueva);

  const renderAvatar = (label, color, size = 88, fontSize = 32) => {
    const isEmoji = label && label.length <= 2 && /\p{Emoji}/u.test(label);
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: isEmoji ? color : color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize, fontWeight: 700, color: "white",
      }}>
        {isEmoji ? label : label}
      </div>
    );
  };

  return (
    <>
      <style>{S}</style>

      {toast && <div className="profile-toast">{toast}</div>}

      {/* ── CONFIRM MODAL ── */}
      {confirm && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setConfirm(null)}>
          <div className="confirm-modal">
            <div className="confirm-title">{confirm.title}</div>
            <div className="confirm-msg">{confirm.msg}</div>
            <div className="confirm-btns">
              <button className="btn-confirm-cancel" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn-confirm-ok" onClick={() => { confirm.onOk(); setConfirm(null); }}>{confirm.label || "Confirmar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── AVATAR MODAL ── */}
      {showAvatarModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAvatarModal(false)}>
          <div className="modal">
            <div className="modal-hd">
              <h2 className="modal-title">Cambiar avatar</h2>
              <button className="modal-close" onClick={() => setShowAvatarModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="av-preview">
                <div className="av-big" style={{ background: avColor }}>
                  {avEmoji || usuario.avatar}
                </div>
              </div>
              <div className="av-section">Emoji o inicial</div>
              <div className="av-emoji-grid">
                {AVATAR_EMOJIS.map(e => (
                  <button key={e} className={`av-emoji-opt${avEmoji===e?" sel":""}`}
                    onClick={() => setAvEmoji(e)}>{e}</button>
                ))}
                <button className={`av-emoji-opt${avEmoji===""?" sel":""}`}
                  style={{ fontSize: 16, fontWeight: 700, color: "var(--slate-m)" }}
                  onClick={() => setAvEmoji("")}>{usuario.avatar}</button>
              </div>
              <div className="av-section">Color de fondo</div>
              <div className="av-color-grid">
                {AVATAR_COLORS.map(c => (
                  <div key={c} className={`av-color-opt${avColor===c?" sel":""}`}
                    style={{ background: c }} onClick={() => setAvColor(c)} />
                ))}
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-cancel" onClick={() => setShowAvatarModal(false)}>Cancelar</button>
              <button className="btn-save" onClick={guardarAvatar}>Guardar avatar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PASSWORD MODAL ── */}
      {showPwModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowPwModal(false)}>
          <div className="modal">
            <div className="modal-hd">
              <h2 className="modal-title">Cambiar contraseña</h2>
              <button className="modal-close" onClick={() => setShowPwModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {[
                ["actual",    "Contraseña actual",   "Tu contraseña de acceso"],
                ["nueva",     "Nueva contraseña",    "Mínimo 8 caracteres"],
                ["confirmar", "Confirmar contraseña","Repite la nueva contraseña"],
              ].map(([k, label, ph]) => (
                <div className="fg" key={k} style={{ marginBottom: 16 }}>
                  <label className="fl">{label}</label>
                  <div className="fi-prefix">
                    <span className="fi-prefix-ico">🔒</span>
                    <input className="fi" type={showPws[k] ? "text" : "password"} placeholder={ph}
                      value={pwForm[k]} onChange={e => setPwForm(p => ({ ...p, [k]: e.target.value }))}
                      style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPws(p => ({ ...p, [k]: !p[k] }))}
                      style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,color:"var(--muted)" }}>
                      {showPws[k] ? "🙈" : "👁"}
                    </button>
                  </div>
                  {k === "nueva" && pwForm.nueva && (
                    <>
                      <div className="pw-strength" style={{ width:`${pwStrength.w}%`, background: pwStrength.color }} />
                      <span style={{ fontSize:11, color: pwStrength.color, fontWeight:500 }}>{pwStrength.label}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-foot">
              <button className="btn-cancel" onClick={() => setShowPwModal(false)}>Cancelar</button>
              <button className="btn-save" onClick={cambiarPassword} disabled={saving}>
                {saving ? "Guardando…" : "Actualizar contraseña"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── APP ── */}
      <div className="app profile-app">
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sb-ico">💎</div>
            <span className="sb-txt">Savia</span>
          </div>
          <nav className="sb-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`nav-item${activeNav===item.id?" active":""}`}
                onClick={() => handleNavClick(item.id)}>
                <span style={{fontSize:16,width:20,textAlign:"center"}}>{item.icon}</span>
                {item.label}
              </button>
            ))}
            <SidebarCards />
          </nav>
          <div className="sb-footer">
            <div className="user-chip">
              <div className="user-av" style={{background:usuario.avatarColor}}>{usuario.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="user-nm">{usuario.nombre} {usuario.apellido}</div>
                <div className="user-pl">{isGuest ? "⭐ Premium" : "Plan gratuito"}</div>
              </div>
              {onLogout && <button className="logout-btn" title="Cerrar sesión" onClick={onLogout}>⏻</button>}
            </div>
          </div>
        </aside>

        <div className="main">
          <header className="header">
            <div>
              <div className="hd-eye">Configuración de cuenta</div>
              <div className="hd-title">Mi Perfil</div>
            </div>
            <div className="hd-right">
              {dirty && (
                <button className="btn-primary" onClick={guardarPerfil} disabled={saving}>
                  {saving ? "Guardando…" : "💾 Guardar cambios"}
                </button>
              )}
            </div>
          </header>

          <div className="content">

            {/* ── HERO ── */}
            <div className="hero-banner">
              <div className="hero-avatar-wrap">
                <div className="hero-avatar" style={{background: usuario.avatarColor}}
                  onClick={() => { setAvEmoji(""); setAvColor(usuario.avatarColor); setShowAvatarModal(true); }}>
                  {usuario.avatar}
                  <div className="avatar-edit-badge">✏️</div>
                </div>
              </div>
              <div className="hero-info">
                <div className="hero-name">{usuario.nombre} {usuario.apellido}</div>
                <div className="hero-email">{usuario.email}</div>
                <div className="hero-tags">
                  <span className="hero-tag tag-plan">{isGuest ? "⭐ Plan Premium" : "Plan gratuito"}</span>
                  <span className="hero-tag tag-date">📅 Miembro desde {usuario.fechaRegistro}</span>
                  <span className="hero-tag tag-collab">🇵🇪 Lima, Perú</span>
                </div>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-val">{isGuest ? "S/ 8,170" : "S/ 0"}</div>
                  <div className="hero-stat-lbl">Total ahorrado</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-val">{isGuest ? "S/ 1,700" : "S/ 0"}</div>
                  <div className="hero-stat-lbl">Saldo libre</div>
                </div>
              </div>
            </div>

            {/* ── MAIN GRID ── */}
            <div className="grid-main">

              {/* LEFT */}
              <div style={{display:"flex",flexDirection:"column",gap:20}}>

                {/* Card con tabs */}
                <div className="card" style={{animationDelay:".1s"}}>
                  <div className="section-tabs">
                    {[
                      ["personal",       "👤 Personal"],
                      ["seguridad",      "🔒 Seguridad"],
                      ["notificaciones", "🔔 Notificaciones"],
                    ].map(([k,l]) => (
                      <button key={k} className={`stab${tab===k?" on":""}`} onClick={() => setTab(k)}>{l}</button>
                    ))}
                  </div>

                  {/* ── TAB: PERSONAL ── */}
                  {tab === "personal" && (
                    <div className="card-body">
                      <div className="form-grid">
                        <div className="fg">
                          <label className="fl">Nombre</label>
                          <input className="fi" value={form.nombre} onChange={handleFormChange("nombre")} />
                        </div>
                        <div className="fg">
                          <label className="fl">Apellido</label>
                          <input className="fi" value={form.apellido} onChange={handleFormChange("apellido")} />
                        </div>
                        <div className="fg full">
                          <label className="fl">Correo electrónico</label>
                          <div className="fi-prefix">
                            <span className="fi-prefix-ico">✉</span>
                            <input className="fi" type="email" value={form.email} onChange={handleFormChange("email")} />
                          </div>
                        </div>
                        <div className="fg">
                          <label className="fl">Teléfono</label>
                          <div className="fi-prefix">
                            <span className="fi-prefix-ico">📱</span>
                            <input className="fi" type="tel" value={form.telefono} onChange={handleFormChange("telefono")} />
                          </div>
                        </div>
                        <div className="fg">
                          <label className="fl">Moneda principal</label>
                          <select className="fi" value={form.moneda} onChange={handleFormChange("moneda")}>
                            <option value="PEN">🇵🇪 Sol Peruano (S/)</option>
                            <option value="USD">🇺🇸 Dólar ($)</option>
                            <option value="EUR">🇪🇺 Euro (€)</option>
                            <option value="COP">🇨🇴 Peso Colombiano</option>
                            <option value="MXN">🇲🇽 Peso Mexicano</option>
                          </select>
                        </div>
                        <div className="fg">
                          <label className="fl">Presupuesto mensual (S/)</label>
                          <div className="fi-prefix">
                            <span className="fi-prefix-ico">💰</span>
                            <input className="fi" type="number" value={form.presupuestoMensual} onChange={handleFormChange("presupuestoMensual")} />
                          </div>
                        </div>
                        <div className="fg">
                          <label className="fl">Idioma</label>
                          <select className="fi" value={form.idioma} onChange={handleFormChange("idioma")}>
                            <option value="es">🇪🇸 Español</option>
                            <option value="en">🇺🇸 English</option>
                            <option value="pt">🇧🇷 Português</option>
                          </select>
                        </div>
                        <div className="fg">
                          <label className="fl">Zona horaria</label>
                          <select className="fi" value={form.timezone} onChange={handleFormChange("timezone")}>
                            <option value="America/Lima">América/Lima (UTC-5)</option>
                            <option value="America/Bogota">América/Bogotá (UTC-5)</option>
                            <option value="America/Mexico_City">América/México (UTC-6)</option>
                            <option value="America/Santiago">América/Santiago (UTC-4)</option>
                          </select>
                        </div>
                      </div>

                      {dirty && (
                        <div style={{marginTop:20,display:"flex",justifyContent:"flex-end",gap:10}}>
                          <button className="btn-cancel" onClick={() => { setForm({...usuario}); setDirty(false); }}>
                            Descartar
                          </button>
                          <button className="btn-primary" onClick={guardarPerfil} disabled={saving}>
                            {saving ? "Guardando…" : "💾 Guardar cambios"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── TAB: SEGURIDAD ── */}
                  {tab === "seguridad" && (
                    <div className="card-body">
                      {[
                        { icon:"🔑", label:"Contraseña", sub:"Última actualización: hace 3 meses", badge:"b-warn", badgeTxt:"Actualizar pronto", action:"Cambiar", onClick: () => setShowPwModal(true) },
                        { icon:"📱", label:"Verificación en dos pasos", sub:"Protección extra con tu teléfono", badge:"b-warn", badgeTxt:"No activado", action:"Activar", onClick: () => showToast("✓ 2FA activado") },
                        { icon:"🔗", label:"Sesiones activas", sub:"1 sesión activa · Lima, Perú", badge:"b-green", badgeTxt:"Activo", action:"Ver todo", onClick: () => showToast("Solo tienes 1 sesión activa") },
                        { icon:"📋", label:"Historial de accesos", sub:"Ver cuándo y desde dónde entraste", badge:null, badgeTxt:null, action:"Ver historial", onClick: () => showToast("Función próximamente") },
                      ].map((item, i) => (
                        <div className="security-item" key={i}>
                          <div className="sec-ico">{item.icon}</div>
                          <div className="sec-info">
                            <div className="sec-label">{item.label}</div>
                            <div className="sec-sub">{item.sub}</div>
                          </div>
                          {item.badge && <span className={`sec-badge ${item.badge}`}>{item.badgeTxt}</span>}
                          <button className="btn-sec" onClick={item.onClick}>{item.action}</button>
                        </div>
                      ))}

                      <div style={{marginTop:24}}>
                        <div className="danger-zone">
                          <div className="danger-zone-title">⚠ Zona peligrosa</div>
                          {[
                            { desc:"Cerrar todas las sesiones", hint:"Se cerrará tu cuenta en todos los dispositivos.", btn:"Cerrar sesiones", onOk: () => showToast("✓ Sesiones cerradas") },
                            { desc:"Eliminar cuenta", hint:"Esta acción es permanente e irreversible.", btn:"Eliminar cuenta", onOk: () => showToast("Cuenta eliminada (simulación)") },
                          ].map((item, i) => (
                            <div className="danger-item" key={i}>
                              <div>
                                <div className="danger-desc">{item.desc}</div>
                                <div className="danger-hint">{item.hint}</div>
                              </div>
                              <button className="btn-danger" onClick={() => setConfirm({
                                title: item.desc,
                                msg: item.hint + " ¿Estás seguro de continuar?",
                                label: item.btn,
                                onOk: item.onOk,
                              })}>{item.btn}</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── TAB: NOTIFICACIONES ── */}
                  {tab === "notificaciones" && (
                    <div className="card-body">
                      <div style={{fontSize:13,color:"var(--muted)",marginBottom:20,lineHeight:1.6}}>
                        Controla qué notificaciones recibes y cómo te avisamos de actividad importante en tu cuenta.
                      </div>

                      <div style={{fontSize:12,fontWeight:600,color:"var(--muted)",letterSpacing:".5px",textTransform:"uppercase",marginBottom:10}}>Por correo</div>
                      {[
                        ["emailResumen",  "Resumen semanal",   "Recibe un resumen de tus finanzas cada lunes"],
                        ["emailAlertas",  "Alertas de presupuesto", "Cuando superes el 80% de tu límite mensual"],
                      ].map(([k,l,h]) => (
                        <div className="toggle-row" key={k}>
                          <div><div className="toggle-label">{l}</div><div className="toggle-hint">{h}</div></div>
                          <Switch checked={notif[k]} onChange={() => setNotif(p => ({...p,[k]:!p[k]}))} />
                        </div>
                      ))}

                      <div style={{fontSize:12,fontWeight:600,color:"var(--muted)",letterSpacing:".5px",textTransform:"uppercase",margin:"20px 0 10px"}}>Push (app)</div>
                      {[
                        ["pushGastos",    "Nuevo gasto registrado",   "Notificación por cada gasto que añadas"],
                        ["pushMetas",     "Progreso de metas",        "Cuando alcances un hito en tus metas"],
                        ["pushPagos",     "Recordatorio de pagos",    "3 días antes de un vencimiento"],
                        ["recordatorios", "Recordatorio de aporte",   "Aviso mensual para abonar a tus metas"],
                      ].map(([k,l,h]) => (
                        <div className="toggle-row" key={k}>
                          <div><div className="toggle-label">{l}</div><div className="toggle-hint">{h}</div></div>
                          <Switch checked={notif[k]} onChange={() => setNotif(p => ({...p,[k]:!p[k]}))} />
                        </div>
                      ))}

                      <button className="btn-primary" style={{marginTop:20}} onClick={() => showToast("✓ Preferencias de notificaciones guardadas")}>
                        Guardar preferencias
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COL */}
              <div className="right-col" style={{display:"flex",flexDirection:"column",gap:18}}>

                {/* ESTADÍSTICAS */}
                <div className="card" style={{animationDelay:".18s"}}>
                  <div className="card-hd">
                    <div>
                      <div className="card-title">Resumen</div>
                      <div className="card-sub">Tu actividad en Savia</div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="stats-grid">
                      {estadisticas.map((s,i) => (
                        <div key={i} className="stat-chip" style={{background:s.color+"18"}}>
                          <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
                          <div className="stat-chip-val" style={{color:s.color}}>{s.val}</div>
                          <div className="stat-chip-lbl" style={{color:s.color+"BB"}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PLAN */}
                <div className="card" style={{animationDelay:".24s"}}>
                  <div className="card-hd">
                    <div>
                      <div className="card-title">Mi Plan</div>
                      <div className="card-sub">Suscripción activa</div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="plan-current">
                      <div className="plan-ico">{isGuest ? "⭐" : "🌱"}</div>
                      <div className="plan-info">
                        <div className="plan-name">{isGuest ? "Plan Premium" : "Plan Gratuito"}</div>
                        <div className="plan-sub">{isGuest ? "Renovación: 12 jun 2025" : "Sin renovación activa"}</div>
                      </div>
                      <div>
                        <div className="plan-price">{isGuest ? "S/ 19.90" : "S/ 0.00"}</div>
                        <div className="plan-period">/ mes</div>
                      </div>
                    </div>
                    <div className="feature-list">
                      {[
                        [true,  "Registro ilimitado de gastos"],
                        [true,  "Dashboard completo"],
                        [true,  "Historial extendido (12+ meses)"],
                        [true,  "Chatbot financiero con IA"],
                        [true,  "Metas colaborativas"],
                        [true,  "Alertas avanzadas"],
                      ].map(([on, f], i) => (
                        <div className="feature-item" key={i}>
                          <div className={`feature-check${on?"":" off"}`}>{on?"✓":"—"}</div>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button className="btn-upgrade" onClick={() => showToast("Redirigiendo a planes…")}>
                      🔄 Gestionar suscripción
                    </button>
                  </div>
                </div>

                {/* ACTIVIDAD RECIENTE */}
                <div className="card" style={{animationDelay:".3s"}}>
                  <div className="card-hd">
                    <div>
                      <div className="card-title">Actividad reciente</div>
                      <div className="card-sub">Últimos movimientos</div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="act-list">
                      {actividad.length === 0 ? (
                        <div style={{ textAlign:"center", padding:"28px 0", color:"var(--muted)", fontSize:13 }}>
                          Aún no hay actividad registrada.
                        </div>
                      ) : actividad.map(a => (
                        <div className="act-item" key={a.id}>
                          <div className="act-ico">{a.icon}</div>
                          <div className="act-info">
                            <div className="act-desc">{a.desc}</div>
                            <div className="act-date">{a.fecha}</div>
                          </div>
                          {a.monto !== 0 && (
                            <div className={`act-monto ${a.monto>0?"pos":"neg"}`}>
                              {a.monto>0?"+":""}S/ {Math.abs(a.monto).toFixed(2)}
                            </div>
                          )}
                          {a.monto === 0 && <div className="act-monto neu">—</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
