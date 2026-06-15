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
   LOADING
========================= */
window.addEventListener("load", () => {
  const loading = document.getElementById("loadingScreen");
  if (loading) loading.style.display = "none";
});

/* =========================
   LOGIN PROTECT
========================= */
firebase.auth().onAuthStateChanged(user => {
  const loading = document.getElementById("loadingScreen");

  if (!user) {
    if (loading) loading.style.display = "flex";
    location.href = "login.html";
  } else {
    if (loading) loading.style.display = "none";
  }
});

/* =========================
   GLOBAL
========================= */
let links = [];
let editIndex = null;
let currentQR = "";

/* =========================
   MODAL LINK
========================= */
function addLink() {
  editIndex = null;

  linkName.value = "";
  linkUrl.value = "";
  linkCategory.value = "Dokumen";

  modalLink.classList.remove("hidden");

  setTimeout(() => {
    linkName.focus();
  }, 150);
}

function editLink(i) {
  editIndex = i;

  linkName.value = links[i].name;
  linkUrl.value = links[i].url;
  linkCategory.value = links[i].category || "Dokumen";

  modalLink.classList.remove("hidden");
}

function closeModal() {
  modalLink.classList.add("hidden");
}

function saveLink() {
  const name = linkName.value.trim();
  const url = linkUrl.value.trim();
  const category = linkCategory.value;

  if (!name || !url) {
    alert("Nama dan URL wajib diisi.");
    return;
  }

  const item = {
    name,
    url,
    category
  };

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
    box.innerHTML = `
      <div class="text-sm opacity-50">
        Belum ada link
      </div>
    `;
    return;
  }

  let groups = {};

  links.forEach((link, index) => {
    const cat = link.category || "Lainnya";

    if (!groups[cat]) {
      groups[cat] = [];
    }

    groups[cat].push({
      ...link,
      originalIndex: index
    });
  });

  let html = "";

  for (let category in groups) {
    html += `
      <div class="mb-4">
        <div class="text-cyan-300 font-semibold mb-2">
          📁 ${category}
        </div>
    `;

    groups[category].forEach(link => {
      const i = link.originalIndex;

      html += `
        <div class="glass rounded-lg p-3 mb-2">

          <div class="font-semibold">
            ${link.name}
          </div>

          <div class="text-xs opacity-60 truncate mb-2">
            ${link.url}
          </div>

          <div class="flex gap-2 flex-wrap">
            <button onclick="editLink(${i})">✏️</button>
            <button onclick="removeLink(${i})">🗑️</button>
            <button onclick="moveUp(${i})">⬆️</button>
            <button onclick="moveDown(${i})">⬇️</button>
          </div>

        </div>
      `;
    });

    html += `</div>`;
  }

  box.innerHTML = html;
}

function removeLink(i) {
  if (!confirm("Hapus link?")) return;

  links.splice(i, 1);
  renderLinks();
}

function moveUp(i) {
  if (i === 0) return;

  [links[i], links[i - 1]] = [links[i - 1], links[i]];
  renderLinks();
}

function moveDown(i) {
  if (i === links.length - 1) return;

  [links[i], links[i + 1]] = [links[i + 1], links[i]];
  renderLinks();
}

/* =========================
   SAVE MICROSITE
========================= */
function save() {
  const slugVal = slug.value.trim().toLowerCase();

  if (!slugVal || !title.value.trim()) {
    alert("Slug & Title wajib.");
    return;
  }

  db.collection("microsites")
    .doc(slugVal)
    .set({
      title: title.value.trim(),
      description: desc.value.trim(),
      category: micrositeCategory.value,
      links: links
    })
    .then(() => {
      alert("Microsite tersimpan.");

      resetForm();
      loadData();
    });
}

