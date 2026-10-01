(function(){
"use strict";

/* ===== Branding placeholders — remplacer dès que les vraies infos arrivent ===== */
var BRAND = {
  companyName: "FB Logistics",
  tagline: "Sourcing, achats, import-export et coordination logistique — un seul interlocuteur pour sécuriser vos approvisionnements entre l'Europe, l'Afrique et l'Asie.",
  email: "[email@à-definir.be]",
  phone: "[+32 000 00 00 00]",
  address: "[Adresse à définir]"
};

/* URL du Google Sheet publié en CSV (Fichier > Partager > Publier sur le web > format CSV).
   Colonnes attendues : tracking_number, status, last_update
   Tant que ce placeholder n'est pas remplacé, le suivi affiche un message d'indisponibilité. */
var TRACKING_SHEET_CSV_URL = "PLACEHOLDER_TRACKING_CSV_URL";

function esc(str){
  var d = document.createElement('div'); d.textContent = str == null ? '' : str; return d.innerHTML;
}

/* ===== Icônes (pictogrammes ligne, pas d'emoji) ===== */
var ICON_DEFS = {
  search: { label:'Sourcing', svg:'<circle cx="10" cy="10" r="7"/><path d="M15 15l6 6"/>' },
  clipboard: { label:'Achats', svg:'<rect x="5" y="3" width="14" height="19" rx="1.5"/><path d="M9 3V2.5a1 1 0 011-1h4a1 1 0 011 1V3"/><path d="M8.5 13l2.5 2.5L16 10"/>' },
  globe: { label:'Import-export', svg:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 3 15 0 18"/><path d="M12 3c-3 3-3 15 0 18"/>' },
  link: { label:'Intermédiation', svg:'<path d="M8 13a4 4 0 010-5.5l2-2a4 4 0 015.5 5.5l-1 1"/><path d="M16 11a4 4 0 010 5.5l-2 2a4 4 0 01-5.5-5.5l1-1"/>' },
  chart: { label:'Conseil', svg:'<path d="M4 20V10M10 20V4M16 20v-7M22 20v-3"/>' },
  truck: { label:'Transport', svg:'<rect x="1" y="7" width="13" height="9" rx="1"/><path d="M14 10h4l4 3v3h-8"/><circle cx="6" cy="18.5" r="1.8"/><circle cx="17.5" cy="18.5" r="1.8"/>' }
};
function iconSvg(key, cls){
  var d = ICON_DEFS[key] || ICON_DEFS.clipboard;
  return '<svg class="'+(cls||'svc-icon')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d.svg+'</svg>';
}
(function populateIconSelect(){
  var sel = document.getElementById('s-icon');
  if(!sel) return;
  sel.innerHTML = Object.keys(ICON_DEFS).map(function(k){
    return '<option value="'+k+'">'+esc(ICON_DEFS[k].label)+'</option>';
  }).join('');
})();

/* ===== Branding bind ===== */
document.querySelectorAll('[data-bind]').forEach(function(el){
  var key = el.dataset.bind;
  if(BRAND[key] !== undefined) el.textContent = BRAND[key];
});

/* ===== Nav active state ===== */
(function(){
  var page = document.body.dataset.page;
  document.querySelectorAll('nav.links a[data-nav]').forEach(function(a){
    if(a.dataset.nav === page) a.classList.add('active');
  });
})();

/* ===== Menu mobile ===== */
(function(){
  var toggle = document.getElementById('navToggle');
  var links = document.querySelector('nav.links');
  if(!toggle || !links) return;
  toggle.addEventListener('click', function(){
    var open = links.classList.toggle('show');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ links.classList.remove('show'); toggle.setAttribute('aria-expanded', 'false'); });
  });
})();

/* ===== Photo slot placeholders ===== */
function wirePhotoSlots(root){
  (root || document).querySelectorAll('img.ph-slot').forEach(function(img){
    if(img.dataset.wired) return;
    img.dataset.wired = '1';
    function fail(){
      var label = img.dataset.label || 'Photo à ajouter';
      var fallback = document.createElement('div');
      fallback.className = 'ph-fallback';
      fallback.innerHTML = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5.5-5.5a1 1 0 00-1.4 0L7 18"/></svg><span>'+esc(label)+'</span>';
      if(img.parentElement) img.replaceWith(fallback);
    }
    /* L'image peut avoir déjà échoué (404) avant que ce script ne s'exécute
       (le navigateur charge les <img> dès le parsing HTML, avant le script
       placé en fin de <body>) — on vérifie l'état déjà résolu en plus
       d'écouter un échec futur. */
    if(img.complete && img.naturalWidth === 0){ fail(); }
    else { img.addEventListener('error', fail, { once:true }); }
  });
}
wirePhotoSlots();

/* ===== Storage helper ===== */
var DB = {
  get: function(k, fallback){
    try{ var v = localStorage.getItem('fb_' + k); return v ? JSON.parse(v) : fallback; }
    catch(e){ return fallback; }
  },
  set: function(k, v){
    try{ localStorage.setItem('fb_' + k, JSON.stringify(v)); return true; }
    catch(e){ return false; }
  }
};

/* ===== Default services (placeholders — à remplacer par la vraie offre) ===== */
var DEFAULT_SERVICES = [
  { id:'s1', icon:'search', title:'Sourcing international', desc:"Recherche et sélection de fournisseurs adaptés à votre besoin, en Europe, en Afrique et en Asie." },
  { id:'s2', icon:'clipboard', title:'Approvisionnement & achats', desc:"Négociation, passation des commandes et suivi des achats jusqu'à réception." },
  { id:'s3', icon:'globe', title:'Import-export', desc:"Accompagnement dans les opérations commerciales internationales, de l'origine à la destination." },
  { id:'s4', icon:'link', title:'Intermédiation commerciale', desc:"Mise en relation entre acheteurs et vendeurs, apport d'affaires et négociation." },
  { id:'s5', icon:'chart', title:'Conseil logistique', desc:"Optimisation des flux et coordination des prestataires pour votre chaîne d'approvisionnement." },
  { id:'s6', icon:'truck', title:'Solutions de transport', desc:"Recherche et coordination de solutions de transport avec nos partenaires — FB Logistics intervient comme intermédiaire, pas comme transporteur direct." }
];
function getServices(){ return DB.get('services', DEFAULT_SERVICES); }

function manifestRow(s, i){
  return '<div class="m-row">'+
    '<div class="thumb"><img class="ph-slot" data-label="Photo — '+esc(s.title)+'" src="images/service-'+(i+1)+'.jpg" alt=""></div>'+
    '<div><div class="icon">'+iconSvg(s.icon)+'</div><h3>'+esc(s.title)+'</h3></div>'+
    '<p>'+esc(s.desc)+'</p>'+
    '<div class="m-detail"><div class="m-detail-inner"><p>'+esc(s.detail || 'Texte détaillé à ajouter.')+'</p></div></div>'+
    '</div>';
}
function renderServices(){
  var el = document.getElementById('servicesList');
  if(!el) return;
  var list = getServices();
  el.innerHTML = list.map(manifestRow).join('');
  wirePhotoSlots(el);
  el.querySelectorAll('.m-row').forEach(function(row){
    row.addEventListener('click', function(){ row.classList.toggle('open'); });
  });
}
function renderServicesPreview(){
  var el = document.getElementById('svcPreview');
  if(!el) return;
  var list = getServices().slice(0,3);
  el.innerHTML = list.map(function(s){
    return '<a href="services.html"><div class="icon">'+iconSvg(s.icon)+'</div><h3>'+esc(s.title)+'</h3><p>'+esc(s.desc)+'</p></a>';
  }).join('');
}
renderServices();
renderServicesPreview();

/* ===== Admin: auth ===== */
function sha256(str){
  var enc = new TextEncoder().encode(str);
  return crypto.subtle.digest('SHA-256', enc).then(function(buf){
    return Array.from(new Uint8Array(buf)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
  });
}
var DEFAULT_PWD = 'FB2026';

function checkRateLimit(){
  var lock = DB.get('login_lock', 0);
  return Date.now() < lock ? Math.ceil((lock - Date.now())/60000) : 0;
}
function recordAttempt(ok){
  if(ok){ DB.set('login_attempts', 0); DB.set('login_lock', 0); return; }
  var n = DB.get('login_attempts', 0) + 1;
  DB.set('login_attempts', n);
  if(n >= 5){ DB.set('login_lock', Date.now() + 15*60000); DB.set('login_attempts', 0); }
}

var adminOverlay = document.getElementById('adminOverlay');
if(adminOverlay){
  var openAdminBtn = document.getElementById('openAdmin');
  var closeAdminBtn = document.getElementById('closeAdmin');
  if(openAdminBtn) openAdminBtn.addEventListener('click', function(){ adminOverlay.classList.add('show'); });
  if(closeAdminBtn) closeAdminBtn.addEventListener('click', function(){ adminOverlay.classList.remove('show'); });
  adminOverlay.addEventListener('click', function(e){ if(e.target === adminOverlay) adminOverlay.classList.remove('show'); });

  var loginBtn = document.getElementById('loginBtn');
  if(loginBtn) loginBtn.addEventListener('click', function(){
    var msg = document.getElementById('loginMsg');
    msg.className = 'admin-msg'; msg.textContent = '';
    var waitMin = checkRateLimit();
    if(waitMin > 0){
      msg.className = 'admin-msg err';
      msg.textContent = 'Trop de tentatives. Réessayez dans ' + waitMin + ' min.';
      return;
    }
    var pwd = document.getElementById('pwdInput').value;
    sha256(pwd).then(function(hash){
      var stored = DB.get('pwd_hash', null);
      if(stored === null){
        return sha256(DEFAULT_PWD).then(function(defaultHash){
          var valid = (hash === defaultHash);
          if(valid) DB.set('pwd_hash', defaultHash);
          finishLogin(valid, msg);
        });
      }
      finishLogin(hash === stored, msg);
    });
  });

  function finishLogin(valid, msg){
    recordAttempt(valid);
    if(valid){
      document.getElementById('adminLoginView').style.display = 'none';
      document.getElementById('adminDashView').style.display = 'block';
      renderAdminServices();
    } else {
      msg.className = 'admin-msg err';
      msg.textContent = 'Mot de passe incorrect.';
    }
  }

  /* Tabs */
  document.querySelectorAll('.tab').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.tab').forEach(function(b){ b.classList.remove('active'); });
      document.querySelectorAll('.tabpane').forEach(function(p){ p.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelector('.tabpane[data-pane="'+btn.dataset.tab+'"]').classList.add('active');
    });
  });

  /* Services CRUD */
  function renderAdminServices(){
    var list = getServices();
    var el = document.getElementById('svcListAdmin');
    el.innerHTML = list.map(function(s){
      var iconLabel = (ICON_DEFS[s.icon] || ICON_DEFS.clipboard).label;
      return '<div class="svc-item"><div class="meta"><strong>'+esc(s.title)+'</strong><p>'+esc(iconLabel)+' — '+esc(s.desc)+'</p></div>'+
        '<div class="acts"><button data-edit="'+s.id+'">Éditer</button><button data-del="'+s.id+'">Suppr.</button></div></div>';
    }).join('');
    el.querySelectorAll('[data-edit]').forEach(function(b){ b.addEventListener('click', function(){ editService(b.dataset.edit); }); });
    el.querySelectorAll('[data-del]').forEach(function(b){ b.addEventListener('click', function(){ delService(b.dataset.del); }); });
  }
  function editService(id){
    var s = getServices().find(function(x){ return x.id === id; });
    if(!s) return;
    document.getElementById('s-icon').value = s.icon;
    document.getElementById('s-title').value = s.title;
    document.getElementById('s-desc').value = s.desc;
    document.getElementById('s-editid').value = s.id;
    document.getElementById('s-save').textContent = 'Enregistrer';
    document.getElementById('s-cancel').style.display = 'inline-flex';
  }
  function delService(id){
    var list = getServices().filter(function(x){ return x.id !== id; });
    DB.set('services', list);
    renderAdminServices(); renderServices(); renderServicesPreview();
  }
  function resetSvcForm(){
    document.getElementById('s-icon').selectedIndex = 0;
    document.getElementById('s-title').value = '';
    document.getElementById('s-desc').value = '';
    document.getElementById('s-editid').value = '';
    document.getElementById('s-save').textContent = 'Ajouter le service';
    document.getElementById('s-cancel').style.display = 'none';
  }
  var sCancel = document.getElementById('s-cancel');
  if(sCancel) sCancel.addEventListener('click', resetSvcForm);
  var sSave = document.getElementById('s-save');
  if(sSave) sSave.addEventListener('click', function(){
    var title = document.getElementById('s-title').value.trim();
    var desc = document.getElementById('s-desc').value.trim();
    var icon = document.getElementById('s-icon').value || 'clipboard';
    if(!title || !desc) return;
    var editId = document.getElementById('s-editid').value;
    var list = getServices();
    if(editId){
      list = list.map(function(s){ return s.id === editId ? {id:editId, icon:icon, title:title, desc:desc} : s; });
    } else {
      list.push({ id:'s' + Date.now(), icon:icon, title:title, desc:desc });
    }
    DB.set('services', list);
    renderAdminServices(); renderServices(); renderServicesPreview(); resetSvcForm();
  });

  /* Password change */
  var npSave = document.getElementById('np-save');
  if(npSave) npSave.addEventListener('click', function(){
    var msg = document.getElementById('settingsMsg');
    var p1 = document.getElementById('np1').value, p2 = document.getElementById('np2').value;
    if(p1.length < 6){ msg.className='admin-msg err'; msg.textContent='6 caractères minimum.'; return; }
    if(p1 !== p2){ msg.className='admin-msg err'; msg.textContent='Les mots de passe ne correspondent pas.'; return; }
    sha256(p1).then(function(hash){
      DB.set('pwd_hash', hash);
      msg.className='admin-msg ok'; msg.textContent='Mot de passe mis à jour.';
      document.getElementById('np1').value=''; document.getElementById('np2').value='';
    });
  });
}

