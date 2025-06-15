import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fade,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { Product } from "../types";

interface ProductManagerProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  setProducts,
}) => {
  const [newProduct, setNewProduct] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const addProduct = () => {
    if (newProduct.name.trim()) {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || undefined,
      };
      setProducts([...products, product]);
      setNewProduct({ name: "", description: "" });
    }
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p))
    );
    setEditingId(null);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      addProduct();
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Add Products to Compare
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Add at least 2 products or tools you want to compare. You can always
        edit or remove them later.
      </Typography>

      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
                sx={{ minWidth: 200, flex: 1 }}
              />
              <TextField
                label="Description (optional)"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
                sx={{ minWidth: 200, flex: 1 }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={addProduct}
              disabled={!newProduct.name.trim()}
              startIcon={<Add />}
              sx={{ alignSelf: "flex-start" }}
            >
              Add Product
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6">Products ({products.length})</Typography>
        {products.length >= 2 && (
          <Chip
            label="Ready to proceed"
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 2,
        }}
      >
        <AnimatePresence>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <CardContent>
                  {editingId === product.id ? (
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        value={product.name}
                        onChange={(e) =>
                          updateProduct(product.id, { name: e.target.value })
                        }
                        onBlur={() => setEditingId(null)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && setEditingId(null)
                        }
                        autoFocus
                        size="small"
                      />
                      <TextField
                        fullWidth
                        value={product.description || ""}
                        onChange={(e) =>
                          updateProduct(product.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Description"
                        size="small"
                        multiline
                        rows={2}
                      />
                    </Stack>
                  ) : (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {product.description}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => setEditingId(product.id)}
                          sx={{ color: "primary.main" }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteProduct(product.id)}
                          sx={{ color: "error.main" }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {products.length === 0 && (
        <Fade in>
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              color: "text.secondary",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              No products added yet
            </Typography>
            <Typography variant="body2">
              Start by adding the products or tools you want to compare
            </Typography>
          </Box>
        </Fade>
      )}

      {products.length === 1 && (
        <Fade in>
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: "warning.main",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Add at least one more product to continue
            </Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default ProductManager;
