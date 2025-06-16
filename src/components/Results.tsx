import {
  Assessment,
  EmojiEvents,
  GetApp,
  Share,
  TrendingUp,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import React, { useRef, useState } from "react";
import { Criterion, Product, ProductScore, Score } from "../types";

interface ResultsProps {
  products: Product[];
  criteria: Criterion[];
  scores: Score[];
}

const Results: React.FC<ResultsProps> = ({ products, criteria, scores }) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

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

  const generateShareableLink = () => {
    try {
      const data = {
        products,
        criteria,
        scores,
        timestamp: Date.now(),
      };

      const encodedData = btoa(JSON.stringify(data));
      const shareableUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;

      navigator.clipboard
        .writeText(shareableUrl)
        .then(() => {
          setSnackbar({
            open: true,
            message: "Shareable link copied to clipboard!",
            severity: "success",
          });
        })
        .catch(() => {
          setSnackbar({
            open: true,
            message: "Failed to copy link to clipboard",
            severity: "error",
          });
        });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to generate shareable link",
        severity: "error",
      });
    }
  };

  const exportAsImage = async () => {
    if (!resultsRef.current) return;

    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `decision-matrix-results-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      setSnackbar({
        open: true,
        message: "Results exported as image!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to export image",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box ref={resultsRef}>
      <Typography
        variant={isMobile ? "h6" : "h5"}
        gutterBottom
        sx={{ fontWeight: 600, mb: 3 }}
      >
        Decision Matrix Results
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, fontSize: { xs: "0.875rem", sm: "1rem" } }}
      >
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 2 },
                mb: 2,
                flexDirection: { xs: "column", sm: "row" },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              <EmojiEvents sx={{ fontSize: { xs: 32, sm: 40 } }} />
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  fontWeight: 700,
                  wordBreak: "break-word",
                  hyphens: "auto",
                }}
              >
                Winner: {sortedProducts[0]?.product.name}
              </Typography>
            </Box>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{
                mb: 2,
                opacity: 0.9,
                textAlign: { xs: "center", sm: "left" },
              }}
            >
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
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}>
                    <TableCell
                      sx={{ fontWeight: 600, minWidth: { xs: 60, sm: "auto" } }}
                    >
                      Rank
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        minWidth: { xs: 120, sm: "auto" },
                      }}
                    >
                      Product
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        minWidth: { xs: 100, sm: "auto" },
                      }}
                    >
                      {isMobile ? "Score" : "Weighted Score"}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        minWidth: { xs: 150, sm: "auto" },
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
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
                            <Typography
                              variant={isMobile ? "body1" : "h6"}
                              sx={{ fontWeight: 600 }}
                            >
                              #{index + 1}
                            </Typography>
                          </Box>
                        </motion.div>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography
                            variant={isMobile ? "body2" : "h6"}
                            sx={{
                              fontWeight: 600,
                              wordBreak: "break-word",
                              hyphens: "auto",
                            }}
                          >
                            {productScore.product.name}
                          </Typography>
                          {productScore.product.description && !isMobile && (
                            <Typography variant="body2" color="text.secondary">
                              {productScore.product.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography
                            variant={isMobile ? "h6" : "h5"}
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
                      <TableCell
                        align="center"
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
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
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}>
                    <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>
                      Product
                    </TableCell>
                    {criteria.map((criterion) => (
                      <TableCell
                        key={criterion.id}
                        align="center"
                        sx={{ fontWeight: 600, minWidth: 80 }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {isMobile && criterion.name.length > 8
                            ? `${criterion.name.substring(0, 8)}...`
                            : criterion.name}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          (W: {criterion.weight})
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, minWidth: 80 }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedProducts.map((productScore) => (
                    <TableRow key={productScore.product.id}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            wordBreak: "break-word",
                            hyphens: "auto",
                          }}
                        >
                          {isMobile && productScore.product.name.length > 12
                            ? `${productScore.product.name.substring(0, 12)}...`
                            : productScore.product.name}
                        </Typography>
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
                            {!isMobile && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ({cs.weightedScore.toFixed(1)})
                              </Typography>
                            )}
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

      {/* Share Buttons */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          startIcon={<Share />}
          onClick={generateShareableLink}
          fullWidth={isMobile}
          sx={{
            background: "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(45deg, #4f46e5 30%, #db2777 90%)",
            },
          }}
        >
          Copy Shareable Link
        </Button>
        <Button
          variant="contained"
          startIcon={<GetApp />}
          onClick={exportAsImage}
          fullWidth={isMobile}
          sx={{
            background: "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(45deg, #4f46e5 30%, #db2777 90%)",
            },
          }}
        >
          Export as Image
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Results;
