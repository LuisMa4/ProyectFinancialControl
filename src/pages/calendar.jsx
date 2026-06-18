import { useState, useMemo } from "react";
import CreateEvent from "../components/CreateEvent.jsx";
import SidebarCards from "../components/SidebarCards";

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const EVENTOS_INIT = [
  { id:1,  tipo:"pago",    desc:"Alquiler",          monto:-1200, dia:1,  icono:"🏠", color:"#E07070", recurrente:true  },
  { id:2,  tipo:"ingreso", desc:"Sueldo",             monto:+3600, dia:5,  icono:"💼", color:"#4CAF7D", recurrente:true  },
  { id:3,  tipo:"pago",    desc:"Claro Internet",     monto:-89,   dia:5,  icono:"📡", color:"#E07070", recurrente:true  },
  { id:4,  tipo:"meta",    desc:'Aporte "Europa"',    monto:-400,  dia:6,  icono:"✈️", color:"#7EC8C0", recurrente:true  },
  { id:5,  tipo:"pago",    desc:"Netflix",            monto:-37.90,dia:8,  icono:"🎬", color:"#E07070", recurrente:true  },
  { id:6,  tipo:"pago",    desc:"Spotify",            monto:-19.90,dia:10, icono:"🎵", color:"#E07070", recurrente:true  },
  { id:7,  tipo:"ingreso", desc:"Transferencia",      monto:+250,  dia:12, icono:"💸", color:"#4CAF7D", recurrente:false },
  { id:8,  tipo:"pago",    desc:"Seguro auto",        monto:-220,  dia:15, icono:"🚘", color:"#E07070", recurrente:true  },
  { id:9,  tipo:"meta",    desc:'Aporte "Laptop"',    monto:-200,  dia:15, icono:"💻", color:"#C9A96E", recurrente:true  },
  { id:10, tipo:"pago",    desc:"Luz del Sur",        monto:-89,   dia:18, icono:"⚡", color:"#E07070", recurrente:true  },
  { id:11, tipo:"pago",    desc:"Agua Sedapal",       monto:-42,   dia:20, icono:"💧", color:"#8AADA9", recurrente:true  },
  { id:12, tipo:"ingreso", desc:"Freelance diseño",   monto:+800,  dia:22, icono:"🎨", color:"#4CAF7D", recurrente:false },
  { id:13, tipo:"pago",    desc:"Gimnasio",           monto:-80,   dia:25, icono:"🏋️",  color:"#E07070", recurrente:true  },
  { id:14, tipo:"meta",    desc:'Aporte "Emergencia"',monto:-300,  dia:28, icono:"🛡️", color:"#5AADA5", recurrente:true  },
  { id:15, tipo:"pago",    desc:"Tarjeta crédito",    monto:-450,  dia:30, icono:"💳", color:"#E07070", recurrente:true  },
];

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_SEMANA_L = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const DIAS_SEMANA_S = ["L","M","X","J","V","S","D"];

const NAV_ITEMS = [
  { id:"dashboard",  label:"Dashboard",  icon:"◉" },
  { id:"gastos",     label:"Gastos",     icon:"💳" },
  { id:"metas",      label:"Metas",      icon:"🎯" },
  { id:"calendario", label:"Calendario", icon:"📅" },
  { id:"chatbot",    label:"Chatbot IA", icon:"🤖" },
  { id:"perfil",     label:"Mi Perfil",  icon:"👤" },
];

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
  --sw:240px; /* sidebar width */
}
html,body{height:100%}
body{font-family:'DM Sans',sans-serif;background:var(--mint);color:var(--slate)}
#root:has(.calendar-app){width:100%;max-width:none;min-height:100svh;margin:0;border:0;text-align:left}

/* ── LAYOUT ── */
.app{display:flex;min-height:100vh}
.calendar-app.app{position:fixed;inset:0;display:flex;width:100vw;max-width:none;min-height:100svh;background:var(--mint);overflow:hidden}
.calendar-app .sidebar{width:240px;min-width:240px;max-width:240px;flex:0 0 240px}

/* ── SIDEBAR ── */
.sidebar{
  width:var(--sw);background:var(--slate);
  display:flex;flex-direction:column;
  position:fixed;top:0;left:0;height:100vh;z-index:50;
  transition:transform .3s ease;
}
.sidebar.collapsed{transform:translateX(-100%)}
.sb-brand{display:flex;align-items:center;gap:10px;padding:23px 22px 19px;border-bottom:1px solid rgba(255,255,255,.08)}
.sb-ico{width:35px;height:35px;border-radius:10px;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:17.5px;flex-shrink:0}
.sb-txt{font-family:'DM Serif Display',serif;font-size:21.5px;color:white;letter-spacing:-.3px}
.sb-nav{flex:1;padding:15px 11px;display:flex;flex-direction:column;gap:4px;overflow-y:auto}
.nav-item{display:flex;align-items:center;gap:11.5px;padding:10.5px 13.5px;border-radius:10px;font-size:13.75px;color:rgba(255,255,255,.55);cursor:pointer;transition:all .18s;border:none;background:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif}
.nav-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.85)}
.nav-item.active{background:linear-gradient(135deg,rgba(90,173,165,.35),rgba(126,200,192,.2));color:white;font-weight:500;box-shadow:inset 0 0 0 1px rgba(126,200,192,.22)}
.nav-icon{font-size:15.5px;width:20px;text-align:center;flex-shrink:0}
.sb-footer{padding:15px 11px;border-top:1px solid rgba(255,255,255,.08)}
.user-chip{display:flex;align-items:center;gap:9.5px;padding:9.5px 11.5px;border-radius:10px;background:rgba(255,255,255,.06)}
.user-av{width:33px;height:33px;border-radius:50%;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:13.5px;color:white;font-weight:600;flex-shrink:0}
.user-nm{font-size:12.75px;font-weight:500;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-pl{font-size:10.75px;color:var(--agua-l)}

/* OVERLAY for mobile sidebar */
.sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:99}
.sb-overlay.show{display:block}

