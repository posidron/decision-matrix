import { Add, Delete, Edit, TuneOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fade,
  IconButton,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { Criterion } from "../types";

interface CriteriaManagerProps {
  criteria: Criterion[];
  setCriteria: (criteria: Criterion[]) => void;
}

const CriteriaManager: React.FC<CriteriaManagerProps> = ({
  criteria,
  setCriteria,
}) => {
  const [newCriterion, setNewCriterion] = useState({
    name: "",
    description: "",
    weight: 5,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const addCriterion = () => {
    if (newCriterion.name.trim()) {
      const criterion: Criterion = {
        id: Date.now().toString(),
        name: newCriterion.name.trim(),
        description: newCriterion.description.trim() || undefined,
        weight: newCriterion.weight,
      };
      setCriteria([...criteria, criterion]);
      setNewCriterion({ name: "", description: "", weight: 5 });
    }
  };

  const deleteCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  const updateCriterion = (
    id: string,
    updatedCriterion: Partial<Criterion>
  ) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, ...updatedCriterion } : c))
    );
    setEditingId(null);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      addCriterion();
    }
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Define Evaluation Criteria
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Add criteria that matter for your decision and assign weights based on
        their importance.
      </Typography>

      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="Criterion Name"
                value={newCriterion.name}
                onChange={(e) =>
                  setNewCriterion({ ...newCriterion, name: e.target.value })
                }
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
                sx={{ minWidth: 200, flex: 1 }}
              />
              <TextField
                label="Description (optional)"
                value={newCriterion.description}
                onChange={(e) =>
                  setNewCriterion({
                    ...newCriterion,
                    description: e.target.value,
                  })
                }
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
                sx={{ minWidth: 200, flex: 1 }}
              />
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <TuneOutlined fontSize="small" />
                Weight: {newCriterion.weight}/10
              </Typography>
              <Slider
                value={newCriterion.weight}
                onChange={(_, value) =>
                  setNewCriterion({ ...newCriterion, weight: value as number })
                }
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                sx={{ maxWidth: 300 }}
              />
            </Box>

            <Button
              variant="contained"
              onClick={addCriterion}
              disabled={!newCriterion.name.trim()}
              startIcon={<Add />}
              sx={{ alignSelf: "flex-start" }}
            >
              Add Criterion
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h6">Criteria ({criteria.length})</Typography>
        {criteria.length >= 1 && (
          <Chip
            label="Ready to proceed"
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )}
        {totalWeight > 0 && (
          <Chip
            label={`Total Weight: ${totalWeight}`}
            color="info"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      <Stack spacing={2}>
        <AnimatePresence>
          {criteria.map((criterion, index) => (
            <motion.div
              key={criterion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateX(4px)",
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <CardContent>
                  {editingId === criterion.id ? (
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        value={criterion.name}
                        onChange={(e) =>
                          updateCriterion(criterion.id, {
                            name: e.target.value,
                          })
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
                        value={criterion.description || ""}
                        onChange={(e) =>
                          updateCriterion(criterion.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Description"
                        size="small"
                        multiline
                        rows={2}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Weight: {criterion.weight}/10
                        </Typography>
                        <Slider
                          value={criterion.weight}
                          onChange={(_, value) =>
                            updateCriterion(criterion.id, {
                              weight: value as number,
                            })
                          }
                          min={1}
                          max={10}
                          step={1}
                          marks
                          valueLabelDisplay="auto"
                          sx={{ maxWidth: 300 }}
                        />
                      </Box>
                    </Stack>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1,
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {criterion.name}
                          </Typography>
                          <Chip
                            label={`Weight: ${criterion.weight}`}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        {criterion.description && (
                          <Typography variant="body2" color="text.secondary">
                            {criterion.description}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => setEditingId(criterion.id)}
                          sx={{ color: "primary.main" }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteCriterion(criterion.id)}
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
      </Stack>

      {criteria.length === 0 && (
        <Fade in>
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              color: "text.secondary",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              No criteria added yet
            </Typography>
            <Typography variant="body2">
              Start by adding the criteria that matter for your decision
            </Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default CriteriaManager;
