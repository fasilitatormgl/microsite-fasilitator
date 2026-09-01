const firebaseConfig = {
  apiKey: "AIzaSyDSnHojwSRgk71MPpOuvFlgwiGnv8GPuc4",
  authDomain: "gofasilitator.firebaseapp.com",
  projectId: "gofasilitator",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

/* =========================
   LOGIN PROTECT
========================= */
firebase.auth().onAuthStateChanged(user => {
  const loading = document.getElementById("loadingScreen");
  if (!user) {
    if (loading) loading.style.display = "flex";
    window.location.replace("login.html");
  } else {
    if (loading) loading.style.display = "none";
    loadData();
  }
});

/* =========================
   GLOBAL VARIABLES
========================= */
let links = [];
let editIndex = null;
let currentQR = "";

/* =========================
   MODAL LINK
========================= */
function addLink() {
  editIndex = null;
  document.getElementById("linkName").value = "";
  document.getElementById("linkUrl").value = "";
  document.getElementById("linkCategory").value = "Dokumen";
  document.getElementById("modalLink").classList.remove("hidden");
}

function editLink(i) {
  editIndex = i;
  document.getElementById("linkName").value = links[i].name;
  document.getElementById("linkUrl").value = links[i].url;
  document.getElementById("linkCategory").value = links[i].category || "Dokumen";
  document.getElementById("modalLink").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modalLink").classList.add("hidden");
}

function saveLink() {
  const name = document.getElementById("linkName").value.trim();
  const url = document.getElementById("linkUrl").value.trim();
  const category = document.getElementById("linkCategory").value;

  if (!name || !url) {
    alert("Nama dan URL wajib diisi.");
    return;
  }
  
  const item = { name, url, category };
  if (editIndex !== null) {
    links[editIndex] = item;
  } else {
    links.push(item);
  }
  renderLinks();
  closeModal();
}

/* =========================
   RENDER LINKS
========================= */
function renderLinks() {
  const box = document.getElementById("links");
  if (!links.length) {
    box.innerHTML = `<div class="text-sm opacity-50 text-center py-4">Belum ada link ditambahkan</div>`;
    return;
  }

  let html = "";
  links.forEach((link, i) => {
    html += `
      <div class="bg-white/10 border border-white/5 rounded-xl p-3 flex justify-between items-center group mb-2">
        <div class="overflow-hidden pr-2">
          <div class="font-semibold text-sm truncate">${link.name}</div>
          <div class="text-xs opacity-60 truncate">${link.url}</div>
        </div>
        <div class="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onclick="moveUp(${i})" class="p-1.5 hover:bg-white/20 rounded-lg text-gray-300" title="Naik"><i class='bx bx-up-arrow-alt'></i></button>
          <button type="button" onclick="moveDown(${i})" class="p-1.5 hover:bg-white/20 rounded-lg text-gray-300" title="Turun"><i class='bx bx-down-arrow-alt'></i></button>
          <button type="button" onclick="editLink(${i})" class="p-1.5 hover:bg-sky-500/20 text-sky-400 rounded-lg" title="Edit"><i class='bx bx-edit'></i></button>
          <button type="button" onclick="removeLink(${i})" class="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg" title="Hapus"><i class='bx bx-trash'></i></button>
        </div>
      </div>
    `;
  });
  box.innerHTML = html;
}

function removeLink(i) {
  if (confirm("Hapus link ini?")) {
    links.splice(i, 1);
    renderLinks();
  }
}

function moveUp(i) {
  if (i > 0) {
    [links[i], links[i - 1]] = [links[i - 1], links[i]];
    renderLinks();
  }
}

function moveDown(i) {
  if (i < links.length - 1) {
    [links[i], links[i + 1]] = [links[i + 1], links[i]];
    renderLinks();
  }
}

/* =========================
   SAVE MICROSITE
========================= */
function save() {
  const slugVal = document.getElementById("slug").value.trim().toLowerCase();
  const titleVal = document.getElementById("title").value.trim();
  const descVal = document.getElementById("desc").value.trim();
  const catVal = document.getElementById("micrositeCategory").value;

  if (!slugVal || !titleVal) {
    alert("Slug & Title wajib diisi.");
    return;
  }

  db.collection("microsites").doc(slugVal).set({
    title: titleVal,
    description: descVal,
    category: catVal,
    links: links
  }).then(() => {
    alert("Microsite tersimpan.");
    resetForm();
    loadData();
  }).catch(err => {
    alert("Gagal menyimpan: " + err.message);
  });
}

/* =========================
   LOAD DATA & LIST
========================= */
function loadData() {
  db.collection("microsites").get().then(snapshot => {
    let html = "";
    snapshot.forEach(doc => {
      const d = doc.data();
      const cat = d.category || "Lainnya";

      html += `
        <div class="glass-card p-5 transition-transform hover:-translate-y-1" data-category="${cat}">
          <div class="flex justify-between items-start mb-2">
            <span class="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-md font-semibold border border-indigo-500/20">${cat}</span>
            <div class="text-xs font-mono opacity-50"><i class='bx bx-link'></i> ${d.links?.length || 0} Tautan</div>
          </div>
          
          <h3 class="font-bold text-lg mb-1 mt-3 truncate">${d.title}</h3>
          <p class="text-sm opacity-60 truncate mb-4">/${doc.id}</p>
          
          <div class="grid grid-cols-5 gap-2 border-t border-white/10 pt-4 mt-2">
            <button onclick="edit('${doc.id}')" class="flex justify-center py-2 bg-white/5 hover:bg-sky-500/20 hover:text-sky-400 rounded-lg transition-colors" title="Edit"><i class='bx bx-edit-alt text-lg'></i></button>
            <button onclick="stat('${doc.id}')" class="flex justify-center py-2 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 rounded-lg transition-colors" title="Statistik"><i class='bx bx-bar-chart-alt-2 text-lg'></i></button>
            <button onclick="share('${doc.id}')" class="flex justify-center py-2 bg-white/5 hover:bg-green-500/20 hover:text-green-400 rounded-lg transition-colors" title="Share"><i class='bx bx-share-alt text-lg'></i></button>
            <button onclick="showQR('${doc.id}')" class="flex justify-center py-2 bg-white/5 hover:bg-yellow-500/20 hover:text-yellow-400 rounded-lg transition-colors" title="QR Code"><i class='bx bx-qr text-lg'></i></button>
            <button onclick="hapus('${doc.id}')" class="flex justify-center py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors" title="Hapus"><i class='bx bx-trash text-lg'></i></button>
          </div>
        </div>
      `;
    });
    document.getElementById("list").innerHTML = html || `<div class="col-span-2 text-center opacity-50 py-8">Belum ada data microsite</div>`;
  });
}

function edit(id) {
  db.collection("microsites").doc(id).get().then(doc => {
    const d = doc.data();
    document.getElementById("slug").value = id;
    document.getElementById("title").value = d.title || "";
    document.getElementById("desc").value = d.description || "";
    document.getElementById("micrositeCategory").value = d.category || "OPD";
    links = d.links || [];
    renderLinks();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function hapus(id) {
  if (confirm("Hapus microsite ini?")) {
    db.collection("microsites").doc(id).delete().then(() => loadData());
  }
}

function stat(slugVal) {
  db.collection("clicks").where("slug", "==", slugVal).get().then(snap => {
    alert("Total klik: " + snap.size);
  });
}

function share(slugVal) {
  const url = location.origin + "/" + slugVal;
  const text = `🚀 Akses link ${slugVal} melalui tautan berikut:\n\n${url}`;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => alert("Link berhasil disalin ke clipboard!\n\n" + text))
      .catch(() => prompt("Copy link manual:", text));
  } else {
    prompt("Copy link manual:", text);
  }
}

function resetForm() {
  document.getElementById("slug").value = "";
  document.getElementById("title").value = "";
  document.getElementById("desc").value = "";
  document.getElementById("micrositeCategory").value = "OPD";
  links = [];
  renderLinks();
}

/* =========================
   QR CODE (ADMIN)
========================= */
function showQR(slugVal) {
  const url = location.origin + "/" + slugVal;
  currentQR = url;

  const qrcodeContainer = document.getElementById("qrcode");
  qrcodeContainer.innerHTML = "";

  new QRCode(qrcodeContainer, {
    text: url,
    width: 180,
    height: 180,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  const qrModal = document.getElementById("qrModal");
  if (qrModal) qrModal.classList.remove("hidden");
}

function closeQR() {
  const qrModal = document.getElementById("qrModal");
  if (qrModal) qrModal.classList.add("hidden");
}

function downloadQR() {
  const qrcodeContainer = document.getElementById("qrcode");
  if (!qrcodeContainer) return alert("QR Code belum siap.");

  const img = qrcodeContainer.querySelector("img");
  const canvas = qrcodeContainer.querySelector("canvas");

  let imageSrc = "";
  if (img && img.src) {
    imageSrc = img.src;
  } else if (canvas) {
    imageSrc = canvas.toDataURL("image/png");
  }

  if (!imageSrc) {
    alert("Gagal mengambil gambar QR Code.");
    return;
  }

  const slugName = currentQR.split("/").pop() || "microsite";
  const link = document.createElement("a");
  link.href = imageSrc;
  link.download = `QR-${slugName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