/* ── MAIN ── */
.main{margin-left:var(--sw);flex:1;display:flex;flex-direction:column;min-width:0}
.calendar-app .main{margin-left:240px;width:calc(100vw - 240px);height:100svh;overflow-y:auto}

/* ── HEADER ── */
.header{
  background:var(--white);border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 32px;height:68px;
  position:sticky;top:0;z-index:50;
  gap:12px;
}
.hd-left{display:flex;align-items:center;gap:12px;min-width:0}
.hamburger{display:none;background:none;border:1px solid var(--border);border-radius:9px;padding:7px 9px;cursor:pointer;font-size:15px;color:var(--slate-m);transition:all .15s;flex-shrink:0}
.hamburger:hover{background:var(--mint);border-color:var(--agua-l)}
.hd-titles{min-width:0}
.hd-eye{font-size:12px;color:var(--muted);font-weight:300;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-title{font-family:'DM Serif Display',serif;font-size:20px;color:var(--slate);letter-spacing:-.3px;line-height:1.1}
.hd-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.btn-primary{display:flex;align-items:center;gap:6px;padding:9px 16px;background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;box-shadow:0 3px 12px rgba(90,173,165,.3);transition:all .17s;white-space:nowrap}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 5px 18px rgba(90,173,165,.4)}
.btn-ghost{padding:8px 10px;background:none;border:1px solid var(--border);border-radius:9px;cursor:pointer;font-size:14px;color:var(--slate-m);transition:all .17s}
.btn-ghost:hover{background:var(--mint);border-color:var(--agua-l)}

/* ── CONTENT ── */
.content{padding:clamp(18px,2.5vw,32px);display:flex;flex-direction:column;gap:22px;flex:1;width:100%}

/* ── MONTH NAV ── */
.month-nav{
  display:flex;align-items:center;justify-content:space-between;
  background:var(--white);border:1px solid var(--border);border-radius:14px;padding:14px 20px;
  animation:fadeUp .3s ease;
  order:2;
}
.month-nav-left{display:flex;align-items:center;gap:12px}
.month-btn{width:34px;height:34px;border-radius:9px;border:1px solid var(--border);background:none;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .15s;color:var(--slate-m)}
.month-btn:hover{background:var(--mint);border-color:var(--agua-l);color:var(--agua-d)}
.month-label{font-family:'DM Serif Display',serif;font-size:22px;color:var(--slate);letter-spacing:-.3px}
.month-year{font-size:14px;color:var(--muted);margin-left:4px}
.month-nav-right{display:flex;align-items:center;gap:8px}
.view-toggle{display:flex;border:1px solid var(--border);border-radius:9px;overflow:hidden}
.vt-btn{padding:7px 13px;background:none;border:none;cursor:pointer;font-size:12px;font-weight:500;color:var(--muted);transition:all .15s;font-family:'DM Sans',sans-serif;white-space:nowrap}
.vt-btn.on{background:var(--agua-d);color:white}
.today-btn{padding:7px 14px;border:1px solid var(--border);border-radius:9px;background:none;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;color:var(--slate-m);cursor:pointer;transition:all .15s}
.today-btn:hover{background:var(--mint);border-color:var(--agua-l);color:var(--agua-d)}

/* ── BALANCE STRIP ── */
.balance-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;animation:fadeUp .35s ease both;animation-delay:.05s;order:1}
.bal-card{background:var(--white);border:1px solid var(--border);border-radius:13px;padding:14px 18px;display:flex;align-items:center;gap:12px}
.bal-card.accent{background:linear-gradient(135deg,var(--agua-d),var(--agua));border-color:transparent}
.bal-ico{font-size:22px;flex-shrink:0}
.bal-val{font-family:'DM Serif Display',serif;font-size:20px;letter-spacing:-.3px;color:var(--slate)}
.bal-card.accent .bal-val{color:white}
.bal-lbl{font-size:11px;color:var(--muted)}
.bal-card.accent .bal-lbl{color:rgba(255,255,255,.7)}

/* ── MAIN GRID ── */
.cal-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,300px);gap:20px;align-items:start;order:3}

