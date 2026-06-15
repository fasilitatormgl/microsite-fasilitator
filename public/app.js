const firebaseConfig = {
  apiKey: "AIzaSyDSnHojwSRgk71MPpOuvFlgwiGnv8GPuc4",
  authDomain: "gofasilitator.firebaseapp.com",
  projectId: "gofasilitator",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const slug = window.location.pathname.replace("/", "");

if (!slug || slug === "index.html") {
  app.innerHTML = "<h2>Microsite Fasilitator Ready</h2>";
} else {
  load(slug);
}

function load(slug){
  db.collection("microsites").doc(slug).get().then(doc=>{
    if(!doc.exists){
      app.innerHTML="Not Found";
      return;
    }

    const d = doc.data();

    let html = `<div class="glass">
    <h1>${d.title}</h1>
    <p>${d.description}</p>`;

    d.links.forEach(l=>{
      if(l.url.includes(window.location.origin)) return; // anti loop

      html += `
      <a class="btn" href="${l.url}" target="_blank"
      onclick="track('${slug}')">${l.name}</a>`;
    });

    html += `<canvas id="qr"></canvas></div>`;

    app.innerHTML = html;

    QRCode.toCanvas(document.getElementById("qr"),
      window.location.href
    );
  });
}

function track(slug){
  db.collection("clicks").add({
    slug: slug,
    time: new Date()
  });
}