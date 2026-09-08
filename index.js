import express, { response } from "express";
import axios from "axios";
import { readFile } from "node:fs/promises";

const app = express();
const PORT = 3001;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const API_BASE = "https://jsonplaceholder.typicode.com";

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function renderPage(state = {}) {
  const {
    message = "Ready.",
    cardJson = null,
    getId = "",
    createTitle = "",
    createBody = "",
    putId = "",
    putTitle = "",
    putBody = "",
    patchId = "",
    patchTitle = "",
    patchBody = "",
    deleteId = ""
  } = state;

  const template = await readFile(new URL("./views/index.html", import.meta.url), "utf-8");

  const card = cardJson
    ? `<div class="card"><pre>${escapeHtml(JSON.stringify(cardJson, null, 2))}</pre></div>`
    : "";

  return template
    .replace("{{MESSAGE}}", escapeHtml(message))
    .replace("{{CARD}}", card)
    .replace("{{GET_ID}}", escapeHtml(getId))
    .replace("{{CREATE_TITLE}}", escapeHtml(createTitle))
    .replace("{{CREATE_BODY}}", escapeHtml(createBody))
    .replace("{{PUT_ID}}", escapeHtml(putId))
    .replace("{{PUT_TITLE}}", escapeHtml(putTitle))
    .replace("{{PUT_BODY}}", escapeHtml(putBody))
    .replace("{{PATCH_ID}}", escapeHtml(patchId))
    .replace("{{PATCH_TITLE}}", escapeHtml(patchTitle))
    .replace("{{PATCH_BODY}}", escapeHtml(patchBody))
    .replace("{{DELETE_ID}}", escapeHtml(deleteId));
}

app.get("/", async (req, res) => {
  const html = await renderPage({ message: "Use the panels to test REST methods." });
  res.send(html);
});

// GET (read)
app.post("/get-post", async (req, res) => {
  const id = (req.body.id || "").trim();

  if (!id){
    return res.send(await renderPage({message: "Enter a post id to fetch."}))
  }

  try {
    // TODO:
    // - call GET `${API_BASE}/posts/${id}`
    // - render response.data
    const response = await axios.get(`${API_BASE}/posts/${id}`, { validateStatus: () => true })

    if (response.status === 404 || !response.data || Object.keys(response.data).length === 0 ){
      return res.send(await renderPage({ message: `The search didn't return something for post ${id}.`, getId: id }))
    }

    console.log(response.data)

    const html = await renderPage({
      message: `GET request successful for post "${id}"`,
      getId: id,
      cardJson: response.data
    });
    res.send(html);
  } catch {
    const html = await renderPage({
      message: "Failed to GET post (starter).",
      getId: id,
    });
    res.status(500).send(html);
  }
});

// POST (create)
app.post("/create-post", async (req, res) => {
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!title || !body){
      return res.send(await renderPage({message:"Title and body are required.", createTitle: title, createBody: body}));
  }

  try {
    // TODO:
    // - call POST `${API_BASE}/posts` with body { title, body, userId: 1 }
    
    const response = await axios.post(`${API_BASE}/posts`, {body:{title, body, userId: 1}}, { validateStatus: () => true});
    
    res.send(await renderPage({ message: "Successfully created post.", createTitle: title, createBody: body, cardJson: response.data }));

    console.log(response.data)

  } catch {
    res.status(500).send(await renderPage({message: "Failed to CREATE post (starter).", createTitle: title, createBody: body}));
  }
});

// PUT (replace)
app.post("/replace-post", async (req, res) => {
  const id = (req.body.id || "").trim();
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!id || !title || !body){
      return res.send(await renderPage({message: "PUT needs id, title, and body.", putId: id, putTitle: title, putBody: body}));
  }

  try {
    // TODO:
    // - call PUT `${API_BASE}/posts/${id}` with full object { id, title, body, userId: 1 }
    const response = await axios.put(`${API_BASE}/posts/${id}`, {body:{id: id, title: title, body: body, userId: 1}}, { validateStatus: () => true });

    console.log(response.data)

    res.send(await renderPage({message: `Post successfully swapped for post ${id}.`, putId: id, putTitle: title, putBody: body, cardJson: response.data}));



    // const html = await renderPage({
    //   message: `This is your new post for post "${id}".`,
    //   putId: id,
    //   putTitle: title,
    //   putBody: body
    // });
    // res.send(html);
  } catch {

    // const html = await renderPage({
    //   message: "Failed to PUT replace (starter).",
    //   putId: id,
    //   putTitle: title,
    //   putBody: body
    // });
    res.status(500).send(await renderPage({message: "Failed to PUT replace", putId: id, putTitle: title, putBody: body}));
  }
});

// PATCH (partial update)
app.post("/patch-post", async (req, res) => {
  const id = (req.body.id || "").trim();
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!id){
      res.send(await renderPage({message: "Id is needed to use a PATCH request.", patchId: id}));
  }

  const patch = {};
  if(title) patch.title = title;
  if(body) patch.body = body;

  if (Object.keys(patch).length === 0){
    res.send(await renderPage({message: "To PATCH, provide at least a title and/or body.", patchId: id}));
  }

  try {
    // TODO:
    // - build a patch object with only fields provided
    // - call PATCH `${API_BASE}/posts/${id}`

    const response = await axios.patch(`${API_BASE}/posts/${id}`, patch, { validateStatus: () => true });

    console.log(response.data);

    res.send(await renderPage({message: `This post includes your updated sections for post "${id}".`, patchId: id, patchTitle: title, patchBody: body, cardJson: response.data}));



    // const html = await renderPage({
    //   message: `This post includes your updated sections for post "${id}".`,
    //   patchId: id,
    //   patchTitle: title,
    //   patchBody: body
    // });
    // res.send(html);
  } catch {
    // const html = await renderPage({
    //   message: "Failed to PATCH update (starter).",
    //   patchId: id,
    //   patchTitle: title,
    //   patchBody: body
    // });
    res.status(500).send(await renderPage({message: "Failed to PATCH update.", patchId: id, patchTitle: title, patchBody: body}));
  }
});

// DELETE (remove)
app.post("/delete-post", async (req, res) => {
  const id = (req.body.id || "").trim();

  if (!id){
      return res.send(await renderPage({message: "A post id is required to use DELETE request."}))
  }

  try {
    // TODO:
    // - call DELETE `${API_BASE}/posts/${id}`
    const response = await axios.delete(`${API_BASE}/posts${id}`, { validateStatus: () => true });

    res.send(await renderPage({message: `Post ${id} has been deleted successfully.`, deleteId: id, cardJson: {status: response.status, data: response.data} }));
    // const html = await renderPage({
    //   message: `Post "${id}" has been deleted.`,
    //   deleteId: id
    // });
    // res.send(html);
  } catch {
    // const html = await renderPage({
    //   message: "Failed to DELETE post (starter).",
    //   deleteId: id
    // });
    res.status(500).send(await renderPage({message: "Failed to delete post.", deleteId: id}));
  }
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
