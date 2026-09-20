const dateInput = document.getElementById("dateInput");
const activityInput = document.getElementById("activityInput");
const startTimeInput = document.getElementById("startTimeInput");
const endTimeInput = document.getElementById("endTimeInput");
const form = document.getElementById("agendaForm");
const listContainer = document.getElementById("activityList");
const emptyState = document.getElementById("emptyState");
const mainBtnText = document.querySelector(".btn-text");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const agendaCount = document.getElementById("agendaCount");
let sedangEdit = false;
let idYangDiedit = null;
let notificationTimer;
function getDataKegiatan() { try { return JSON.parse(localStorage.getItem("kegiatanKu")) || []; } catch { return []; } }
function setModeEdit(item = null) { sedangEdit = Boolean(item); idYangDiedit = item?.id ?? null; mainBtnText.textContent = item ? "Simpan perubahan" : "Simpan agenda"; cancelEditBtn.hidden = !item; }
function resetForm() { form.reset(); dateInput.value = new Date().toISOString().slice(0, 10); setModeEdit(); }
function tambahKegiatan() {
    if (!form.reportValidity()) return;
    if (endTimeInput.value <= startTimeInput.value) { showNotification("Waktu selesai harus setelah waktu mulai.", "error"); endTimeInput.focus(); return; }
    const dataKegiatan = getDataKegiatan();
    const kegiatan = { tanggal: dateInput.value, nama: activityInput.value.trim(), waktuMulai: startTimeInput.value, waktuSelesai: endTimeInput.value };
    if (sedangEdit) { const index = dataKegiatan.findIndex(item => item.id === idYangDiedit); if (index !== -1) dataKegiatan[index] = { ...dataKegiatan[index], ...kegiatan, id: idYangDiedit }; showNotification("Perubahan berhasil disimpan.", "success"); }
    else { dataKegiatan.push({ ...kegiatan, id: Date.now(), selesai: false }); showNotification("Agenda berhasil ditambahkan.", "success"); }
    localStorage.setItem("kegiatanKu", JSON.stringify(dataKegiatan)); resetForm(); tampilkanData();
}
function masukModeEdit(id) { const item = getDataKegiatan().find(kegiatan => kegiatan.id === id); if (!item) return; dateInput.value = item.tanggal; startTimeInput.value = item.waktuMulai || item.jam || ""; endTimeInput.value = item.waktuSelesai || ""; activityInput.value = item.nama; setModeEdit(item); activityInput.focus(); form.scrollIntoView({ behavior: "smooth", block: "start" }); }
function hapusKegiatan(id) { const dataKegiatan = getDataKegiatan().filter(item => item.id !== id); localStorage.setItem("kegiatanKu", JSON.stringify(dataKegiatan)); if (idYangDiedit === id) resetForm(); tampilkanData(); showNotification("Agenda dihapus.", "error"); }
function toggleSelesai(id) { const dataKegiatan = getDataKegiatan().map(item => item.id === id ? { ...item, selesai: !item.selesai } : item); localStorage.setItem("kegiatanKu", JSON.stringify(dataKegiatan)); tampilkanData(); showNotification(dataKegiatan.find(item => item.id === id).selesai ? "Agenda selesai." : "Agenda dibuka kembali.", "success"); }
function buatTombol(className, label, icon, action) { const button = document.createElement("button"); button.type = "button"; button.className = className; button.setAttribute("aria-label", label); button.title = label; button.textContent = icon; button.addEventListener("click", action); return button; }
function tampilkanData() {
    const dataKegiatan = getDataKegiatan().sort((a, b) => `${a.tanggal}T${a.waktuMulai || a.jam}`.localeCompare(`${b.tanggal}T${b.waktuMulai || b.jam}`));
    listContainer.replaceChildren(); emptyState.hidden = dataKegiatan.length > 0; agendaCount.textContent = `${dataKegiatan.length} agenda`;
    dataKegiatan.forEach(item => { const li = document.createElement("li"); if (item.selesai) li.classList.add("selesai"); const meta = document.createElement("div"); meta.className = "activity-meta"; const waktu = document.createElement("strong"); waktu.textContent = `${new Date(`${item.tanggal}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} · ${item.waktuMulai || item.jam}${item.waktuSelesai ? `–${item.waktuSelesai}` : ""}`; const nama = document.createElement("span"); nama.textContent = item.nama; meta.append(waktu, nama); const actions = document.createElement("div"); actions.className = "action-buttons"; actions.append(buatTombol("complete-btn", item.selesai ? `Batalkan selesai ${item.nama}` : `Tandai selesai ${item.nama}`, item.selesai ? "↶" : "✓", () => toggleSelesai(item.id)), buatTombol("edit-btn", `Edit ${item.nama}`, "✎", () => masukModeEdit(item.id)), buatTombol("hapus-btn", `Hapus ${item.nama}`, "×", () => hapusKegiatan(item.id))); li.append(meta, actions); listContainer.appendChild(li); });
}
function showNotification(pesan, tipe) { const notifBox = document.getElementById("notification"); clearTimeout(notificationTimer); notifBox.textContent = pesan; notifBox.className = `notification show ${tipe}`; notificationTimer = setTimeout(() => { notifBox.className = "notification"; }, 3000); }
form.addEventListener("submit", event => { event.preventDefault(); tambahKegiatan(); });
cancelEditBtn.addEventListener("click", resetForm);
document.addEventListener("DOMContentLoaded", () => { resetForm(); tampilkanData(); });
