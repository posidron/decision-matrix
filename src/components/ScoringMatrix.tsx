import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Paper,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import React from "react";
import { Criterion, Product, Score } from "../types";

interface ScoringMatrixProps {
  products: Product[];
  criteria: Criterion[];
  scores: Score[];
  setScores: (scores: Score[]) => void;
}

const ScoringMatrix: React.FC<ScoringMatrixProps> = ({
  products,
  criteria,
  scores,
  setScores,
}) => {
  const getScore = (productId: string, criterionId: string): number => {
    const score = scores.find(
      (s) => s.productId === productId && s.criterionId === criterionId
    );
    return score ? score.value : 5;
  };

  const updateScore = (
    productId: string,
    criterionId: string,
    value: number
  ) => {
    const existingScoreIndex = scores.findIndex(
      (s) => s.productId === productId && s.criterionId === criterionId
    );

    if (existingScoreIndex >= 0) {
      const newScores = [...scores];
      newScores[existingScoreIndex] = { productId, criterionId, value };
      setScores(newScores);
    } else {
      setScores([...scores, { productId, criterionId, value }]);
    }
  };

  const getCompletionPercentage = () => {
    const totalCells = products.length * criteria.length;
    const completedCells = scores.length;
    return totalCells > 0 ? (completedCells / totalCells) * 100 : 0;
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Score Products Against Criteria
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Rate each product for every criterion on a scale of 1-10. Higher scores
        indicate better performance.
      </Typography>

      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Typography variant="h6">
              Progress: {Math.round(completionPercentage)}%
            </Typography>
            <Chip
              label={`${scores.length}/${
                products.length * criteria.length
              } completed`}
              color={completionPercentage === 100 ? "success" : "primary"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, overflow: "hidden" }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                }}
              >
                <TableCell
                  sx={{ color: "white", fontWeight: 600, fontSize: "1rem" }}
                >
                  Product / Criterion
                </TableCell>
                {criteria.map((criterion) => (
                  <TableCell
                    key={criterion.id}
                    align="center"
                    sx={{ color: "white", fontWeight: 600, minWidth: 200 }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {criterion.name}
                      </Typography>
                      <Chip
                        label={`Weight: ${criterion.weight}`}
                        size="small"
                        sx={{
                          mt: 1,
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, productIndex) => (
                <TableRow
                  key={product.id}
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: "rgba(99, 102, 241, 0.05)",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.1)",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, fontSize: "1rem" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography variant="body2" color="text.secondary">
                          {product.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  {criteria.map((criterion) => {
                    const currentScore = getScore(product.id, criterion.id);
                    return (
                      <TableCell
                        key={criterion.id}
                        align="center"
                        sx={{ p: 3 }}
                      >
                        <Box sx={{ px: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              color:
                                currentScore >= 7
                                  ? "success.main"
                                  : currentScore >= 4
                                  ? "warning.main"
                                  : "error.main",
                            }}
                          >
                            {currentScore}/10
                          </Typography>
                          <Slider
                            value={currentScore}
                            onChange={(_, value) =>
                              updateScore(
                                product.id,
                                criterion.id,
                                value as number
                              )
                            }
                            min={1}
                            max={10}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                            sx={{
                              "& .MuiSlider-thumb": {
                                width: 20,
                                height: 20,
                              },
                              "& .MuiSlider-track": {
                                height: 6,
                              },
                              "& .MuiSlider-rail": {
                                height: 6,
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {completionPercentage < 100 && (
        <Card
          sx={{
            mt: 4,
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          }}
        >
          <CardContent>
            <Typography
              variant="body1"
              sx={{ fontWeight: 600, color: "orange.800" }}
            >
              💡 Tip: Complete all scores to proceed to the results. You can
              always come back and adjust them later.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ScoringMatrix;
