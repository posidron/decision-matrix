import { Assessment, EmojiEvents, TrendingUp } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
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
import { Criterion, Product, ProductScore, Score } from "../types";

interface ResultsProps {
  products: Product[];
  criteria: Criterion[];
  scores: Score[];
}

const Results: React.FC<ResultsProps> = ({ products, criteria, scores }) => {
  const calculateProductScores = (): ProductScore[] => {
    return products.map((product) => {
      const criteriaScores = criteria.map((criterion) => {
        const score = scores.find(
          (s) => s.productId === product.id && s.criterionId === criterion.id
        );
        const scoreValue = score ? score.value : 0;
        const weightedScore = scoreValue * criterion.weight;

        return {
          criterion,
          score: scoreValue,
          weightedScore,
        };
      });

      const totalScore = criteriaScores.reduce((sum, cs) => sum + cs.score, 0);
      const weightedScore = criteriaScores.reduce(
        (sum, cs) => sum + cs.weightedScore,
        0
      );

      return {
        product,
        totalScore,
        weightedScore,
        criteriaScores,
      };
    });
  };

  const productScores = calculateProductScores();
  const sortedProducts = [...productScores].sort(
    (a, b) => b.weightedScore - a.weightedScore
  );
  const maxWeightedScore = Math.max(
    ...productScores.map((ps) => ps.weightedScore)
  );
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <EmojiEvents sx={{ color: "#FFD700" }} />;
      case 2:
        return <EmojiEvents sx={{ color: "#C0C0C0" }} />;
      case 3:
        return <EmojiEvents sx={{ color: "#CD7F32" }} />;
      default:
        return <Assessment sx={{ color: "text.secondary" }} />;
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "success.main";
    if (percentage >= 60) return "info.main";
    if (percentage >= 40) return "warning.main";
    return "error.main";
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Decision Matrix Results
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here are your products ranked by their weighted scores. The winner is
        determined by the highest total weighted score.
      </Typography>

      {/* Winner Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <EmojiEvents sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Winner: {sortedProducts[0]?.product.name}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
              Weighted Score: {sortedProducts[0]?.weightedScore.toFixed(1)} /{" "}
              {(totalWeight * 10).toFixed(1)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={
                (sortedProducts[0]?.weightedScore / (totalWeight * 10)) * 100
              }
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "white",
                },
              }}
            />
          </CardContent>
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              zIndex: 0,
            }}
          />
        </Card>
      </motion.div>

      {/* Rankings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Complete Rankings
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Weighted Score
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Score Breakdown
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedProducts.map((productScore, index) => (
                    <TableRow
                      key={productScore.product.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(99, 102, 241, 0.05)",
                        },
                      }}
                    >
                      <TableCell>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {getRankIcon(index + 1)}
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              #{index + 1}
                            </Typography>
                          </Box>
                        </motion.div>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {productScore.product.name}
                          </Typography>
                          {productScore.product.description && (
                            <Typography variant="body2" color="text.secondary">
                              {productScore.product.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: getScoreColor(
                                productScore.weightedScore,
                                maxWeightedScore
                              ),
                            }}
                          >
                            {productScore.weightedScore.toFixed(1)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            / {(totalWeight * 10).toFixed(1)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={
                              (productScore.weightedScore /
                                (totalWeight * 10)) *
                              100
                            }
                            sx={{
                              mt: 1,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: "rgba(0, 0, 0, 0.1)",
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ justifyContent: "center", flexWrap: "wrap" }}
                        >
                          {productScore.criteriaScores.map((cs) => (
                            <Chip
                              key={cs.criterion.id}
                              label={`${cs.criterion.name}: ${cs.score}`}
                              size="small"
                              color={
                                cs.score >= 7
                                  ? "success"
                                  : cs.score >= 4
                                  ? "warning"
                                  : "error"
                              }
                              sx={{ fontWeight: 600, mb: 0.5 }}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TrendingUp />
              Detailed Score Breakdown
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    {criteria.map((criterion) => (
                      <TableCell
                        key={criterion.id}
                        align="center"
                        sx={{ fontWeight: 600 }}
                      >
                        {criterion.name}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          (Weight: {criterion.weight})
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedProducts.map((productScore) => (
                    <TableRow key={productScore.product.id}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {productScore.product.name}
                      </TableCell>
                      {productScore.criteriaScores.map((cs) => (
                        <TableCell key={cs.criterion.id} align="center">
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {cs.score}/10
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ({cs.weightedScore.toFixed(1)} weighted)
                            </Typography>
                          </Box>
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: getScoreColor(
                              productScore.weightedScore,
                              maxWeightedScore
                            ),
                          }}
                        >
                          {productScore.weightedScore.toFixed(1)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Results;