/* ===== Netlify forms (contact + devis) ===== */
function wireForm(formId, msgId){
  var form = document.getElementById(formId);
  if(!form) return;
  var msg = document.getElementById(msgId);
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var data = new FormData(form);
    fetch('/', { method:'POST', body: data })
      .then(function(){
        msg.className = 'form-msg ok';
        msg.textContent = 'Message envoyé. Nous revenons vers vous rapidement.';
        form.reset();
      })
      .catch(function(){
        msg.className = 'form-msg err';
        msg.textContent = "Échec de l'envoi. Réessayez ou écrivez-nous directement par email.";
      });
  });
}
wireForm('contactForm', 'contactMsg');
wireForm('devisForm', 'devisMsg');

/* ===== Tracking lookup ===== */
function parseCSV(text){
  var rows = [], row = [], field = '', inQuotes = false;
  for(var i=0; i<text.length; i++){
    var c = text[i];
    if(inQuotes){
      if(c === '"'){
        if(text[i+1] === '"'){ field += '"'; i++; } else { inQuotes = false; }
      } else { field += c; }
    } else {
      if(c === '"'){ inQuotes = true; }
      else if(c === ','){ row.push(field); field=''; }
      else if(c === '\n' || c === '\r'){
        if(c === '\r' && text[i+1] === '\n') i++;
        row.push(field); rows.push(row); row=[]; field='';
      } else { field += c; }
    }
  }
  if(field.length || row.length){ row.push(field); rows.push(row); }
  return rows.filter(function(r){ return r.length > 1 || r[0] !== ''; });
}
function stageFromStatus(status){
  var s = (status||'').toLowerCase();
  if(s.indexOf('livr') !== -1) return 'livre';
  if(s.indexOf('transit') !== -1 || s.indexOf('cours') !== -1) return 'transit';
  return 'recu';
}
var STAGE_ORDER = ['recu','transit','livre'];

