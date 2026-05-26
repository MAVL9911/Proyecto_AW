import { Request, Response } from 'express';

// Datos temporales en memoria (hasta conectar MySQL)
let products = [
  { id: 1, name: 'Laptop Gaming', price: 15999.99, category: 'Electrónica', stock: 10, image: '', discontinued: false, rating: 4.5 },
  { id: 2, name: 'Teclado Mecánico', price: 1299.99, category: 'Electrónica', stock: 5, image: '', discontinued: false, rating: 4.2 },
  { id: 3, name: 'Monitor 4K', price: 8499.99, category: 'Electrónica', stock: 0, image: '', discontinued: false, rating: 4.7 },
  { id: 4, name: 'Silla Gamer', price: 4999.99, category: 'Muebles', stock: 8, image: '', discontinued: false, rating: 4.0 },
  { id: 5, name: 'Audífonos Inalámbricos', price: 2499.99, category: 'Electrónica', stock: 15, image: '', discontinued: true, rating: 4.3 },
];
let nextId = 6;

// GET /api/products - Obtener todos los productos
export const getProducts = (req: Request, res: Response): void => {
  const { search, category, sort } = req.query;

  let result = products.filter(p => !p.discontinued);

  // Filtro por búsqueda (RF06)
  if (search) {
    result = result.filter(p =>
      p.name.toLowerCase().includes((search as string).toLowerCase())
    );
  }

  // Filtro por categoría (RF07)
  if (category) {
    result = result.filter(p => p.category === category);
  }

  // Ordenamiento (RF07)
  if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);

  res.status(200).json(result);
};

// GET /api/products/:id - Obtener producto por ID
export const getProductById = (req: Request, res: Response): void => {
  const product = products.find(p => p.id === parseInt(req.params.id as string));
  if (!product) {
    res.status(404).json({ message: 'Producto no encontrado' });
    return;
  }
  res.status(200).json(product);
};

// POST /api/products - Crear producto (admin)
export const createProduct = (req: Request, res: Response): void => {
  const { name, price, category, stock, image } = req.body;

  if (!name || !price || !category || stock === undefined) {
    res.status(400).json({ message: 'Nombre, precio, categoría y stock son requeridos' });
    return;
  }

  const newProduct = {
    id: nextId++,
    name,
    price,
    category,
    stock,
    image: image || '',
    discontinued: false,
    rating: 0
  };

  products.push(newProduct);
  res.status(201).json({ message: 'Producto creado exitosamente', product: newProduct });
};

// PUT /api/products/:id - Editar producto (admin)
export const updateProduct = (req: Request, res: Response): void => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id as string));
  if (index === -1) {
    res.status(404).json({ message: 'Producto no encontrado' });
    return;
  }

  products[index] = { ...products[index], ...req.body };
  res.status(200).json({ message: 'Producto actualizado', product: products[index] });
};

// DELETE /api/products/:id - Descontinuar producto (admin) (RF13)
export const discontinueProduct = (req: Request, res: Response): void => {
  const product = products.find(p => p.id === parseInt(req.params.id as string));
  if (!product) {
    res.status(404).json({ message: 'Producto no encontrado' });
    return;
  }

  product.discontinued = true;
  res.status(200).json({ message: 'Producto marcado como descontinuado' });
};

// GET /api/products/categories - Obtener categorías únicas
export const getCategories = (req: Request, res: Response): void => {
  const categories = [...new Set(products.filter(p => !p.discontinued).map(p => p.category))];
  res.status(200).json(categories);
};