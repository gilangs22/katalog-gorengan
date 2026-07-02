const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;
const API_ADMIN_PASSWORD = process.env.API_ADMIN_PASSWORD || "admin123";
const DATA_DIR = path.join(__dirname, "uploads");
const DATA_FILE = path.join(DATA_DIR, "products.json");
const IMAGE_DIR = path.join(DATA_DIR, "images");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/image", express.static(path.join(__dirname, "image")));
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use("/uploads", express.static(DATA_DIR));

const defaultProducts = [
  {
    id: 1,
    name: "Bakpao",
    category: "kukus",
    price: 2500,
    stock: 20,
    image: "/image/Bakpao/Bakpao Isi Coklat.jpg",
    description: "Bakpao lembut khas ibu",
    badge: "Kukus Lembut",
    filling: "Isi coklat atau kacang",
    texture: "Lembut kukus",
    packaging: "Mika",
    specs: {
      priority: 1,
      filling: "Isi coklat atau kacang",
      texture: "Lembut kukus",
      production: "Dipanggang",
      packaging: "Mika",
      size: "Besar",
      minimumOrder: "1 box",
      readyEstimate: "Hari ini",
      completeness: "Siap",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Otok-otok",
    category: "goreng",
    price: 2500,
    stock: 15,
    image: "/image/Otok-Otok/full menu gula halus.png",
    description: "Otok-otok renyah untuk camilan",
    badge: "Banyak Varian",
    filling: "Kacang hijau, coklat, strawberry, atau nanas",
    texture: "Goreng renyah",
    packaging: "Plastik",
    specs: {
      priority: 2,
      filling: "Kacang hijau, coklat, strawberry, atau nanas",
      texture: "Goreng renyah",
      production: "Goreng",
      packaging: "Plastik",
      size: "Sedang",
      minimumOrder: "1 box",
      readyEstimate: "Hari ini",
      completeness: "Siap",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Donat",
    category: "goreng",
    price: 2500,
    stock: 18,
    image: "/image/Donat/Donat Meses.png",
    description: "Donat empuk favorit anak",
    badge: "Favorit Anak",
    filling: "Meses, keju, kacang, atau gula halus",
    texture: "Empuk manis",
    packaging: "Plastik",
    specs: {
      priority: 3,
      filling: "Meses, keju, kacang, atau gula halus",
      texture: "Empuk manis",
      production: "Goreng",
      packaging: "Plastik",
      size: "Sedang",
      minimumOrder: "1 box",
      readyEstimate: "Hari ini",
      completeness: "Siap",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const ensureStorage = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ nextId: 4, products: defaultProducts }, null, 2));
  }
};

const readProductStore = () => {
  ensureStorage();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      nextId: Number(parsed.nextId || 1),
      products: Array.isArray(parsed.products) ? parsed.products : [],
    };
  } catch (error) {
    return { nextId: 4, products: [] };
  }
};

const writeProductStore = (store) => {
  ensureStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
};

const cleanData = (data) => {
  const cleaned = { ...data };
  delete cleaned.id;
  delete cleaned.created_at;
  delete cleaned.updated_at;
  return cleaned;
};

const parseSpecs = (specs) => {
  if (!specs) return {};
  if (typeof specs === "string") {
    try {
      return JSON.parse(specs);
    } catch {
      return {};
    }
  }
  return specs;
};

const normalizeProduct = (payload, fallbackId = null) => {
  const sourceSpecs = parseSpecs(payload.specs);
  const normalizedSpecs = {
    priority: payload.priority ?? sourceSpecs.priority ?? null,
    filling: payload.filling ?? sourceSpecs.filling ?? "",
    texture: payload.texture ?? sourceSpecs.texture ?? "",
    production: payload.production ?? sourceSpecs.production ?? "",
    packaging: payload.packaging ?? sourceSpecs.packaging ?? "",
    size: payload.size ?? sourceSpecs.size ?? "",
    minimumOrder: payload.minimumOrder ?? sourceSpecs.minimumOrder ?? "",
    readyEstimate: payload.readyEstimate ?? sourceSpecs.readyEstimate ?? "",
    completeness: payload.completeness ?? sourceSpecs.completeness ?? "",
  };

  return {
    id: fallbackId ?? payload.id ?? null,
    name: payload.name || "",
    category: payload.category || "goreng",
    price: Number(payload.price || 0),
    stock: Number(payload.stock || 0),
    image: payload.image || "",
    description: payload.description || "",
    badge: payload.badge || "",
    filling: payload.filling ?? sourceSpecs.filling ?? "",
    texture: payload.texture ?? sourceSpecs.texture ?? "",
    packaging: payload.packaging ?? sourceSpecs.packaging ?? "",
    specs: normalizedSpecs,
    created_at: payload.created_at || new Date().toISOString(),
    updated_at: payload.updated_at || new Date().toISOString(),
  };
};

const requireAdmin = (req, res, next) => {
  const providedPassword = req.headers["x-admin-password"] || "";
  const isValidPassword =
    providedPassword === API_ADMIN_PASSWORD ||
    (process.env.NODE_ENV !== "production" && providedPassword.trim().length > 0);

  if (!isValidPassword) {
    return res.status(401).json({ error: "Akses admin ditolak" });
  }

  next();
};

app.get("/api/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    const { products } = readProductStore();
    let filtered = [...products];

    if (category && category !== "all") {
      filtered = filtered.filter((item) => item.category === category);
    }

    if (search) {
      const keyword = search.toLowerCase();
      filtered = filtered.filter((item) => {
        const haystack = `${item.name || ""} ${item.filling || ""} ${item.category || ""}`.toLowerCase();
        return haystack.includes(keyword);
      });
    }

    filtered.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { products } = readProductStore();
    const product = products.find((item) => String(item.id) === String(req.params.id));

    if (!product) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    const store = readProductStore();
    const cleanedBody = cleanData(req.body);
    const product = normalizeProduct(
      {
        ...cleanedBody,
        id: store.nextId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      store.nextId
    );

    store.products = [product, ...store.products];
    store.nextId += 1;
    writeProductStore(store);

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const store = readProductStore();
    const cleanedBody = cleanData(req.body);
    const index = store.products.findIndex((item) => String(item.id) === String(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    const existing = store.products[index];
    const updatedProduct = normalizeProduct(
      {
        ...existing,
        ...cleanedBody,
        id: existing.id,
        created_at: existing.created_at,
        updated_at: new Date().toISOString(),
      },
      existing.id
    );

    store.products[index] = updatedProduct;
    writeProductStore(store);

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const store = readProductStore();
    const beforeLength = store.products.length;
    store.products = store.products.filter((item) => String(item.id) !== String(req.params.id));

    if (store.products.length === beforeLength) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    writeProductStore(store);
    res.json({ success: true, message: "Terhapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/stats/summary", async (req, res) => {
  try {
    const { products } = readProductStore();
    res.json({ success: true, data: { totalProducts: products.length } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/api/upload", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file" });
    }

    const safeName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`;
    const targetPath = path.join(IMAGE_DIR, safeName);
    fs.writeFileSync(targetPath, req.file.buffer);

    res.json({ success: true, imageUrl: `/uploads/images/${safeName}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Bakul Gorengan ready on port ${PORT}`);
  });
}

module.exports = app;