/* ── CALENDAR GRID ── */
.cal-card{background:var(--white);border:1px solid var(--border);border-radius:16px;overflow:hidden;animation:fadeUp .4s ease both;animation-delay:.1s}
.cal-head{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid var(--border)}
.cal-head-cell{padding:10px 4px;text-align:center;font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.4px;text-transform:uppercase}
.cal-body{display:grid;grid-template-columns:repeat(7,1fr)}
.cal-cell{
  min-height:90px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);
  padding:6px;cursor:pointer;transition:background .15s;
  display:flex;flex-direction:column;gap:3px;position:relative;
}
.cal-cell:nth-child(7n){border-right:none}
.cal-cell:hover{background:#F7FEFE}
.cal-cell.other-month{background:#F9FBFB}
.cal-cell.today{background:linear-gradient(135deg,rgba(90,173,165,.07),rgba(126,200,192,.05))}
.cal-cell.selected{background:rgba(90,173,165,.1)}
.cal-day-num{
  font-size:12px;font-weight:500;color:var(--slate-m);
  width:24px;height:24px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.cal-cell.today .cal-day-num{background:var(--agua-d);color:white;font-weight:600}
.cal-cell.other-month .cal-day-num{color:var(--muted)}
.cal-cell.weekend .cal-day-num{color:var(--agua-d)}

/* Event pills in cell */
.cal-event{
  font-size:10px;font-weight:500;padding:2px 6px;border-radius:4px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  cursor:pointer;transition:opacity .15s;line-height:1.4;
}
.cal-event:hover{opacity:.8}
.cal-more{font-size:10px;color:var(--muted);padding:1px 4px;cursor:pointer}
.cal-more:hover{color:var(--agua-d)}

/* Balance dot */
.cal-balance{position:absolute;bottom:4px;right:5px;font-size:9px;font-weight:600}
.cal-balance.pos{color:var(--green)}
.cal-balance.neg{color:var(--red)}

/* ── WEEK VIEW ── */
.week-grid{display:grid;grid-template-columns:50px repeat(7,1fr);border-top:1px solid var(--border)}
.week-time{font-size:10px;color:var(--muted);text-align:right;padding:6px 8px 6px 4px;border-right:1px solid var(--border);border-bottom:1px solid var(--border)}
.week-day-header{padding:8px 6px;text-align:center;border-right:1px solid var(--border);border-bottom:1px solid var(--border)}
.week-day-name{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.3px}
.week-day-num{font-size:16px;font-weight:500;color:var(--slate);line-height:1.2}
.week-day-num.today-num{
  width:28px;height:28px;border-radius:50%;background:var(--agua-d);
  color:white;display:flex;align-items:center;justify-content:center;
  font-size:13px;margin:2px auto 0;
}
.week-slot{min-height:32px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);padding:3px}
.week-slot:last-child{border-right:none}
.week-event{
  font-size:10px;padding:2px 6px;border-radius:4px;margin-bottom:2px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;
}

/* ── LIST VIEW ── */
.list-view-wrap{padding:6px}
.list-group{margin-bottom:16px}
.list-group-header{
  font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.5px;
  text-transform:uppercase;padding:8px 12px;
  background:var(--mint);border-radius:8px;margin-bottom:6px;
  display:flex;align-items:center;justify-content:space-between;
}
.list-event{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;cursor:pointer;transition:background .15s;margin-bottom:4px}
.list-event:hover{background:var(--mint)}
.list-ico{width:34px;height:34px;border-radius:9px;background:var(--mint);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.list-info{flex:1;min-width:0}
.list-desc{font-size:13px;color:var(--slate);font-weight:400}
.list-sub{font-size:11px;color:var(--muted);margin-top:1px}
.list-monto{font-size:13px;font-weight:600;white-space:nowrap}
.list-monto.pos{color:var(--green)}
.list-monto.neg{color:var(--red)}
.list-monto.neu{color:var(--muted)}
.rec-dot{width:6px;height:6px;border-radius:50%;background:var(--agua-l);flex-shrink:0}

/* ── RIGHT PANEL ── */
.right-panel{display:flex;flex-direction:column;gap:16px}

.side-card{background:var(--white);border:1px solid var(--border);border-radius:14px;overflow:hidden;animation:fadeUp .4s ease both}
.side-card-hd{padding:16px 18px 0;display:flex;align-items:center;justify-content:space-between}
.side-title{font-family:'DM Serif Display',serif;font-size:15px;color:var(--slate);letter-spacing:-.1px}
.side-sub{font-size:11px;color:var(--muted);margin-top:1px}

/* Selected day panel */
.day-panel-date{
  display:flex;align-items:center;gap:14px;
  padding:16px 18px;border-bottom:1px solid var(--border);
}
.day-big-num{
  font-family:'DM Serif Display',serif;font-size:40px;color:white;
  background:linear-gradient(135deg,var(--agua-d),var(--agua));
  width:60px;height:60px;border-radius:14px;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.day-month{font-size:14px;color:var(--slate-m);font-weight:500}
.day-day{font-size:12px;color:var(--muted)}
.day-balance{font-size:18px;font-weight:600;font-family:'DM Serif Display',serif;margin-top:4px}

.day-events{display:flex;flex-direction:column;gap:0}
.day-event-item{display:flex;align-items:center;gap:10px;padding:11px 18px;border-bottom:1px solid var(--border);transition:background .15s;cursor:pointer}
.day-event-item:last-child{border-bottom:none}
.day-event-item:hover{background:var(--mint)}
.day-ev-ico{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.day-ev-info{flex:1;min-width:0}
.day-ev-desc{font-size:13px;color:var(--slate)}
.day-ev-sub{font-size:10px;color:var(--muted);margin-top:1px}
.day-ev-monto{font-size:13px;font-weight:600;white-space:nowrap}
.empty-day{text-align:center;padding:28px 20px;color:var(--muted);font-size:13px}
.empty-day-ico{font-size:28px;margin-bottom:6px}

/* Upcoming */
.upcoming-list{display:flex;flex-direction:column}
.upcoming-item{display:flex;align-items:center;gap:10px;padding:11px 18px;border-bottom:1px solid var(--border);transition:background .15s}
.upcoming-item:last-child{border-bottom:none}
.up-ico{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.up-info{flex:1;min-width:0}
.up-desc{font-size:12.5px;color:var(--slate)}
.up-date{font-size:10px;color:var(--muted);margin-top:1px}
.up-monto{font-size:12.5px;font-weight:600;white-space:nowrap}
.up-monto.pos{color:var(--green)}
.up-monto.neg{color:var(--red)}
.days-badge{font-size:9px;font-weight:600;padding:2px 6px;border-radius:100px;white-space:nowrap}
.d-urgent{background:#FEF0F0;color:var(--red)}
.d-soon{background:#FFF8EC;color:var(--gold)}
.d-ok{background:var(--mint);color:var(--agua-d)}

/* Mini cal summary bar */
.month-summary{padding:14px 18px;display:flex;flex-direction:column;gap:10px}
.ms-row{display:flex;align-items:center;justify-content:space-between;font-size:13px}
.ms-track{height:5px;background:var(--mint);border-radius:3px;overflow:hidden;margin-top:3px}
.ms-fill{height:100%;border-radius:3px}

/* ── MODAL ── */
.overlay{position:fixed;inset:0;background:rgba(45,74,71,.45);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:flex-end;justify-content:center;padding:0;animation:fadeIn .2s ease}
.modal-sheet{background:var(--white);border-radius:20px 20px 0 0;width:100%;max-width:480px;box-shadow:0 -8px 40px rgba(45,74,71,.2);animation:slideUp .28s ease;display:flex;flex-direction:column;max-height:90vh}
.modal-drag{width:40px;height:4px;border-radius:2px;background:var(--border);margin:12px auto 0}
.modal-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 22px 0}
.modal-title{font-family:'DM Serif Display',serif;font-size:20px;color:var(--slate)}
.modal-close{background:none;border:none;cursor:pointer;font-size:20px;color:var(--muted);line-height:1}
.modal-close:hover{color:var(--slate)}
.modal-body{padding:18px 22px;overflow-y:auto;flex:1}
.modal-foot{padding:14px 22px;border-top:1px solid var(--border);display:flex;gap:10px}
.fg{margin-bottom:15px}
.fl{display:block;font-size:12.5px;font-weight:500;color:var(--slate-m);margin-bottom:5px}
.fi{width:100%;padding:10px 13px;border:1.5px solid var(--border);border-radius:9px;font-size:13.5px;font-family:'DM Sans',sans-serif;color:var(--slate);background:var(--white);outline:none;transition:border-color .2s,box-shadow .2s;appearance:none}
.fi:focus{border-color:var(--agua);box-shadow:0 0 0 3px rgba(126,200,192,.15)}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:15px}
.tipo-grid{display:flex;gap:8px}
.tipo-opt{flex:1;padding:9px;border-radius:9px;border:1.5px solid var(--border);cursor:pointer;font-size:12px;font-weight:500;text-align:center;transition:all .15s;background:none;font-family:'DM Sans',sans-serif;color:var(--muted)}
.tipo-opt.sel-ingreso{border-color:var(--green);background:#E8F7F0;color:var(--green)}
.tipo-opt.sel-pago{border-color:var(--red);background:#FEF0F0;color:var(--red)}
.tipo-opt.sel-meta{border-color:var(--agua-d);background:var(--agua-p);color:var(--agua-d)}
.check-row{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--slate-m);cursor:pointer}
.check-row input{accent-color:var(--agua-d);width:15px;height:15px}
.btn-cancel{flex:1;padding:11px;background:none;border:1.5px solid var(--border);border-radius:9px;font-family:'DM Sans',sans-serif;font-size:13.5px;color:var(--muted);cursor:pointer;transition:all .18s}
.btn-cancel:hover{background:var(--mint)}
.btn-save{flex:2;padding:11px;background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;box-shadow:0 3px 12px rgba(90,173,165,.3);transition:all .18s}
.btn-save:hover{transform:translateY(-1px)}

/* TOAST */
.calendar-toast{position:fixed;bottom:24px;right:24px;width:max-content;max-width:min(320px,calc(100vw - 32px));background:var(--slate);color:white;padding:12px 18px;border-radius:11px;font-size:13px;line-height:1.35;display:flex;align-items:center;gap:9px;box-shadow:0 6px 24px rgba(45,74,71,.25);animation:slideUp .3s ease;z-index:300}

@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

/* ══════════════════════════
   RESPONSIVE
══════════════════════════ */

/* Large tablets (< 1100px) */
@media(max-width:1100px){
  .cal-layout{grid-template-columns:1fr}
  .right-panel{display:grid;grid-template-columns:1fr 1fr;gap:16px}
}

/* Small screens (< 640px) */
@media(max-width:640px){
  :root{--sw:240px}
  .calendar-app .sidebar{transform:translateX(-100%)}
  .calendar-app .sidebar.open{transform:translateX(0);width:240px;min-width:240px;max-width:240px}
  .hamburger{display:flex}
  .main{margin-left:0}
  .calendar-app .main{margin-left:0;width:100vw}
  .balance-strip{grid-template-columns:repeat(2,1fr)}
  .right-panel{grid-template-columns:1fr 1fr}
}

/* Mobile (< 600px) */
@media(max-width:600px){
  .content{padding:14px 12px;gap:14px}
  .header{padding:0 14px;height:58px}
  .month-nav{padding:10px 14px;flex-wrap:wrap;gap:10px}
  .month-label{font-size:18px}
  .month-nav-right{flex-wrap:wrap;gap:6px}
  .balance-strip{grid-template-columns:1fr 1fr;gap:10px}
  .bal-card{padding:12px 14px}
  .bal-val{font-size:17px}
  .cal-cell{min-height:56px;padding:4px}
  .cal-day-num{font-size:11px;width:21px;height:21px}
  .cal-event{display:none} /* show only dots */
  .cal-event-dot{width:5px;height:5px;border-radius:50%;margin:1px 1px 0 0;display:inline-block}
  .cal-dots-row{display:flex;flex-wrap:wrap;margin-top:1px}
  .right-panel{grid-template-columns:1fr}
  .modal-sheet{border-radius:20px 20px 0 0;max-height:85vh}
  .fg2{grid-template-columns:1fr}
  .btn-primary span.label{display:none}
  .month-nav-right .view-toggle{display:none}
  .hd-title{font-size:17px}
  .calendar-toast{left:16px;right:16px;bottom:18px;width:auto;max-width:none}
}

/* Very small (< 380px) */
@media(max-width:380px){
  .balance-strip{grid-template-columns:1fr 1fr}
  .bal-card{gap:8px}
  .bal-ico{font-size:18px}
}
`;

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDay    = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }; // Mon=0

const buildCalendar = (y, m) => {
  const days = getDaysInMonth(y, m);
  const startDay = getFirstDay(y, m);
  const prevDays = getDaysInMonth(y, m - 1);
  const cells = [];
  for (let i = startDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, month: "prev" });
  for (let d = 1; d <= days; d++)         cells.push({ day: d, month: "cur" });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++)    cells.push({ day: d, month: "next" });
  return cells;
};

const isWeekend = (cells, idx) => { const col = idx % 7; return col === 5 || col === 6; };

const TODAY = new Date();

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
const FORM_DEF = { desc: "", tipo: "pago", monto: "", dia: "", icono: "💳", recurrente: false };

export default function CalendarioPage({ onNavigate, onLogout, isGuest = false }) {
  const [year, setYear]   = useState(TODAY.getFullYear());
  const [month, setMonth] = useState(TODAY.getMonth());
  const [view, setView]   = useState("mes"); // mes | semana | lista
  const [selected, setSelected] = useState(TODAY.getDate());
  const [eventos, setEventos]   = useState(() => isGuest ? EVENTOS_INIT : []);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ ...FORM_DEF });
  const [editId, setEditId]       = useState(null);
  const [toast, setToast]         = useState(null);
  const [activeNav, setActiveNav] = useState("calendario");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const handleNavClick = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
    if (onNavigate) onNavigate(id);
  };

  const cells = useMemo(() => buildCalendar(year, month), [year, month]);

  const getEventosDay = (d) => eventos.filter(e => e.dia === d);

  const balanceMes = eventos.reduce((a, e) => a + e.monto, 0);
  const ingresosMes = eventos.filter(e => e.monto > 0).reduce((a, e) => a + e.monto, 0);
  const pagosMes    = eventos.filter(e => e.monto < 0 && e.tipo === "pago").reduce((a, e) => a + e.monto, 0);
  const metasMes    = eventos.filter(e => e.tipo === "meta").reduce((a, e) => a + e.monto, 0);

  const selectedEvs = getEventosDay(selected);
  const selectedBalance = selectedEvs.reduce((a, e) => a + e.monto, 0);

  // Upcoming (next 10 days)
  const upcoming = useMemo(() => {
    const hoy = TODAY.getDate();
    return eventos
      .filter(e => e.dia >= hoy && e.dia <= hoy + 10)
      .sort((a, b) => a.dia - b.dia)
      .slice(0, 6);
  }, [eventos]);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };
  const goToday   = () => { setYear(TODAY.getFullYear()); setMonth(TODAY.getMonth()); setSelected(TODAY.getDate()); };

  const openNew = (dia = selected) => {
    setForm({ ...FORM_DEF, dia: String(dia) });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (ev) => {
    setForm({ desc: ev.desc, tipo: ev.tipo, monto: String(Math.abs(ev.monto)), dia: String(ev.dia), icono: ev.icono, recurrente: ev.recurrente });
    setEditId(ev.id);
    setShowModal(true);
  };

  const guardar = () => {
    if (!form.desc.trim() || !form.monto || !form.dia) { showToast("⚠ Completa todos los campos"); return; }
    const montoFinal = form.tipo === "ingreso" ? +form.monto : -Math.abs(+form.monto);
    const colorMap = { ingreso: "#4CAF7D", pago: "#E07070", meta: "#7EC8C0" };
    const entry = { desc: form.desc, tipo: form.tipo, monto: montoFinal, dia: +form.dia, icono: form.icono, color: colorMap[form.tipo], recurrente: form.recurrente };
    if (editId) {
      setEventos(prev => prev.map(e => e.id === editId ? { ...e, ...entry } : e));
      showToast("✓ Evento actualizado");
    } else {
      setEventos(prev => [...prev, { id: Date.now(), ...entry }]);
      showToast("✓ Evento añadido al calendario");
    }
    setShowModal(false);
  };

  const guardarDesdeCreateEvent = (data) => {
    const tipo = data.tipo === "actividad" ? "meta" : data.tipo;
    const montoBase = Number(data.monto || 0);
    const montoFinal = tipo === "ingreso" ? montoBase : -Math.abs(montoBase);
    const colorMap = { ingreso: "#4CAF7D", pago: "#E07070", meta: "#C9A96E" };
    const entry = {
      id: Date.now(),
      desc: data.desc,
      tipo,
      monto: montoFinal,
      dia: Number(data.dia),
      icono: data.icono || (tipo === "ingreso" ? "💼" : "💳"),
      color: colorMap[tipo] || "#7EC8C0",
      recurrente: Boolean(data.recurrente),
    };
    setEventos(prev => [...prev, entry]);
    showToast("✓ Evento añadido al calendario");
  };

  const eliminar = (id) => { setEventos(prev => prev.filter(e => e.id !== id)); showToast("✓ Evento eliminado"); };

  // Week view data
  const weekStart = useMemo(() => {
    const d = new Date(year, month, selected);
    const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const start = new Date(d); start.setDate(d.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => { const dd = new Date(start); dd.setDate(start.getDate() + i); return dd.getDate(); });
  }, [year, month, selected]);

  // List view: group by day
  const listGroups = useMemo(() => {
    const sorted = [...eventos].sort((a, b) => a.dia - b.dia);
    const groups = {};
    sorted.forEach(e => {
      if (!groups[e.dia]) groups[e.dia] = [];
      groups[e.dia].push(e);
    });
    return Object.entries(groups).map(([d, evs]) => ({ dia: +d, evs }));
  }, [eventos]);

  const ICON_OPTIONS = ["💳","🏠","💼","🎬","🎵","⚡","💧","🚘","🏋️","🛡️","✈️","💻","🎨","💸","📡","🍔","💊","📚"];

  return (
    <>
      <style>{S}</style>
      {toast && <div className="calendar-toast">{toast}</div>}

      {/* Sidebar overlay */}
      <div className={`sb-overlay${sidebarOpen ? " show" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* ── MODAL ── */}
      {showModal && !editId && (
        <CreateEvent
          dia={Number(form.dia || selected)}
          mes={month}
          anio={year}
          onClose={() => setShowModal(false)}
          onSave={guardarDesdeCreateEvent}
        />
      )}

      {showModal && editId && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-sheet">
            <div className="modal-drag" />
            <div className="modal-hd">
              <h2 className="modal-title">{editId ? "Editar evento" : "Nuevo evento"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Tipo */}
              <div className="fg">
                <label className="fl">Tipo de evento</label>
                <div className="tipo-grid">
                  {[["ingreso","💰 Ingreso"],["pago","💳 Pago"],["meta","🎯 Meta"]].map(([k,l]) => (
                    <button key={k} className={`tipo-opt${form.tipo===k?` sel-${k}`:""}`}
                      onClick={() => setForm(p => ({ ...p, tipo: k }))}>{l}</button>
                  ))}
                </div>
              </div>

              <div className="fg">
                <label className="fl">Descripción</label>
                <input className="fi" placeholder="Ej: Sueldo, Netflix, Alquiler..." value={form.desc}
                  onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} />
              </div>

              <div className="fg2">
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl">Monto (S/)</label>
                  <input className="fi" type="number" placeholder="0.00" value={form.monto}
                    onChange={e => setForm(p => ({ ...p, monto: e.target.value }))} />
                </div>
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl">Día del mes</label>
                  <input className="fi" type="number" min="1" max="31" placeholder="1–31" value={form.dia}
                    onChange={e => setForm(p => ({ ...p, dia: e.target.value }))} />
                </div>
              </div>

              <div className="fg" style={{marginTop:15}}>
                <label className="fl">Ícono</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:4}}>
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} onClick={() => setForm(p => ({ ...p, icono: ic }))}
                      style={{width:38,height:38,borderRadius:9,border:`1.5px solid ${form.icono===ic?"var(--agua-d)":"var(--border)"}`,background:form.icono===ic?"var(--agua-p)":"none",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <label className="check-row" style={{marginTop:4}}>
                <input type="checkbox" checked={form.recurrente} onChange={e => setForm(p => ({ ...p, recurrente: e.target.checked }))} />
                Se repite cada mes
              </label>
            </div>
            <div className="modal-foot">
              {editId && <button className="btn-cancel" style={{borderColor:"#FBDCDC",color:"var(--red)"}} onClick={() => { eliminar(editId); setShowModal(false); }}>🗑</button>}
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-save" onClick={guardar}>{editId ? "Guardar" : "Añadir evento"} →</button>
            </div>
          </div>
        </div>
      )}

      <div className="app calendar-app">
        {/* SIDEBAR */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sb-brand">
            <div className="sb-ico">💎</div>
            <span className="sb-txt">Savia</span>
          </div>
          <nav className="sb-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`nav-item${activeNav===item.id?" active":""}`}
                onClick={() => handleNavClick(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <SidebarCards onManage={() => handleNavClick("dashboard")} />
          </nav>
          <div className="sb-footer">
            <div className="user-chip">
              <div className="user-av">{isGuest ? "JP" : "CN"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="user-nm">{isGuest ? "Juan Pérez" : "Cuenta nueva"}</div>
                <div className="user-pl">{isGuest ? "⭐ Premium" : "Plan gratuito"}</div>
              </div>
              {onLogout && <button className="logout-btn" title="Cerrar sesión" onClick={onLogout}>⏻</button>}
            </div>
          </div>
        </aside>

        <div className="main">
          {/* HEADER */}
          <header className="header">
            <div className="hd-left">
              <button className="hamburger" onClick={() => setSidebarOpen(v => !v)}>☰</button>
              <div className="hd-titles">
                <div className="hd-eye">Gestión financiera · {MESES[month]} {year}</div>
                <div className="hd-title">Calendario</div>
              </div>
            </div>
            <div className="hd-right">
              <button className="btn-ghost" title="Exportar">📥</button>
              <button className="btn-primary" onClick={() => openNew()}>
                <span>＋</span>
                <span className="label"> Nuevo evento</span>
              </button>
            </div>
          </header>

          <div className="content">

            {/* MONTH NAV */}
            <div className="month-nav">
              <div className="month-nav-left">
                <button className="month-btn" onClick={prevMonth}>‹</button>
                <button className="month-btn" onClick={nextMonth}>›</button>
                <span className="month-label">{MESES[month]}</span>
                <span className="month-year">{year}</span>
              </div>
              <div className="month-nav-right">
                <button className="today-btn" onClick={goToday}>Hoy</button>
                <div className="view-toggle">
                  {[["mes","Mes"],["semana","Semana"],["lista","Lista"]].map(([k,l]) => (
                    <button key={k} className={`vt-btn${view===k?" on":""}`} onClick={() => setView(k)}>{l}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* BALANCE STRIP */}
            <div className="balance-strip">
              <div className="bal-card accent">
                <span className="bal-ico">📊</span>
                <div>
                  <div className="bal-val" style={{color:balanceMes>=0?"white":"rgba(255,255,255,.9)"}}>{balanceMes>=0?"+":""}S/ {Math.abs(balanceMes).toFixed(0)}</div>
                  <div className="bal-lbl">Balance del mes</div>
                </div>
              </div>
              <div className="bal-card">
                <span className="bal-ico">💰</span>
                <div>
                  <div className="bal-val" style={{color:"var(--green)"}}>+S/ {ingresosMes.toFixed(0)}</div>
                  <div className="bal-lbl">Ingresos</div>
                </div>
              </div>
              <div className="bal-card">
                <span className="bal-ico">💳</span>
                <div>
                  <div className="bal-val" style={{color:"var(--red)"}}>-S/ {Math.abs(pagosMes).toFixed(0)}</div>
                  <div className="bal-lbl">Pagos</div>
                </div>
              </div>
              <div className="bal-card">
                <span className="bal-ico">🎯</span>
                <div>
                  <div className="bal-val" style={{color:"var(--agua-d)"}}>-S/ {Math.abs(metasMes).toFixed(0)}</div>
                  <div className="bal-lbl">Aportes metas</div>
                </div>
              </div>
            </div>

            {/* MAIN LAYOUT */}
            <div className="cal-layout">

              {/* ══ CALENDAR VIEWS ══ */}
              <div className="cal-card">

                {/* ── VIEW: MES ── */}
                {view === "mes" && (
                  <>
                    <div className="cal-head">
                      {DIAS_SEMANA_L.map((d, i) => (
                        <div key={i} className="cal-head-cell"
                          style={{display:"var(--show-long,block)"}}>
                          <span className="day-long">{d}</span>
                        </div>
                      ))}
                    </div>
                    <div className="cal-body">
                      {cells.map((cell, idx) => {
                        const isCur  = cell.month === "cur";
                        const isToday = isCur && cell.day === TODAY.getDate() && month === TODAY.getMonth() && year === TODAY.getFullYear();
                        const isSel  = isCur && cell.day === selected;
                        const evs    = isCur ? getEventosDay(cell.day) : [];
                        const dayBal = evs.reduce((a, e) => a + e.monto, 0);
                        const weekend = isWeekend(cells, idx);
                        return (
                          <div key={idx}
                            className={`cal-cell${!isCur?" other-month":""}${isToday?" today":""}${isSel?" selected":""}${weekend&&isCur?" weekend":""}`}
                            onClick={() => { if (isCur) { setSelected(cell.day); openNew(cell.day); } }}>
                            <div className="cal-day-num">{cell.day}</div>
                            {/* Desktop: pills */}
                            {evs.slice(0, 2).map(ev => (
                              <div key={ev.id} className="cal-event"
                                style={{background:ev.color+"22",color:ev.color}}
                                onClick={e => { e.stopPropagation(); openEdit(ev); }}>
                                {ev.icono} {ev.desc}
                              </div>
                            ))}
                            {evs.length > 2 && <div className="cal-more">+{evs.length-2} más</div>}
                            {/* Mobile: dots */}
                            <div className="cal-dots-row">
                              {evs.slice(0,4).map(ev => (
                                <span key={ev.id} className="cal-event-dot" style={{background:ev.color}} />
                              ))}
                            </div>
                            {/* Balance */}
                            {isCur && dayBal !== 0 && (
                              <div className={`cal-balance ${dayBal>0?"pos":"neg"}`}>
                                {dayBal>0?"+":""}{dayBal.toFixed(0)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* ── VIEW: SEMANA ── */}
                {view === "semana" && (
                  <div style={{overflowX:"auto"}}>
                    <div className="week-grid" style={{minWidth:420}}>
                      {/* Corner */}
                      <div style={{borderRight:"1px solid var(--border)",borderBottom:"1px solid var(--border)",padding:"8px 4px"}}/>
                      {weekStart.map((d, i) => {
                        const isT = d === TODAY.getDate() && month === TODAY.getMonth() && year === TODAY.getFullYear();
                        return (
                          <div key={i} className="week-day-header" onClick={() => setSelected(d)} style={{cursor:"pointer"}}>
                            <div className="week-day-name">{DIAS_SEMANA_S[i]}</div>
                            <div className={isT?"week-day-num today-num":"week-day-num"}>{d}</div>
                          </div>
                        );
                      })}
                      {/* Time slots */}
                      {["Todo el día","Mañana","Tarde","Noche"].map((t, ti) => (
                        <>
                          <div key={`t${ti}`} className="week-time">{t}</div>
                          {weekStart.map((d, di) => {
                            const evs = getEventosDay(d).filter((_, i) => {
                              if (ti === 0) return true;
                              return i % 4 === ti - 1;
                            }).slice(0, ti === 0 ? 10 : 2);
                            return (
                              <div key={`s${ti}-${di}`} className="week-slot"
                                onClick={() => { setSelected(d); openNew(d); }}>
                                {ti === 0 && evs.map(ev => (
                                  <div key={ev.id} className="week-event"
                                    style={{background:ev.color+"22",color:ev.color}}
                                    onClick={e => { e.stopPropagation(); openEdit(ev); }}>
                                    {ev.icono} {ev.desc.slice(0,14)}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── VIEW: LISTA ── */}
                {view === "lista" && (
                  <div className="list-view-wrap">
                    {listGroups.map(({ dia, evs }) => {
                      const dayBal = evs.reduce((a, e) => a + e.monto, 0);
                      const isToday = dia === TODAY.getDate() && month === TODAY.getMonth() && year === TODAY.getFullYear();
                      return (
                        <div className="list-group" key={dia}>
                          <div className="list-group-header">
                            <span>{isToday ? "🟢 Hoy · " : ""}{dia} de {MESES[month]}</span>
                            <span style={{color:dayBal>=0?"var(--green)":"var(--red)",fontWeight:600}}>
                              {dayBal>=0?"+":""}S/ {dayBal.toFixed(2)}
                            </span>
                          </div>
                          {evs.map(ev => (
                            <div key={ev.id} className="list-event" onClick={() => openEdit(ev)}>
                              <div className="list-ico" style={{background:ev.color+"22"}}>{ev.icono}</div>
                              <div className="list-info">
                                <div className="list-desc">{ev.desc}</div>
                                <div className="list-sub" style={{display:"flex",alignItems:"center",gap:5}}>
                                  <span style={{background:ev.color+"22",color:ev.color,fontSize:10,padding:"1px 6px",borderRadius:4,fontWeight:500}}>
                                    {ev.tipo==="ingreso"?"Ingreso":ev.tipo==="meta"?"Meta":"Pago"}
                                  </span>
                                  {ev.recurrente && <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:"var(--muted)"}}>🔁 Recurrente</span>}
                                </div>
                              </div>
                              <div className={`list-monto ${ev.monto>0?"pos":"neg"}`}>
                                {ev.monto>0?"+":"-"}S/ {Math.abs(ev.monto).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ══ RIGHT PANEL ══ */}
              <div className="right-panel">

                {/* SELECTED DAY */}
                <div className="side-card" style={{animationDelay:".15s"}}>
                  <div className="day-panel-date">
                    <div className="day-big-num">{selected}</div>
                    <div>
                      <div className="day-month">{MESES[month]} {year}</div>
                      <div className="day-day">{DIAS_SEMANA_L[new Date(year,month,selected).getDay()===0?6:new Date(year,month,selected).getDay()-1]}</div>
                      {selectedBalance !== 0 && (
                        <div className="day-balance" style={{color:selectedBalance>=0?"var(--green)":"var(--red)"}}>
                          {selectedBalance>=0?"+":""}S/ {Math.abs(selectedBalance).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="day-events">
                    {selectedEvs.length === 0 ? (
                      <div className="empty-day">
                        <div className="empty-day-ico">📭</div>
                        Sin eventos este día
                        <div style={{marginTop:10}}>
                          <button className="btn-primary" style={{fontSize:12,padding:"7px 14px"}} onClick={() => openNew()}>＋ Añadir</button>
                        </div>
                      </div>
                    ) : selectedEvs.map(ev => (
                      <div key={ev.id} className="day-event-item" onClick={() => openEdit(ev)}>
                        <div className="day-ev-ico" style={{background:ev.color+"22"}}>{ev.icono}</div>
                        <div className="day-ev-info">
                          <div className="day-ev-desc">{ev.desc}</div>
                          <div className="day-ev-sub">{ev.recurrente ? "🔁 Recurrente" : "Una vez"}</div>
                        </div>
                        <div className={`day-ev-monto`} style={{color:ev.monto>0?"var(--green)":"var(--red)"}}>
                          {ev.monto>0?"+":"-"}S/ {Math.abs(ev.monto).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedEvs.length > 0 && (
                    <div style={{padding:"10px 18px",borderTop:"1px solid var(--border)"}}>
                      <button className="btn-primary" style={{width:"100%",justifyContent:"center",fontSize:12,padding:"8px"}} onClick={() => openNew()}>
                        ＋ Añadir evento a este día
                      </button>
                    </div>
                  )}
                </div>

                {/* PRÓXIMOS EVENTOS */}
                <div className="side-card" style={{animationDelay:".22s"}}>
                  <div className="side-card-hd">
                    <div>
                      <div className="side-title">Próximos 10 días</div>
                      <div className="side-sub">Compromisos cercanos</div>
                    </div>
                  </div>
                  <div className="upcoming-list">
                    {upcoming.length === 0 ? (
                      <div style={{padding:"20px",textAlign:"center",color:"var(--muted)",fontSize:13}}>Sin eventos próximos</div>
                    ) : upcoming.map(ev => {
                      const diasRest = ev.dia - TODAY.getDate();
                      return (
                        <div key={ev.id} className="upcoming-item">
                          <div className="up-ico" style={{background:ev.color+"22"}}>{ev.icono}</div>
                          <div className="up-info">
                            <div className="up-desc">{ev.desc}</div>
                            <div className="up-date">Día {ev.dia} · {MESES[month].slice(0,3)}</div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                            <div className={`up-monto ${ev.monto>0?"pos":"neg"}`}>
                              {ev.monto>0?"+":"-"}S/ {Math.abs(ev.monto).toFixed(0)}
                            </div>
                            <span className={`days-badge ${diasRest<=2?"d-urgent":diasRest<=5?"d-soon":"d-ok"}`}>
                              {diasRest===0?"Hoy":diasRest===1?"Mañana":`en ${diasRest}d`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RESUMEN DEL MES */}
                <div className="side-card" style={{animationDelay:".28s"}}>
                  <div className="side-card-hd">
                    <div>
                      <div className="side-title">Resumen</div>
                      <div className="side-sub">{MESES[month]} {year}</div>
                    </div>
                  </div>
                  <div className="month-summary">
                    {[
                      { label:"Ingresos",  val:ingresosMes,          total:ingresosMes, color:"var(--green)" },
                      { label:"Pagos",     val:Math.abs(pagosMes),   total:ingresosMes, color:"var(--red)" },
                      { label:"Metas",     val:Math.abs(metasMes),   total:ingresosMes, color:"var(--agua-d)" },
                    ].map(({ label, val, total, color }) => (
                      <div key={label}>
                        <div className="ms-row">
                          <span style={{fontSize:13,color:"var(--slate-m)"}}>{label}</span>
                          <span style={{fontSize:13,fontWeight:500,color}}>{color==="var(--green)"||(val===ingresosMes)?"":"-"}S/ {val.toFixed(0)}</span>
                        </div>
                        <div className="ms-track">
                          <div className="ms-fill" style={{width:`${Math.min((val/total)*100,100)}%`,background:color}} />
                        </div>
                      </div>
                    ))}
                    <div style={{borderTop:"1px solid var(--border)",paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:13,fontWeight:500,color:"var(--slate-m)"}}>Balance neto</span>
                      <span style={{fontSize:15,fontWeight:600,fontFamily:"'DM Serif Display',serif",color:balanceMes>=0?"var(--green)":"var(--red)"}}>
                        {balanceMes>=0?"+":""}S/ {balanceMes.toFixed(2)}
                      </span>
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