/* =========================
   LOAD DATA
========================= */
function loadData() {
  db.collection("microsites")
    .get()
    .then(snapshot => {

      let groups = {};

      snapshot.forEach(doc => {
        const d = doc.data();
        const cat = d.category || "Lainnya";

        if (!groups[cat]) {
          groups[cat] = [];
        }

        groups[cat].push({
          id: doc.id,
          ...d
        });
      });

      let html = "";

      for (let category in groups) {

        html += `
          <div class="md:col-span-2">
            <h3 class="text-cyan-300 font-bold text-lg mb-3">
              📁 ${category}
            </h3>
          </div>
        `;

        groups[category].forEach(item => {
          html += `
            <div class="glass p-4 rounded-xl">

              <h3 class="font-bold">
                ${item.id}
              </h3>

              <p class="opacity-80">
                ${item.title}
              </p>

              <div class="text-xs opacity-60 mb-3">
                ${item.links?.length || 0} link
              </div>

              <div class="flex gap-2 flex-wrap">
                <button onclick="edit('${item.id}')">✏️</button>
                <button onclick="hapus('${item.id}')">🗑️</button>
                <button onclick="stat('${item.id}')">📊</button>
                <button onclick="share('${item.id}')">🔗</button>
                <button onclick="showQR('${item.id}')">📱</button>
              </div>

            </div>
          `;
        });
      }

      list.innerHTML = html;
    });
}

/* =========================
   EDIT
========================= */
function edit(id) {
  db.collection("microsites")
    .doc(id)
    .get()
    .then(doc => {
      const d = doc.data();

      slug.value = id;
      title.value = d.title;
      desc.value = d.description;

      micrositeCategory.value =
        d.category || "Kelurahan";

      links = d.links || [];

      renderLinks();

      history.replaceState(
        null,
        "",
        "?edit=" + id
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
}

/* =========================
   DELETE
========================= */
function hapus(id) {
  if (!confirm("Hapus microsite?")) return;

  db.collection("microsites")
    .doc(id)
    .delete()
    .then(() => {
      loadData();
    });
}

/* =========================
   STAT
========================= */
function stat(slugVal) {
  db.collection("clicks")
    .where("slug", "==", slugVal)
    .get()
    .then(snap => {
      alert(
        "Total klik: " + snap.size
      );
    });
}

/* =========================
   SHARE
========================= */
function share(slugVal) {
  const url =
    location.origin + "/" + slugVal;

  const text =
`Akses link ${slugVal}
melalui tautan berikut:

${url}`;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("Link siap dibagikan:\n\n" + text);
    })
    .catch(() => {
      prompt("Copy link:", text);
    });
}

/* =========================
   RESET
========================= */
function resetForm() {
  slug.value = "";
  title.value = "";
  desc.value = "";

  micrositeCategory.value =
    "Kelurahan";

  links = [];
  renderLinks();
}

/* =========================
   QR
========================= */
function showQR(slugVal) {
  const url =
    location.origin + "/" + slugVal;

  currentQR = url;

  document.getElementById(
    "qrcode"
  ).innerHTML = "";

  new QRCode(
    document.getElementById(
      "qrcode"
    ),
    {
      text: url,
      width: 200,
      height: 200
    }
  );

  document
    .getElementById("qrModal")
    .classList.remove("hidden");
}

function closeQR() {
  document
    .getElementById("qrModal")
    .classList.add("hidden");
}

function downloadQR() {
  const img =
    document.querySelector(
      "#qrcode img"
    );

  if (!img) {
    alert("QR belum siap.");
    return;
  }

  const link =
    document.createElement("a");

  link.href = img.src;

  link.download =
    "QR-" +
    currentQR
      .split("/")
      .pop() +
    ".png";

  link.click();
}

/* =========================
   AUTO LOAD
========================= */
window.addEventListener(
  "DOMContentLoaded",
  () => {
    loadData();

    const params =
      new URLSearchParams(
        location.search
      );

    const editId =
      params.get("edit");

    if (editId) {
      edit(editId);
    }
  }
);