var trackForm = document.getElementById('trackForm');
if(trackForm){
  trackForm.addEventListener('submit', function(e){
    e.preventDefault();
    var code = document.getElementById('trackInput').value.trim();
    var errEl = document.getElementById('trackError');
    var resEl = document.getElementById('trackResult');
    errEl.classList.remove('show'); resEl.classList.remove('show');
    if(!code) return;

    if(!TRACKING_SHEET_CSV_URL || TRACKING_SHEET_CSV_URL.indexOf('PLACEHOLDER') === 0){
      errEl.textContent = "Le suivi de dossier n'est pas encore configuré. Contactez-nous directement pour connaître l'état de votre dossier.";
      errEl.classList.add('show');
      return;
    }

    fetch(TRACKING_SHEET_CSV_URL)
      .then(function(r){ if(!r.ok) throw new Error('fetch failed'); return r.text(); })
      .then(function(text){
        var rows = parseCSV(text);
        if(!rows.length) throw new Error('empty');
        var header = rows[0].map(function(h){ return h.trim().toLowerCase(); });
        var idxNum = header.indexOf('tracking_number');
        var idxStatus = header.indexOf('status');
        var idxDate = header.indexOf('last_update');
        var match = null;
        for(var i=1; i<rows.length; i++){
          if((rows[i][idxNum]||'').trim().toLowerCase() === code.toLowerCase()){ match = rows[i]; break; }
        }
        if(!match){
          errEl.textContent = "Aucun dossier trouvé pour cette référence. Vérifiez la référence saisie.";
          errEl.classList.add('show');
          return;
        }
        var status = match[idxStatus] || '';
        var date = match[idxDate] || '';
        var stage = stageFromStatus(status);
        var stageIdx = STAGE_ORDER.indexOf(stage);

        document.getElementById('trackCode').textContent = code.toUpperCase();
        document.querySelectorAll('#trackStages .stage').forEach(function(el){
          var i = STAGE_ORDER.indexOf(el.dataset.stage);
          el.classList.toggle('done', i <= stageIdx);
        });
        document.getElementById('trackBar').style.width = (stageIdx/(STAGE_ORDER.length-1)*100) + '%';
        document.getElementById('trackMeta').textContent = 'Statut : ' + status + (date ? ' — mis à jour le ' + date : '');
        resEl.classList.add('show');
      })
      .catch(function(){
        errEl.textContent = "Impossible de récupérer le statut pour le moment. Réessayez plus tard.";
        errEl.classList.add('show');
      });
  });
}

})();
