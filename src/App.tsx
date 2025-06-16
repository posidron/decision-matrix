import {
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Paper,
  Step,
  StepLabel,
  Stepper,
  ThemeProvider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import CriteriaManager from "./components/CriteriaManager";
import ProductManager from "./components/ProductManager";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import Results from "./components/Results";
import ScoringMatrix from "./components/ScoringMatrix";
import { Criterion, Product, Score } from "./types";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366f1",
      light: "#818cf8",
      dark: "#4f46e5",
    },
    secondary: {
      main: "#ec4899",
      light: "#f472b6",
      dark: "#db2777",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      background: "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontSize: "0.875rem",
          "@media (max-width: 600px)": {
            fontSize: "0.875rem", // Keep same size on mobile for vertical stepper
            whiteSpace: "normal",
            wordWrap: "break-word",
          },
        },
        labelContainer: {
          "@media (max-width: 600px)": {
            width: "100%",
            maxWidth: "none",
          },
        },
      },
    },
  },
});

const steps = [
  "Add Products",
  "Define Criteria",
  "Score Products",
  "View Results",
];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Initialize default scores when products or criteria change
  useEffect(() => {
    if (products.length > 0 && criteria.length > 0) {
      const newScores: Score[] = [];
      products.forEach((product) => {
        criteria.forEach((criterion) => {
          const existingScore = scores.find(
            (s) => s.productId === product.id && s.criterionId === criterion.id
          );
          if (!existingScore) {
            newScores.push({
              productId: product.id,
              criterionId: criterion.id,
              value: 5,
            });
          }
        });
      });
      if (newScores.length > 0) {
        setScores((prevScores) => [...prevScores, ...newScores]);
      }
    }
  }, [products, criteria]);

  // Load shared data from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get("data");

    if (sharedData) {
      try {
        const decodedData = JSON.parse(atob(sharedData));
        if (
          decodedData.products &&
          decodedData.criteria &&
          decodedData.scores
        ) {
          setProducts(decodedData.products);
          setCriteria(decodedData.criteria);
          setScores(decodedData.scores);
          setActiveStep(3); // Go directly to results
        }
      } catch (error) {
        console.error("Failed to load shared data:", error);
      }
    }
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return products.length >= 2;
      case 1:
        return criteria.length >= 1;
      case 2:
        const requiredScores = products.length * criteria.length;
        const actualScores = scores.length;
        return actualScores >= requiredScores;
      default:
        return true;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <ProductManager products={products} setProducts={setProducts} />;
      case 1:
        return (
          <CriteriaManager criteria={criteria} setCriteria={setCriteria} />
        );
      case 2:
        return (
          <ScoringMatrix
            products={products}
            criteria={criteria}
            scores={scores}
            setScores={setScores}
          />
        );
      case 3:
        return (
          <Results products={products} criteria={criteria} scores={scores} />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PWAInstallPrompt />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
          py: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 0 },
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant={isMobile ? "h4" : "h3"}
              component="h1"
              align="center"
              sx={{
                mb: { xs: 2, sm: 4 },
                color: "white !important",
                fontWeight: 700,
                background: "none !important",
                WebkitBackgroundClip: "unset !important",
                WebkitTextFillColor: "white !important",
              }}
            >
              Decision Matrix
            </Typography>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              align="center"
              sx={{
                mb: { xs: 3, sm: 6 },
                color: "rgba(255, 255, 255, 0.8)",
                px: { xs: 2, sm: 0 },
              }}
            >
              Make informed decisions with weighted criteria analysis
            </Typography>
          </motion.div>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Stepper
              activeStep={activeStep}
              sx={{
                mb: { xs: 2, sm: 4 },
                "& .MuiStepConnector-root": {
                  display: { xs: "none", sm: "block" },
                },
                "& .MuiStep-root": {
                  px: { xs: 0, sm: 1 },
                },
              }}
              orientation={isMobile ? "vertical" : "horizontal"}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-labelContainer": {
                        overflow: "visible",
                      },
                      "& .MuiStepLabel-label": {
                        whiteSpace: "normal",
                        overflow: "visible",
                        textOverflow: "clip",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent(activeStep)}
              </motion.div>
            </AnimatePresence>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: { xs: 2, sm: 4 },
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 2, sm: 0 },
              }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                size={isMobile ? "medium" : "large"}
                fullWidth={isMobile}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === steps.length - 1 || !canProceed()}
                size={isMobile ? "medium" : "large"}
                fullWidth={isMobile}
                sx={{
                  background:
                    "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
                  color: "white",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #4f46e5 30%, #db2777 90%)",
                  },
                  "&:disabled": {
                    background: "rgba(0, 0, 0, 0.12)",
                    color: "rgba(0, 0, 0, 0.26)",
                  },
                }}
              >
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
