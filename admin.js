(() => {
  "use strict";
  const KEY = "adorbitx-content";
  let original = {};
  let data = {};
  const $ = (selector, scope=document) => scope.querySelector(selector);
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
  const get = path => path.split(".").reduce((obj, key) => obj == null ? undefined : obj[key], data);
  const set = (path, value) => {
    const parts = path.split(".");
    let obj = data;
    while (parts.length > 1) {
      const key = parts.shift();
      if (!obj[key] || typeof obj[key] !== "object") obj[key] = {};
      obj = obj[key];
    }
    obj[parts[0]] = value;
  };
  const ensureShape = value => {
    const base = clone(original);
    for (const key of Object.keys(base)) {
      if (value[key] === undefined) value[key] = base[key];
    }
    ["services","packages","projects","blogs","metaResults"].forEach(key => {
      if (!Array.isArray(value[key])) value[key] = clone(base[key] || []);
    });
    ["seo","hero","socials"].forEach(key => {
      if (!value[key] || typeof value[key] !== "object") value[key] = clone(base[key] || {});
    });
    return value;
  };
  const status = message => {
    const node = $("#saveStatus");
    if (node) node.textContent = message;
    const top = $("#adminStatus");
    if (top) top.textContent = message;
  };
  const slugify = value => value.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const saveLocal = (quiet=false) => {
    try {
      document.querySelectorAll("[data-bind]").forEach(el => set(el.dataset.bind, el.value));
      localStorage.setItem(KEY, JSON.stringify(data));
      overview();
      if (!quiet) status("Saved on this device. Export content.json to publish changes to GitHub Pages.");
      return true;
    } catch (error) {
      status("Could not save in this browser. Check browser storage permissions or available space.");
      return false;
    }
  };
  const overview = () => {
    const node = $("#overview");
    if (!node) return;
    node.innerHTML = `<b>${esc(data.brand)}</b><br>
      ${data.services.length} services · ${data.packages.length} packages ·
      ${data.metaResults.length} Meta Ads slides · ${data.projects.length} projects ·
      ${data.blogs.length} blog posts<br>
      <span class="status">${localStorage.getItem(KEY) ? "Local changes saved" : "No local changes saved yet"}</span>`;
  };
  const bindFields = () => {
    document.querySelectorAll("[data-bind]").forEach(el => {
      el.value = get(el.dataset.bind) ?? "";
      el.addEventListener("input", () => {
        set(el.dataset.bind, el.value);
        saveLocal(true);
        status("Editing… changes are being saved on this device.");
      });
    });
  };
  const configs = {
    metaResults: [["category","Category"],["title","Title"],["description","Description",1],["metric","Metric label"],["image","Screenshot image URL"]],
    services: [["title","Title"],["description","Description",1],["tags","Tags (comma separated)"]],
    packages: [["name","Package name"],["label","Label"],["price","Price"],["description","Description",1],["features","Features (one per line)",1]],
    projects: [["title","Project title"],["category","Category"],["client","Client / industry"],["goal","Goal",1],["work","Work delivered",1],["outcome","Outcome / results",1],["image","Image URL"],["url","Project URL"]],
    blogs: [["title","Post title"],["slug","URL slug"],["category","Category"],["date","Publish date"],["excerpt","Excerpt",1],["metaTitle","SEO meta title"],["metaDescription","SEO meta description"],["image","Featured image URL"],["body","Article body (separate paragraphs with a blank line)",1]]
  };
  const renderEditors = () => {
    Object.entries(configs).forEach(([type, fields]) => {
      const target = $("#" + type + "Editor");
      if (!target) return;
      target.innerHTML = (data[type] || []).map((item, index) => `
        <div class="admin-card">
          <div class="item-row"><b>${esc(item.title || item.name || "Untitled item")}</b>
            <button type="button" class="admin-btn danger" data-delete="${type}:${index}">Delete</button>
          </div>
          <div class="admin-grid">${fields.map(([key,label,multi]) => `
            <label class="field ${multi ? "full" : ""}">${label}
              ${multi
                ? `<textarea data-array="${type}:${index}:${key}">${esc(item[key] || "")}</textarea>`
                : `<input data-array="${type}:${index}:${key}" value="${esc(item[key] || "")}">`}
            </label>`).join("")}
          </div>
        </div>`).join("");
      target.querySelectorAll("[data-array]").forEach(el => {
        el.addEventListener("input", () => {
          const [, index, key] = el.dataset.array.split(":");
          const item = data[type][Number(index)];
          item[key] = el.value;
          if (type === "blogs" && key === "title" && !item.slug) item.slug = slugify(el.value);
          saveLocal(true);
          status("Editing… changes are being saved on this device.");
        });
      });
      target.querySelectorAll("[data-delete]").forEach(button => {
        button.addEventListener("click", () => {
          const [, index] = button.dataset.delete.split(":");
          if (!confirm("Delete this item?")) return;
          data[type].splice(Number(index), 1);
          renderEditors();
          saveLocal(true);
          status("Item deleted and saved on this device.");
        });
      });
    });
  };
  const addItem = (type, item) => {
    data[type].push(item);
    renderEditors();
    saveLocal(true);
    status("New item added. Edit its fields, then export content.json to publish.");
  };
  const exportJson = () => {
    if (!saveLocal(true)) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "content.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    status("content.json downloaded. Replace the repository file and push to publish.");
  };
  const importJson = event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        data = ensureShape(parsed);
        localStorage.setItem(KEY, JSON.stringify(data));
        bindFields();
        renderEditors();
        overview();
        status("Content imported and saved on this device. Export it again to publish.");
      } catch (error) {
        alert("Could not import this file. Please choose a valid content.json backup.");
      }
      event.target.value = "";
    };
    reader.onerror = () => status("The selected file could not be read.");
    reader.readAsText(file);
  };
  const init = async () => {
    try {
      const response = await fetch("./content.json", {cache:"no-store"});
      if (!response.ok) throw new Error("HTTP " + response.status);
      original = await response.json();
      let local = null;
      try { local = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (_) {}
      data = ensureShape(local && typeof local === "object" ? local : clone(original));
      bindFields();
      renderEditors();
      overview();

      document.querySelectorAll("[data-tab]").forEach(button => {
        button.addEventListener("click", () => {
          document.querySelectorAll("[data-tab]").forEach(item => item.classList.toggle("active", item === button));
          document.querySelectorAll(".admin-panel").forEach(panel => panel.classList.toggle("active", panel.id === button.dataset.tab));
        });
      });

      $("#saveAll")?.addEventListener("click", () => saveLocal());
      $("#topSave")?.addEventListener("click", () => saveLocal());
      $("#exportJson")?.addEventListener("click", exportJson);
      $("#topExport")?.addEventListener("click", exportJson);
      $("#importJson")?.addEventListener("change", importJson);
      $("#resetData")?.addEventListener("click", () => {
        if (!confirm("Reset all local edits to the original starter content?")) return;
        data = clone(original);
        localStorage.removeItem(KEY);
        bindFields();
        renderEditors();
        overview();
        status("Starter content restored in this browser.");
      });

      $("#addService")?.addEventListener("click", () => addItem("services", {title:"New service",description:"Describe this service.",tags:"Add tags"}));
      $("#addPackage")?.addEventListener("click", () => addItem("packages", {name:"New package",label:"PACKAGE",price:"Contact for price",description:"Package description",features:"Feature one\nFeature two"}));
      $("#addMetaResult")?.addEventListener("click", () => addItem("metaResults", {category:"CASE STUDY",title:"New campaign",description:"Add verified case study details.",image:"",metric:"Verified result"}));
      $("#addProject")?.addEventListener("click", () => addItem("projects", {title:"New project",category:"CATEGORY",client:"Client / industry",goal:"Project goal",work:"What you delivered",outcome:"Verified outcome",image:"",url:""}));
      $("#addBlog")?.addEventListener("click", () => addItem("blogs", {slug:"new-post-" + Date.now(),title:"New blog post",category:"INSIGHTS",date:new Date().toISOString().slice(0,10),excerpt:"Short summary for blog cards.",metaTitle:"SEO title | AD 0RBITX",metaDescription:"Write a concise, accurate search description for this article.",body:"Write your article here. Separate paragraphs with a blank line.",image:""}));
      status("Control panel ready. Changes auto-save in this browser.");
    } catch (error) {
      const main = $(".admin-main");
      if (main) main.innerHTML = `<div class="admin-card"><h2>Could not load website content</h2>
        <p class="admin-help">The control panel needs to load <code>content.json</code>. Do not open admin.html directly as a file. Run the site through a local web server or open it from your hosted GitHub Pages website.</p>
        <p class="admin-help">For local testing, run <code>python -m http.server 8000</code> in the website folder, then visit <code>http://localhost:8000/admin.html</code>.</p>
        <p class="admin-help">Technical detail: ${esc(error.message)}</p></div>`;
    }
  };
  init();
})();