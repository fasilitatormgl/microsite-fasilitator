/* =========================
   RENDER LINKS (Update tampilan list link di Form)
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
      <div class="bg-white/10 border border-white/5 rounded-xl p-3 flex justify-between items-center group">
        <div class="overflow-hidden pr-2">
          <div class="font-semibold text-sm truncate">${link.name}</div>
          <div class="text-xs opacity-60 truncate">${link.url}</div>
        </div>
        <div class="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="moveUp(${i})" class="p-1.5 hover:bg-white/20 rounded-lg text-gray-300" title="Ke atas"><i class='bx bx-up-arrow-alt'></i></button>
          <button onclick="moveDown(${i})" class="p-1.5 hover:bg-white/20 rounded-lg text-gray-300" title="Ke bawah"><i class='bx bx-down-arrow-alt'></i></button>
          <button onclick="editLink(${i})" class="p-1.5 hover:bg-sky-500/20 text-sky-400 rounded-lg" title="Edit"><i class='bx bx-edit'></i></button>
          <button onclick="removeLink(${i})" class="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg" title="Hapus"><i class='bx bx-trash'></i></button>
        </div>
      </div>
    `;
  });
  box.innerHTML = html;
}

/* =========================
   LOAD DATA (Update tampilan Card List Microsite)
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
            <button onclick="edit('${doc.id}')" class="flex justify-center py-2 bg-white/5 hover:bg-sky-500/20 hover:text-sky-400 rounded-lg transition-colors tooltip" title="Edit"><i class='bx bx-edit-alt text-lg'></i></button>
            <button onclick="stat('${doc.id}')" class="flex justify-center py-2 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 rounded-lg transition-colors tooltip" title="Statistik"><i class='bx bx-bar-chart-alt-2 text-lg'></i></button>
            <button onclick="share('${doc.id}')" class="flex justify-center py-2 bg-white/5 hover:bg-green-500/20 hover:text-green-400 rounded-lg transition-colors tooltip" title="Share"><i class='bx bx-share-alt text-lg'></i></button>
            <button onclick="showQR('${doc.id}')" class="flex justify-center py-2 bg-white/5 hover:bg-yellow-500/20 hover:text-yellow-400 rounded-lg transition-colors tooltip" title="QR Code"><i class='bx bx-qr text-lg'></i></button>
            <button onclick="hapus('${doc.id}')" class="flex justify-center py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors tooltip" title="Hapus"><i class='bx bx-trash text-lg'></i></button>
          </div>
        </div>
      `;
    });
    document.getElementById("list").innerHTML = html;
  });
}
